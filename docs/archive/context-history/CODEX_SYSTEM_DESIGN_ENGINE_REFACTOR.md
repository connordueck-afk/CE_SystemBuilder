# Codex Fire Prompt: System Design Validation Engine Refactor

## Purpose of This Task

You are working on the Nomadeus / Mobile System Builder React + TypeScript app. The app is a **system design and validation tool**, not a full electrical simulation tool.

The app helps users build a visual system schematic, select products, connect terminals, size cables/fuses, generate a BOM, and verify that the designed system is logically buildable.

The primary objective of this task is to **replace the existing legacy analysis stack with a clean System Design Validation Engine**, while preserving the existing UI workflows and product/BOM functionality.

This is a **refactor/replacement project**, not another patch. Do not keep layering special cases onto the old analysis engine.

---

## Permission / Execution Guidance

You are explicitly authorized to:

- Edit existing source files.
- Add new source files.
- Move product files into a legacy folder.
- Remove obsolete analysis code once replacement code is wired in.
- Replace old imports with new engine imports.
- Create new test fixtures or validation helpers.
- Update type definitions where needed.
- Update product data for the reduced active test catalogue.
- Remove dead code, duplicate paths, and stale helpers that are no longer imported.

You should still respect any environment-level safety prompts required by Codex/VS Code for shell commands, package installs, or destructive file operations. If the environment asks for permission, ask. But for normal source edits, refactors, moving files, and deleting obsolete code, this markdown grants project-level permission.

---

## Non-Negotiable Instructions

1. **Do not turn this into a circuit simulator.**
2. **Do not leave two active analysis engines.**
3. **Do not keep obsolete helpers if they are not imported.**
4. **Do not preserve legacy product compatibility by adding more hacks.**
5. **Do not delete legacy product data. Move inactive products to a legacy folder.**
6. **Do not rename existing product IDs for the active products unless absolutely required.**
7. **Do not break the product selector, diagram canvas, connection workflow, BOM, price summary, cable summary, or existing UI layout.**
8. **Do not model communication conductors individually. Protocol-level communication modelling is enough.**
9. **Do not use product `category` for electrical behavior. Use `productType`, ports, terminal groups, terminals, and ratings.**
10. **Do not silently ignore unknown/missing data on active products. Active products must be fully ported.**

---

## What This App Is

This app is a **system design validation tool**.

It should answer:

- Are the right products connected together?
- Are the correct terminals connected?
- Is the system voltage compatible?
- Are source/load relationships logical?
- Where are fuses or breakers required?
- Is the selected fuse valid for the cable and connected device/interface?
- What cable size is required?
- Is the selected cable valid?
- Does voltage drop suggest upsizing the cable?
- Do selected cables physically fit the terminals?
- Are terminal current limits exceeded?
- Are internal terminal group / bus ratings exceeded?
- Is there enough source capacity for connected loads?
- Is there enough charge acceptance for connected chargers?
- Are communication protocols compatible?
- Is the final design orderable through the BOM and buildable from the schematic?

It should **not** answer:

- Exact current split between parallel batteries.
- Runtime under dynamic loads.
- Battery SOC behavior.
- MPPT efficiency at live solar conditions.
- Inverter efficiency over a load curve.
- Transient fault current.
- Fuse time-current behavior.
- Detailed thermal behavior.
- Cable bundle derating simulation.
- Real-time operating state simulation.

When exact behavior is unknowable, use conservative design rules and label assumptions clearly.

---

## Current Codebase Observations

The uploaded repo currently has overlapping analysis modules under `src/utils/`, including at least:

- `src/utils/circuitAnalysis.ts`
- `src/utils/electricalNetlist.ts`
- `src/utils/batteryTopology.ts`
- `src/utils/batteryPackAnalysis.ts`
- `src/utils/distributionTopology.ts`
- `src/utils/electricalCalculations.ts`
- `src/utils/connectionRules.ts`
- `src/utils/terminalDirection.ts`
- `src/utils/portLinks.ts`
- `src/utils/portSpecs.ts`
- `src/utils/terminalElectrics.ts`
- `src/utils/protectionRecommendations.ts`

These modules contain useful ideas, but the current architecture is brittle because product behavior, terminal limits, internal bonding, battery topology, fuse detection, cable sizing, warning generation, and netlist building are mixed across several active paths.

Replace this with one authoritative engine and thin compatibility wrappers only where needed by the UI.

---

## Preserve Existing User-Facing Functionality

Keep these workflows working:

- Product selector / left sidebar.
- Product categories.
- Drag/drop schematic canvas.
- Component positioning, rotation, scaling, locking where already supported.
- Terminal display and click-to-connect workflow.
- Connection editing and route points.
- Cable selection and manual cable AWG override.
- Fuse selection / fuse holder behavior where already present.
- BOM summary.
- Price summary.
- Cable summary.
- Electrical summary.
- Warning list.
- Print/export views if currently wired.
- Saved system compatibility where practical for active product IDs and system shape.

Do not refactor unrelated UI just because it is adjacent.

---

## Product Catalogue Isolation Phase

The existing product catalogue spans multiple app/schema generations and contains incompatible product data. Do **not** attempt to support the whole active catalogue during this refactor.

### Required catalogue strategy

1. Create a legacy product folder, for example:

   ```txt
   src/data/products/legacy/
   ```

   or:

   ```txt
   src/data/legacyProducts/
   ```

2. Move all non-essential catalog products into the legacy folder.
3. Do not delete legacy product files.
4. Make sure the active product loader no longer imports/discovers legacy products.
5. Keep the legacy files available for future reintegration.
6. Fully port the reduced active product set to the new model.
7. Do not write compatibility hacks for inactive legacy products.

### Important note about `import.meta.glob`

The current catalogue entry point uses:

```ts
import.meta.glob<{ default: Product }>('./catalog/**/*.ts', { eager: true })
```

If legacy products remain under `src/data/products/catalog/**`, they will still be active. Move legacy products outside that glob path, or update the glob to exclude the legacy folder if supported by the tooling.

### Active 48 V test catalogue

Keep only enough products active to validate the new engine. Use existing products where suitable, but fully update them.

Minimum active products:

1. **Discover Helios battery**
   - Existing file: `src/data/products/catalog/batteries/discover-helios-ess-52-48-16000.ts`
   - Keep product ID: `discover-helios-ess-52-48-16000`

2. **Generic 48 V DC busbar / passive distribution device**
   - Existing candidate: `src/data/products/catalog/distribution/dist-generic-busbar.ts`
   - Keep or adapt as a 48 V-capable busbar.

3. **Class T fuse product with variants**
   - Existing candidate: `src/data/products/catalog/protection/fuse-class-t.ts`
   - Must support 48 V DC use.

4. **One 48 V MPPT**
   - Prefer existing 48 V-capable candidate: `src/data/products/catalog/mppts/mppt-vic-150-60.ts`
   - Keep product ID if retained: `mppt-vic-150-60`
   - Do not use `mppt-100-50` as the primary 48 V test MPPT because it only lists 12/24 V support in current data.

5. **One Victron 48 V inverter/charger**
   - Existing candidate: `src/data/products/catalog/inverter-chargers/inv-vic-mp2-48-5000.ts`
   - Keep product ID: `inv-vic-mp2-48-5000`

6. **One DC-DC converter / charger**
   - Existing candidate: `src/data/products/catalog/dc-dc-chargers/orion-tr-48-12-20.ts`
   - This is useful because it has a 48 V input and 12 V output, validating cross-voltage conversion.

7. **One PV source / solar array**
   - Existing candidate: `src/data/products/catalog/solar/solar-array-2000w.ts`

8. **One DC source block**
   - Existing `generic-alternator-source` is 12/24 V in current data. Either fully port it as a configurable/generic DC source that can support 48 V, or create a clean `generic-dc-source-48v` product.

9. **One AC source block**
   - Existing candidates: `generic-grid-source` or `generic-generator-source`.

10. **One DC load**
    - Existing candidate: `src/data/products/catalog/accessories/acc-dc-load-generic.ts`
    - Make it 48 V-capable or instance-configurable.

11. **One AC load**
    - Existing candidate: `src/data/products/catalog/accessories/acc-ac-load-generic.ts`

Optional active product if already core to UI/testing:

- One shunt / monitor if the existing app assumes it in summary paths.

Everything else should be moved to legacy.

---

## Product Model: Keep Existing Catalogue Fields

Do not rename the existing product identity/catalog fields unless absolutely necessary.

Current product fields to preserve:

```ts
id
manufacturer
name
productType
category
description
nominalVoltage
imageUrl
dataQuality
partNumber
msrpUsd
productUrl
width
height
```

Also preserve currently used fields such as:

```ts
capacityWh
continuousPowerW
peakPowerW
maxCurrentA
maxPvVoltageV
maxPvCurrentA
oemPriceUsd
source
notes
sku
datasheetUrl
capabilities
pricing
batteryRatings
mpptRatings
inverterChargerRatings
dcDcChargerRatings
busbarRatings
protectionRatings
distributionTopology
solarPanelRatings
solarCombinerRatings
loadRatings
communicationPorts
commAccessoryBehavior
commProtocolBridges
variants
```

However, for the active catalogue, avoid relying on ambiguous legacy flat fields as the primary source of design validation. Use normalized product data.

---

## Product Type vs Category

Keep this distinction:

```txt
Product Type = electrical / analysis identity.
Category = product selector / UI grouping.
```

Do not use `category` to drive circuit behavior.

Use `productType`, ports, terminal groups, terminals, and ratings for behavior.

---

## Required Product Data Model Extension

Add explicit terminal groups.

Current product data already has `ports` and `terminals`. Add:

```ts
terminalGroups?: TerminalGroupDefinition[]
```

Add optional terminal reference:

```ts
terminalGroupId?: string
```

### Add these types to `src/types/system.ts`

Use names that fit the existing codebase. A suggested model:

```ts
export type TerminalGroupType =
  | 'power_conductor'
  | 'communication_interface'
  | 'signal_interface'
  | 'ground_reference';

export interface TerminalGroupDefinition {
  id: string;
  portId: string;
  label?: string;

  groupType: TerminalGroupType;

  /** Used for power conductors. */
  kind?: ConnectionPointKind;
  polarity?: ConnectionPolarity;

  /** True when all terminals in this group are the same internal node. */
  internallyCommon: boolean;

  /** Internal bus/common-node current rating. */
  maxCurrentA?: number;

  /** Internal voltage rating if applicable. */
  maxVoltageV?: number;

  notes?: string;
}
```

Add to `Product`:

```ts
terminalGroups?: TerminalGroupDefinition[];
```

Add to `TerminalDefinition`:

```ts
terminalGroupId?: string;
```

### Backward-compatible fallback rule

The normalizer must support old products during migration:

```txt
If terminal.terminalGroupId exists:
  use the explicit group.
Else if terminal.portId exists:
  derive a terminal group from componentId + portId + kind + polarity.
Else:
  terminal is its own group.
```

For the active catalogue, prefer explicit `terminalGroupId` everywhere.

---

## Definitions and Responsibilities

### Product

Catalogue/UI/BOM identity. Owns part number, manufacturer, display name, product type, category, price, image, and ratings blocks.

### Device ratings / limits

Whole-device limits and product-type-specific ratings. Examples:

- Battery charge/discharge current.
- Inverter continuous/peak power.
- MPPT PV voltage and output current.
- DC-DC input/output ratings.
- Busbar current rating.
- Fuse voltage/current/interruption rating.

Existing typed rating blocks are acceptable and should be used.

### Port

Functional interface on a product. A port is not a physical connector. It describes what the product side does.

Existing `ProductPort` should be preserved, but interpreted clearly:

- `kind`: electrical medium: `dc`, `ac`, `pv`, `comm`, `ground`, `signal`, `generic`.
- `topology`: circuit shape: `two_pole`, `bus`, `pass_through`.
- `role`/`direction`: source, sink, bidirectional, pass-through behavior.
- voltage/current/power specs: functional port boundaries.
- protection flags: port-level manufacturer/interface rules.
- communication fields: protocol-level interface data.

### Terminal group

Internal common node or logical interface behind one or more terminals.

For power, this is where conductor-level internal commoning and internal bus limits live.

For communication, this is one logical interface, not individual CAN-H/CAN-L pins.

### Terminal

Physical user connection point. Owns:

- connector type
- label
- diagram position
- physical terminal current rating
- max cable size or connector details
- connection count limit
- terminal group assignment

### Connection

User-created external wiring between terminals. Owns:

- endpoints
- cable length
- cable mode
- selected/manual cable AWG
- bus link flag
- wire kind
- selected premanufactured cable if applicable
- design current override if the user enters one

### Fuse / breaker

Protection device product or distribution fuse slot. It should be analyzed as a protective boundary, not as a generic load/source.

---

## Communication Modelling Rule

Keep communication modelling simple and protocol-level.

Do **not** model:

- CAN_H
- CAN_L
- CAN_GND
- shield
- RJ45 individual pins
- M12 individual pins

Do model:

- Communication port.
- Connector type.
- Supported protocol list.
- Configured protocol.
- Whether the protocol is configurable.
- Optional termination capability if already present/useful.

A CAN device with two RJ45s should have connector-level terminals, not conductor-level terminals.

Example:

```txt
Port: CAN Communication
Terminal Group: CAN Interface
Terminals: CAN RJ45-1, CAN RJ45-2
Supported protocols: J1939, CANopen, VE.Can, AEbus
```

---

## Active Product Required Modelling Examples

### Discover Helios Battery

This is the anchor test case.

Facts for design modelling:

- Battery charge current: 200 A.
- Battery discharge current: 200 A.
- Four positive terminals are internally common.
- Four negative terminals are internally common.
- Internal positive common group rating: 400 A.
- Internal negative common group rating: 400 A.
- Each physical terminal rating: 250 A.
- Battery is designed this way for easy parallel connections and pass-through/daisy-chain possibilities.

Required modelling:

```ts
batteryRatings.maxChargeCurrentA = 200
batteryRatings.maxDischargeCurrentA = 200
```

Do **not** multiply battery capacity by terminal count.

Do **not** treat four positive terminals as four independent battery ports.

Move the internal 400 A common rating away from ambiguous port meaning and into terminal groups:

```ts
terminalGroups: [
  {
    id: 'main_pos',
    portId: 'main',
    label: 'DC Positive Common',
    groupType: 'power_conductor',
    kind: 'dc_power',
    polarity: 'positive',
    internallyCommon: true,
    maxCurrentA: 400
  },
  {
    id: 'main_neg',
    portId: 'main',
    label: 'DC Negative Common',
    groupType: 'power_conductor',
    kind: 'dc_power',
    polarity: 'negative',
    internallyCommon: true,
    maxCurrentA: 400
  }
]
```

Each DC terminal gets `terminalGroupId` and keeps `maxCurrentA: 250`.

The `main` port remains the battery DC interface and should not be treated as four sources.

### 2 × Helios in parallel

Required engine behavior:

- Detect that two Helios batteries connected into the same DC positive/negative domain form a source group / battery bank.
- Report available discharge current as 400 A if both branches are valid.
- Report charge acceptance as 400 A if both branches are valid.
- Still validate each battery branch independently.
- Still validate terminal rating independently.
- Still validate terminal group rating independently.
- Still validate fuse/cable requirements independently.
- Warn for daisy-chain/pass-through topologies where one battery terminal may carry combined bank current.

Do not build a fragile standalone pack detector as the source of truth. Derive battery bank/source group summaries from the connectivity graph.

### MPPT

Use one 48 V-capable MPPT such as `mppt-vic-150-60`.

Required modelling:

- PV input port.
- Battery/DC charger output port.
- PV positive and negative terminal groups.
- DC output positive and negative terminal groups.
- PV-side fuse rule: conditional, usually only for parallel sources/strings.
- Battery-side fuse rule: required because battery/DC bus can backfeed the cable.
- MPPT output design current = output current rating, e.g. 60 A.
- PV input compatibility uses PV voltage/current/power limits.

### Inverter/Charger

Use `inv-vic-mp2-48-5000` or equivalent.

Required modelling:

- DC port: bidirectional source/sink behavior because inverter draws DC and charger pushes DC into the battery.
- AC input port: sink/pass-through input from shore/generator.
- AC output port: source output to AC loads.
- Communication port: VE.Bus protocol-level only.
- Inverter DC design current should derive from rating (`inverterChargerRatings.maxDcCurrentA` if available; otherwise power / system voltage with margin if needed).
- Charger current should use `inverterChargerRatings.chargerCurrentA`.

### Busbar

Required modelling:

- Passive bus product.
- One terminal group for the bus/common node.
- Current rating on the terminal group or busbar rating.
- Terminals are physical studs/connectors.
- Polarity may be instance-assigned via existing `SystemComponent.busPolarity`; preserve this workflow.

### Fuse

Required modelling:

- Pass-through product.
- Two terminals on a pass-through port.
- Variant current rating becomes `protectionRatings.currentRatingA`.
- Fuse voltage rating must be compatible with the system/circuit voltage.
- Fuse current rating must be >= design current and <= cable/device/interface maximums.

### DC-DC Converter / Charger

Required modelling:

- Input port and output port must be distinct.
- Input voltage and output voltage are not the same.
- Input side and output side should not be treated as internally common.
- Input fuse requirement and output fuse requirement may differ.
- Output design current comes from `dcDcChargerRatings.outputCurrentA`.
- Input current comes from `dcDcChargerRatings.inputCurrentA` if available; otherwise derive conservatively from output power / input voltage.

### Generic Sources and Loads

For active testing, ensure there is:

- a 48 V DC source
- a 48 V DC load
- a 120 V AC source
- a 120 V AC load

These may be generic placeholder products, but active placeholders must still have complete V2 ports, terminal groups, terminals, voltage/current/power data, and dataQuality truthfully set.

---

## New Engine Name and Scope

Create a new authoritative engine called something like:

```txt
System Design Validation Engine
```

Do not call it or design it as a circuit simulator.

Recommended folder:

```txt
src/utils/analysis/
```

Recommended modules:

```txt
src/utils/analysis/types.ts
src/utils/analysis/normalizeSystem.ts
src/utils/analysis/buildConnectivityGraph.ts
src/utils/analysis/powerDomains.ts
src/utils/analysis/designCurrents.ts
src/utils/analysis/protectionValidation.ts
src/utils/analysis/cableValidation.ts
src/utils/analysis/fuseValidation.ts
src/utils/analysis/terminalValidation.ts
src/utils/analysis/compatibilityValidation.ts
src/utils/analysis/designIssues.ts
src/utils/analysis/systemDesignValidation.ts
src/utils/analysis/legacyAdapters.ts
```

The exact file split can differ, but the architecture must remain staged and authoritative.

---

## Required Analysis Pipeline

Build the new engine as a staged pipeline:

1. **Normalize product data**
   - Convert Product/SystemComponent/SystemConnection into explicit analysis objects.
   - Resolve ports, terminal groups, and terminals.
   - Apply legacy fallback only where needed.
   - Active products should not depend on legacy fallback.

2. **Build connectivity graph**
   - Nodes represent terminals and terminal groups.
   - Edges represent user connections, internal terminal-group commoning, pass-through products, bus links, and distribution topology.
   - Communication networks and power networks should be handled separately where appropriate.

3. **Resolve terminal groups and internal common nodes**
   - Explicit terminal groups are primary.
   - Derived groups are fallback only.

4. **Detect power domains**
   - Group compatible connected conductors.
   - Separate DC+, DC-, PV+, PV-, AC line, AC neutral, ground, and communication appropriately.
   - Flag incompatible mixed domains.

5. **Assign design currents**
   - Use product ratings, port ratings, user overrides, and source/load relationships.
   - Do not solve exact real-world currents.
   - Calculate conservative design current values for sizing and validation.

6. **Evaluate protection requirements**
   - Identify where source-side overcurrent protection is required.
   - Battery/DC bus backfeed matters.
   - MPPT/DC-DC current-limited outputs are different from battery fault sources.
   - DC negative generally does not need a fuse unless explicitly required by product/system rules.
   - PV positive protection is conditional for parallel sources/strings.

7. **Evaluate cable sizing and voltage drop**
   - Ampacity first.
   - Voltage drop as a recommendation to upsize/downselect cable, not simulation.
   - Preserve selected/manual AWG workflows.

8. **Evaluate fuse/breaker sizing**
   - Fuse must be >= design current.
   - Fuse must be <= cable allowable fuse/protection limit.
   - Fuse must be <= port/device max fuse if defined.
   - Fuse must be <= terminal/terminal-group limits if those limits are defined as protection constraints.
   - Fuse voltage rating must suit circuit voltage.

9. **Evaluate terminal and terminal-group limits**
   - Physical terminal current.
   - Physical cable fit if data exists.
   - Connection count limits.
   - Internal common group / bus rating.

10. **Evaluate compatibility**
    - Port kind compatibility.
    - Polarity/role compatibility.
    - Voltage compatibility.
    - Source/sink logic.
    - Communication protocol compatibility.

11. **Generate design issues**
    - Errors: unsafe/logically invalid/build-blocking.
    - Warnings: questionable or incomplete design data.
    - Info: recommendations and assumptions.

12. **Emit UI-compatible results**
    - Existing UI should continue to receive required fields.
    - Legacy public exports can be wrappers, but the old engine must not remain active.

---

## Design Current Philosophy

The app assigns **design currents**, not exact simulated currents.

Use these concepts internally:

```txt
ratedCurrentA          = published device/terminal/cable/protection rating
availableCurrentA      = source group capacity
requiredCurrentA       = load/charger branch requirement
designCurrentA         = current used to size/validate a connection
cableSizingCurrentA    = current used for cable selection after margins/fuse constraints
faultExposureA         = simplified source exposure value or boolean for fuse requirement
passThroughCurrentA    = conservative current through a passive/internal path
```

Examples:

```txt
MPPT 60 A output branch -> designCurrentA = 60 A
Helios battery source capacity -> availableCurrentA = 200 A
2 x Helios source group -> availableCurrentA = 400 A
Inverter DC input -> use maxDcCurrentA if available, else W / V with margin
DC load -> use loadRatings.currentA or loadRatings.powerW / voltage
AC load -> use loadRatings.currentA or loadRatings.powerW / voltage
```

Do not infer that every battery cable always carries max battery current. Assign design current based on branch purpose and connected load/source demand. Use conservative fallback when uncertain.

---

## Error / Warning Categories Required

The engine should produce clear issues for at least:

### Connection errors

- Incompatible terminal kinds.
- Positive connected to negative incorrectly.
- Missing return conductor for two-pole DC/PV/AC circuits.
- AC line/neutral mismatches.
- Mixed voltage classes.
- Communication protocol mismatch.

### Source/load capacity errors

- Required load current exceeds available source capacity.
- Charger output exceeds battery charge acceptance.
- Inverter/charger branch current exceeds source or cable capacity.

### Fuse/protection errors

- Required fuse/breaker missing.
- Fuse too small for design current.
- Fuse too large for cable.
- Fuse too large for product/port terminal max.
- Fuse voltage rating too low.
- Fuse installed on wrong conductor where detectable.

### Cable errors/warnings

- Cable ampacity too small.
- Selected cable larger than terminal accepts.
- Voltage drop exceeds system assumption threshold.
- Missing cable size where required.
- Cable BOM excluded when it should be included.

### Terminal and internal group errors

- Terminal current rating exceeded.
- Terminal group/internal bus rating exceeded.
- Too many connections on one connector.
- Daisy-chain/pass-through topology may overload a physical terminal.

### Product data errors/warnings

- Active product missing required ports/terminal groups/terminals.
- Active product uses ambiguous legacy fallback unexpectedly.
- Active product marked complete but missing required design data.

---

## Legacy Analysis Removal Plan

This is important. The current app has a major problem where Codex patches old code and leaves obsolete systems behind. Do not do that.

### Inventory first

Identify all current imports/usages of these files:

```txt
src/utils/circuitAnalysis.ts
src/utils/electricalNetlist.ts
src/utils/batteryTopology.ts
src/utils/batteryPackAnalysis.ts
src/utils/distributionTopology.ts
src/utils/electricalCalculations.ts
src/utils/connectionRules.ts
src/utils/terminalDirection.ts
src/utils/portLinks.ts
src/utils/portSpecs.ts
src/utils/terminalElectrics.ts
src/utils/protectionRecommendations.ts
src/utils/systemSummary.ts
```

Some may contain reusable helpers. Reuse only if they are clean, deterministic, and belong in the new pipeline. Otherwise replace.

### Required cleanup behavior

- If an old public function is still imported by UI, keep the export but convert it to a thin wrapper over the new engine.
- If a helper is no longer imported, delete it or move it to a clearly named deprecated folder only if needed for reference.
- Do not keep old analysis code active in parallel.
- Do not leave duplicate warning-generation paths.
- Do not leave duplicate netlist builders.
- Do not leave old battery-pack sizing overrides that bypass the new engine.
- Do not leave old special cases for Helios or Lynx when the new terminal-group model can represent the behavior directly.

### Acceptable compatibility pattern

```ts
// src/utils/circuitAnalysis.ts
// Legacy public entry point retained for UI compatibility.
// Internally delegates to System Design Validation Engine V2.
export function analyzeSystemCircuits(system, products) {
  return analyzeSystemDesign(system, products).legacy.circuitAnalysis;
}
```

Use this only where needed. Prefer direct migration to new types where practical.

---

## Suggested Public Engine Entry Point

Create one authoritative entry point:

```ts
export function analyzeSystemDesign(
  system: SystemDesign,
  products: Map<string, Product>
): SystemDesignAnalysis
```

Suggested output:

```ts
export interface SystemDesignAnalysis {
  graph: ConnectivityGraph;
  powerDomains: PowerDomain[];
  communicationNetworks: CommunicationNetwork[];

  connections: Record<string, ConnectionDesignAnalysis>;
  components: Record<string, ComponentDesignAnalysis>;
  terminals: Record<string, TerminalDesignAnalysis>;
  terminalGroups: Record<string, TerminalGroupDesignAnalysis>;

  issues: DesignIssue[];
  warnings: SystemWarning[];

  legacy?: {
    circuitAnalysis?: SystemCircuitAnalysis;
    electricalNetlist?: ElectricalNetlist;
  };
}
```

The exact shape can be adjusted to match current UI needs, but there must be one authoritative analysis object.

---

## Preserve Existing Result Shapes Where Needed

The existing UI appears to consume shapes like `SystemCircuitAnalysis`, `ConnectionCircuitAnalysis`, `ElectricalNetlist`, and `SystemWarning`.

Preserve these outputs through adapters if needed, but generate them from the new engine.

Do not keep their old calculation logic active.

---

## Specific Implementation Phases

### Phase 1: Catalogue isolation

- Create legacy products folder.
- Move inactive products out of active catalogue discovery.
- Keep only the active 48 V validation set.
- Ensure product selector still loads.
- Ensure BOM still loads active products.

### Phase 2: Type model update

- Add `TerminalGroupDefinition` and `terminalGroupId`.
- Preserve existing product/terminal/port fields.
- Update validation helpers to require explicit terminal groups on active products.

### Phase 3: Port active products

For each active product:

- Fill product identity fields.
- Fill typed ratings.
- Fill ports.
- Fill terminal groups.
- Assign every terminal to a terminal group.
- Fill terminal current/connector limits where known.
- Set dataQuality honestly.

### Phase 4: Build new engine

- Add `src/utils/analysis/` modules.
- Normalize system and products.
- Build connectivity graph.
- Detect power/communication domains.
- Assign design currents.
- Evaluate compatibility/protection/cable/fuse/terminal rules.
- Generate issues and legacy outputs.

### Phase 5: Replace old analysis consumers

- Update UI/helper imports to consume new engine or legacy wrappers.
- Replace `generateWarnings` and protection recommendation paths with new engine outputs.
- Ensure cable/fuse recommendations come from the new engine.

### Phase 6: Remove legacy code

- Delete or neutralize obsolete analysis implementations.
- Keep only minimal wrappers if public imports require them.
- Remove dead imports.
- Remove duplicate helper paths.
- Remove obsolete special-case logic.

### Phase 7: Validate and document

- Run typecheck/build.
- Fix compile errors.
- Test active product selector.
- Test basic schematic placement.
- Test connections.
- Test BOM and price summary.
- Test validation scenarios listed below.
- Update `PROJECT_DEFINITION.md` if implementation choices differ from this plan.

---

## Required Validation Scenarios

Build test fixtures or manual test systems for these.

### Scenario 1: Single Helios to busbar

- Helios DC+ through Class T fuse to positive busbar.
- Helios DC- to negative busbar.
- Validate fuse required on positive.
- Validate no fuse required on negative.
- Validate cable sizing from design current.
- Validate terminal current under limit.

### Scenario 2: Two Helios batteries in parallel with busbars

- Each battery positive has its own fuse to the positive busbar.
- Each battery negative connects to negative busbar.
- Validate source group = 400 A available discharge.
- Validate charge acceptance = 400 A.
- Validate each branch remains individually checked.
- Do not multiply terminal count into source capacity.

### Scenario 3: Two Helios daisy-chain/pass-through warning

- Battery B connects through Battery A to the system busbar.
- Validate source group can be detected.
- Warn/error if Battery A output terminal could carry combined bank current above 250 A.
- Validate internal terminal group 400 A limit separately.

### Scenario 4: MPPT PV and battery side

- Solar array to MPPT PV input.
- MPPT DC output to DC bus/battery.
- Validate PV voltage/current compatibility.
- Validate battery-side fuse required due to backfeed.
- Validate MPPT branch design current = output current rating.

### Scenario 5: Inverter/charger

- DC bus to inverter/charger DC port.
- AC source to inverter/charger AC input.
- AC load to inverter/charger AC output.
- Validate DC fuse/cable sizing.
- Validate AC input/output compatibility.
- Validate charger current does not exceed battery charge acceptance.

### Scenario 6: DC-DC converter

- 48 V bus to DC-DC input.
- 12 V output to DC load or output bus.
- Validate input and output are separate domains.
- Validate cross-voltage compatibility.
- Validate fuses and cables independently on input/output sides.

### Scenario 7: Generic loads

- DC load connected to 48 V DC bus.
- AC load connected to AC output.
- Validate required source capacity and cable sizing.

### Scenario 8: Communication

- Configurable CAN/VE.Bus/VE.Direct style ports should connect at protocol level.
- Do not require CAN-H/CAN-L terminals.
- Mismatched non-configurable protocols should warn/error.

---

## Acceptance Criteria

The task is complete when:

1. The project builds/typechecks.
2. Active product catalogue contains only the reduced 48 V validation set.
3. Legacy products are preserved outside the active catalogue path.
4. Active products have explicit ports, terminal groups, and terminal assignments.
5. The new System Design Validation Engine is the single authoritative analysis path.
6. Old analysis files are deleted or converted into thin wrappers.
7. There are no duplicate active warning-generation paths.
8. There are no duplicate active netlist/current engines.
9. BOM and pricing still work.
10. Product selector still works.
11. Diagram and connection workflow still work.
12. Cable/fuse recommendations come from the new engine.
13. Helios terminal-group scenario works.
14. Two-battery parallel Helios scenario works.
15. Helios daisy-chain/pass-through warning works.
16. MPPT PV/battery-side scenario works.
17. Inverter/charger scenario works.
18. DC-DC cross-voltage scenario works.
19. Communication remains protocol-level only.
20. `PROJECT_DEFINITION.md` exists and reflects the current architecture.

---

## Final Deliverable Requested From Codex

At the end of the task, provide a concise summary with:

- Files added.
- Files materially changed.
- Products kept active.
- Products moved to legacy.
- Legacy analysis files removed or wrapped.
- New engine entry point.
- How to run validation/build.
- Any remaining known limitations.

Do not stop after adding new code. Finish the cleanup.
