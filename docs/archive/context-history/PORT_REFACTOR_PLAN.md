# Port-Centric Product Model Refactor

Status: **in progress** · Started 2026-06-26

## Motivation

We keep adding devices with multiple connection points (multi-output DC-DC, hybrid
inverters, BMS/distribution modules, multi-connector comm buses). The current model
spreads electrical character across every terminal and duplicates it in per-type
ratings blocks. That has produced real problems:

- **Consistency is manual and fragile.** A terminal's grouping into an internal node
  is keyed on `portId :: kind :: polarity`, all of which live on the terminal. Forget
  to set polarity on a jack and the `+`/`−` sides silently bond into one node (a short
  in the solver). New terminals from the builder default to `polarity: undefined`.
- **Two parallel "port" systems.** Electrical grouping uses `Product.ports` + the
  terminal's `portId`. Communications use a *separate* `communicationPorts` array
  matched 1:1 to a terminal by shared `id`. A single comm bus with two physical
  connectors (Helios AEbus, an AEbus splitter) cannot be modelled cleanly.
- **No home for per-port voltage.** A device has one `nominalVoltage`, but a DC-DC is
  12 V in / 24 V out and an inverter/charger is 48 V DC / 120 V AC-in / 120 V AC-out.
  Today that lives in type-specific ratings blocks, disconnected from the terminals.

## The model (what lives where)

**Principle:** electrical character *at a connection boundary* lives on the **Port**;
the **Terminal** is a physical connector belonging to a port; intrinsic device facts
that are not boundary specs stay on the **Device**; numbers that relate two ports are
**derived**, not stored.

| Port (boundary spec) | Terminal (physical connector) | Device (intrinsic) | Derived / relational |
|---|---|---|---|
| `kind` (dc/ac/pv/comm/ground/signal/generic) | `portId` (required) | identity (id, mfr, name, P/N, SKU) | DC-DC output A ↔ input A |
| nominal voltage (+ min/max where applicable) | `polarity` (DC ±, AC line/neutral/ground) | price, dimensions, image | inverter continuous W ↔ DC draw |
| `maxCurrentA` (internal busbar / circuit rating) | `connector` (kind, gender, hole size) | **capacity** (Wh/Ah), chemistry | throughput numbers tying efficiency across ports |
| `role` / `direction` (whole-port power flow) | per-jack `maxCurrentA` (jack cap) | continuous/peak **power**, efficiency | |
| `phases` (AC) | `label`, `offsetX/Y`, `side` | derate, thermal, BMS presence | |
| comm: `connectorType`, `supportedProtocols`, `configuredProtocol`, `isConfigurable`, `topology`, `gender` | `maxConnections`, `busLinkStandard`, `maxCableAwg`, `notes` | series/parallel rules | |
| protection requirement (`requiresOvercurrentProtection`, `requiresDisconnect`, recommended/max fuse) | `required`, `connectableTo` | | |

### Locked decisions

1. **Every device has ≥1 port; every terminal has a `portId`.** No loose terminals.
   A plain fuse becomes a one-port pass-through (in/out terminals on one port).
2. **Voltage/current move to ports.** Battery charge/cutoff/range voltages move onto
   the DC port. Capacity, chemistry, BMS presence stay in a slimmed device ratings block.
3. **Comms unify into ports.** `communicationPorts` is folded into `Product.ports` as
   `kind: 'comm'`. A comm port may own multiple terminals (the multi-connector bus case).
4. **Ratings blocks are slimmed,** not deleted: they keep only device-intrinsic fields
   (capacity, chemistry, efficiency, power, series/parallel rules). Everything
   boundary-shaped (voltage, current, phases) is removed once it lives on a port.
5. **UI summaries** read from ports where the headline equals a port spec, and fall back
   to a curated description/spec field for relational headline numbers ("30A DC-DC",
   "5kW inverter") that are not a single port's rating.
6. **Circuit shape is a `topology` axis, not a port kind.** `kind` = electrical medium
   (dc/ac/pv/comm), `topology` = `two_pole`/`bus`/`pass_through`. Keeps the two orthogonal
   so a fuse stays DC/AC-aware while being series, with no type-list explosion. `topology`
   drives bonding, +/- pairing, and pass-through current.

## Target type shapes (strawman)

```ts
type PortKind = 'dc' | 'ac' | 'pv' | 'comm' | 'ground' | 'signal' | 'generic';

type PortTopology = 'two_pole' | 'bus' | 'pass_through';  // circuit shape — orthogonal to kind

interface ProductPortBase {
  id: string;
  label?: string;
  kind: PortKind;                 // electrical medium: dc/ac/pv/comm/ground/signal
  topology: PortTopology;         // circuit shape: drives bonding, +/- pairing, pass-through
  role?: ConnectionRole;          // whole-port power flow
  direction?: TerminalDirection;
  notes?: string;
}

interface DcProductPort extends ProductPortBase {
  kind: 'dc';
  nominalVoltageV?: number;
  voltageMinV?: number;
  voltageMaxV?: number;
  maxCurrentA?: number;           // internal busbar rating incl. pass-through
  requiresOvercurrentProtection?: boolean;
  requiresDisconnect?: boolean;
  recommendedFuseA?: number;
  maxFuseA?: number;
}

interface PvProductPort extends ProductPortBase {
  kind: 'pv';
  maxVoltageV?: number;           // Voc
  maxCurrentA?: number;           // Isc
  maxPowerW?: number;
}

interface AcProductPort extends ProductPortBase {
  kind: 'ac';
  nominalVoltageV?: number;
  phases?: 1 | 2 | 3;
  maxCurrentA?: number;
}

interface CommProductPort extends ProductPortBase {
  kind: 'comm';
  connectorType: CommunicationConnectorType;
  supportedProtocols: CommunicationProtocol[];
  configuredProtocol?: CommunicationProtocol;
  isConfigurable?: boolean;
  topology?: CommunicationTopologyType;
  gender?: 'male' | 'female';
}

interface GenericProductPort extends ProductPortBase {
  kind: 'ground' | 'signal' | 'generic';
  maxCurrentA?: number;
}

type ProductPort =
  | DcProductPort | PvProductPort | AcProductPort | CommProductPort | GenericProductPort;
```

Slimmed terminal (connector only):

```ts
interface TerminalDefinition {
  id: string;
  label: string;
  portId: string;                 // required after migration
  polarity?: ConnectionPolarity;  // distinguishes jacks within a port
  side: TerminalSide;
  offsetX: number;
  offsetY: number;
  connector?: TerminalConnector;
  maxCurrentA?: number;           // optional per-jack cap (< port rating)
  maxConnections?: number;
  busLinkStandard?: string;
  maxCableAwg?: string;
  required?: boolean;
  connectableTo?: string[];
  notes?: string;
}
```

Removed from terminal (now on port): `kind`, `role`, `direction`, `voltageClass`,
`maxVoltageV`, `voltageNominal/Min/MaxV`, `powerMaxW`, `maxPowerW`, `phases`,
`requiresOvercurrentProtection`, `requiresDisconnect`, `recommendedFuseA`, `maxFuseA`,
`electricalType`.

## Two axes: kind × topology

`kind` is the **electrical medium** (dc/ac/pv/comm/ground); `topology` is the **circuit
shape** (`two_pole`/`bus`/`pass_through`). They are orthogonal — a fuse is `pass_through`
and DC *or* AC; a busbar is `bus` and DC. Encoding circuit shape as its own axis (rather
than as dedicated port kinds like "fuse"/"passthrough") avoids losing the medium and
avoids a combinatorial type explosion (`dc_bus`, `ac_passthrough`, …).

`topology` drives three behaviours, all keyed off this one field:

| topology | bonds same-polarity terminals? | requires DC+/DC- pairing? | current in = out? |
|---|---|---|---|
| `two_pole` (battery, inverter DC, DC-DC side) | yes | yes | n/a |
| `bus` (busbar, battery posts) | yes | no | n/a |
| `pass_through` (fuse, breaker, shunt) | **no** | no | yes |

## Grouping rule after refactor

Link-group key is `portId :: kind :: polarity`, **but only for ports that bond**
(`topology !== 'pass_through'`). Kind resolves port-first. The consumers that compute
grouping — [portLinks.ts](src/utils/portLinks.ts) (the single source),
[TerminalLayer.tsx](src/components/schematic/TerminalLayer.tsx),
[electricalCalculations.ts](src/utils/electricalCalculations.ts), and
[electricalNetlist.ts](src/utils/electricalNetlist.ts) (via `portLinkPairs`) — all go
through that one helper. An untyped port (mid-migration) bonds, preserving legacy behaviour.

## Migration phases

Blast radius: ~300 consumer references across 36 non-catalog files; ~203 catalog files.
Strategy is **transitional accessors first** so the engine stops reading raw shapes
before we rewrite the data, then a scripted data migration, then removal of legacy.

- **Phase 1 — Types (additive, non-breaking).** Add the typed port fields and `PortKind`
  to `system.ts` as optional extensions; keep `busRatingA` and all terminal fields so
  every existing product still compiles.
- **Phase 2 — Accessor layer.** New `portSpecs.ts` helpers: `portKindOf`, `portVoltage`,
  `portMaxCurrent`, `terminalKind(terminal, product)`, etc. — read port-first, fall back
  to legacy terminal/flat/ratings fields. Repoint the electrical engine + UI at these
  helpers without changing any product file.
- **Phase 3 — Data migration script.** Extend `scripts/migrate-products.ts` to derive a
  `ports` array from each product's terminals + ratings, assign `portId` to every
  terminal, fold `communicationPorts` into comm ports, and strip duplicated fields.
  Run across all 203 files; typecheck + spot-check.
- **Phase 4 — Remove legacy.** Delete migrated-away terminal/flat/ratings fields from the
  types and products; make `portId` required; remove the legacy fallbacks from the
  accessors. Slim the ratings blocks.
- **Phase 5 — Builder UI overhaul.** Port-first editing: define ports (typed by kind with
  the right settings), then attach terminals to a port (polarity/connector/location only).
  Replace the separate comm-port editor.
- **Phase 6 — Validators / tests / docs.** Update connection validation and warnings to
  port semantics, add a validation that every terminal has a valid `portId`, refresh
  `src/data/products/README.md` and the catalog authoring guide.

## Test baseline

The harness was broken (`npm test` died on Vite's `import.meta.glob`). Fixed by a
dependency-free esbuild runner ([tests/run.mjs](tests/run.mjs)) that statically expands
the catalog glob at bundle time. The harness exposed 3 pre-existing failures that
asserted the *pre-consolidation* connector model (`stud→lug` from `getEffectiveConnector`,
flattened `mc4_male`/`mc4_female` kinds, `screw_terminal` cable ends). Commit 3157975
consolidated connectors to `kind`+`gender` and introduced ferrules but never updated those
tests. Fixed the tests to assert the real current contract (device-side connectors;
stud→lug priced, screw→ferrule unpriced at cable ends). **Baseline: 38 passed, 0 failed.**
Every phase must keep it green.

## Progress log

- ✅ Harness fixed; baseline 35/3 established.
- ✅ Phase 1 — typed port fields added (additive); typecheck clean.
- ✅ Phase 2a — `portSpecs.ts` accessor module (port-first, legacy fallback).
- ✅ Phase 2b (forward-compat critical parts) — port busbar rating reads
  `portMaxCurrentA`; link grouping unified into one port-first helper
  (`portLinks.linkGroupKey`) consumed by `electricalCalculations`, `TerminalLayer`,
  and (via `portLinkPairs`/`linkGroupSizes`) `circuitAnalysis` + `electricalNetlist`.
  Remaining raw `terminal.kind`/voltage reads are deferred to Phase 4, where they
  *must* switch to accessors as the legacy fields are deleted.
- ✅ Stale connector tests fixed → 38/0 green baseline.
- ✅ `topology` axis added (`two_pole`/`bus`/`pass_through`); bonding rule
  (`portLinks.linkGroupKey`) and DC+/DC- pairing rule (`electricalCalculations` rule 2)
  now gate on it. Backward-compatible (untyped port = bonds, legacy behaviour). 38/0 held.
- ✅ Phase 3 — migration script [scripts/migrate-to-ports.mjs](scripts/migrate-to-ports.mjs)
  ran against all 203 catalog products. Adds `portId` to every terminal and a typed
  `ports` entry (`kind` + `topology` + `role`/label) per circuit. Grouping is by terminal-id
  stem, so a device's two AC inputs split into separate ports (Quattro `ac_in`/`ac_in2`).
  Per-product before/after bonding diff gated every write; bus-topology products (busbars,
  distribution, combiners) intentionally bond and were verified against the full suite.
  **Spec values (voltage/current) deliberately NOT moved yet** — that happens in Phase 4
  with legacy-field removal so no rule changes behaviour mid-flight. typecheck clean, 38/0.
- ✅ Phase 3 locked in by guard tests (40/0): every terminal references a defined
  `portId`; every port declares `kind` and (non-comm) `topology`.
- ✅ Phase 4 (authority): `kind` is port-authoritative via `getEffectiveTerminals`
  stamping; spec **values** (voltage/current/power) now populated on every port by the
  migration. Suite held 40/0 — `port.maxCurrentA` did not trip the busbar rule spuriously.
  Ports are now the source of truth for kind/topology/voltage/current.
- ⚠ Phase 4 (physical removal) blocked on a type decision — see below.
- ✅ Phase 4 (authority, `voltageClass`): voltage class is now a port boundary spec.
  Added `ProductPort.voltageClass`; `getEffectiveTerminals` stamps the port-resolved
  value (port-first, legacy `terminal.voltageClass` fallback) via
  `portSpecs.terminalVoltageClass`, so `validateConnectionPair` reads a port-authoritative
  class with no call-site churn. `terminal.voltageClass` marked `@deprecated`. Added
  `connectionNominalVoltageV(class, polA, polB)` — derives volts *between two conductors*
  from service + polarity (120/240 split-phase reads 120 line→neutral, 240 line→line2);
  "derived, not stored". Behaviour-neutral (ports carry no `voltageClass` yet, so the
  fallback returns today's terminal value). 40/0, typecheck clean.

- ⏭ Phase 4 mechanism decided: have `getEffectiveTerminals` **stamp port-resolved
  `kind`/`role`/`direction`/`voltageClass`** onto effective terminals (the normal-path
  branch at [effectiveTerminals.ts:122](src/utils/effectiveTerminals.ts#L122)). Because
  nearly all engine code consumes effective terminals, this makes ports authoritative with
  no call-site churn, after which the source terminal fields can be deleted. The dynamic
  paths (PV branch / busbar / single-conductor) must keep their placement-based overrides.
  Behaviour-neutral while port values equal the migrated terminal values; verify with the
  suite, then remove legacy fields + slim ratings + make `portId`/`topology` required.
  Spec-value moves (port `maxCurrentA`) are coupled to validation rules (activating rule
  1c) — sequence those with the corresponding rule updates.

## Phase 3 — migration algorithm & safety invariant

**Invariant (must hold for every existing product): the set of bonded link-groups
must not change.** Bonding is keyed on `portId :: kind :: polarity`. Assigning a
`portId` where there was none, or merging two terminals under one port, can bond
terminals that must stay separate — e.g. a fuse's `in+` and `out+` are both DC-positive;
putting them on one port shorts the fuse in the solver. Verify by diffing
`analyzeSystemCircuits` / link-group output before and after on a fixture covering each
product type.

`topology` makes this safe: the migration assigns each port a `topology`, and bonding is
gated on it, so even one port holding a fuse's `in+`/`out+` can't short (a `pass_through`
port never bonds). Rules:

- **Preserve** every existing `portId` exactly — do not regroup products that already
  declare ports (battery `main`, DC-DC `input`/`output`, etc.). Backfill their `topology`.
- **Series elements** (fuse, breaker, `dcDisconnect`, shunt): one `pass_through` port
  holding all terminals. Not bonded, so in/out stay distinct nodes.
- **Parallel taps** (busbar points, battery posts, multi-jack output): one `bus` port.
- **Two-pole circuit** (battery main, inverter DC, each DC-DC side): one `two_pole` port
  holding both poles. Opposite polarity → separate link-groups, so no false bond.
- **Comm:** start 1:1 with the existing `communicationPorts` entry (by shared id),
  `kind: 'comm'`. Merging connectors onto one bus (Helios dual-LYNK, AEbus splitter) is a
  *manual, per-product* follow-up — auto-merging is unsafe.
- `topology` is derived from `productType`: protection/disconnect → `pass_through`,
  busbar/distribution → `bus`, everything else with poles → `two_pole`.

Per-port field population: `kind` from terminal kind; `nominalVoltageV` from the matching
ratings/flat field (falls back to device `nominalVoltage`); `maxCurrentA` from
ratings/flat/`busRatingA`; comm fields from the matched `communicationPorts` entry.
Legacy terminal/ratings/flat fields are **kept** in Phase 3 and removed in Phase 4.

Execution: a Node + esbuild script that loads each `catalog/**/*.ts` default export,
transforms it, and rewrites the file with the existing serializer. **Dry-run first** —
emit a per-product report and sample diffs, eyeball the series/parallel calls, run the
test suite against the migrated tree, and only then commit.

## Status: Phases 1–6 complete (authority level)

Done and green (40/0, typecheck clean):
- Model: `kind` × `topology` two-axis ports; all 203 products migrated with portId on every
  terminal and full specs (kind/topology/voltage/current/power) on ports.
- Ports are authoritative: `getEffectiveTerminals` stamps port-resolved `kind`; specs read
  via `portSpecs.ts`; bonding + DC+/− pairing gate on `topology`.
- Builder UI: per-port editor (kind/topology/voltage/current/power/phases/comm) + terminal
  `portId` assignment.
- Validation: `validateCatalog()` + test guards enforce portId/kind/topology.
- Docs: this plan + `src/data/products/README.md` Port Model section.

Deferred by decision (low value / high risk): **physical removal** of the now-deprecated
legacy fields (`terminal.kind`, voltage/current inside ratings blocks). Ports are already
authoritative and the accessor layer neutralizes the duplication; full deletion needs a
Source/Effective terminal type split and repointing ~300 references — a separate pass.

## Risks / watch items

- **Voltage source of truth.** Port voltage is optional and falls back to device
  `nominalVoltage` to avoid restating it on simple single-port devices.
- **Dynamic-polarity busbars.** Generic single-conductor busbars assign polarity per
  placed component (`busPolarity` / `inferredPolarity`). Keep that mechanism — the port
  is `kind: 'dc'` (or generic) and polarity stays dynamic at placement.
- **Flag-day avoidance.** `portId` stays optional in the type until Phase 4 so the
  migration isn't all-or-nothing.
- **Save files.** No users yet — default/preset systems are migrated in-repo, no runtime
  save migration needed.
