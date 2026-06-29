# Project Definition: Nomadeus / Mobile System Builder

## Purpose

Nomadeus / Mobile System Builder is a React + TypeScript system design application for building visual electrical system layouts. It is intended to help users select products, connect them into a schematic, validate compatibility, choose cables and fuses, and generate an orderable BOM.

This project is a **system design and validation tool**, not a circuit simulator.

The app should help a user answer:

- What products do I need?
- How should they connect?
- Are the terminals compatible?
- Are the voltages compatible?
- Where are fuses/breakers needed?
- What fuse ratings are appropriate?
- What cable sizes are required?
- Is voltage drop acceptable or should cable be upsized?
- Are terminal, cable, fuse, and internal bus ratings respected?
- Is the BOM complete enough to order and build the system?

The app should not attempt to model runtime behavior, efficiency curves, SOC, dynamic current sharing, transient fault behavior, thermal behavior, or detailed real-world simulation.

---

## Core Scope

In scope:

- Product catalogue and product selector.
- Visual schematic layout.
- Drag/drop parts.
- Product images / SVGs.
- Physical terminals on products.
- User-created connections between terminals.
- Auto-routing and manual routing of connection lines.
- Cable size recommendation.
- Manual cable size override.
- Fuse/breaker requirement detection.
- Fuse/breaker rating validation.
- Terminal compatibility validation.
- Voltage compatibility validation.
- Source/load capacity validation.
- Battery/source group summaries.
- Communication protocol compatibility at the port level.
- BOM generation.
- Price summary.
- Cable summary.
- Warnings/errors/info for system design issues.

Out of scope:

- Full electrical simulation.
- Exact branch current solving.
- SOC/runtime simulation.
- Efficiency modelling.
- Thermal modelling.
- Fuse trip curves.
- Detailed harness pinout validation.
- Individual CAN-H/CAN-L/CAN-GND modelling.

---

## Product Catalogue Principles

Products are reusable catalogue definitions. Product identity and selector data should remain stable.

Important existing product fields:

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

Additional product/rating fields already exist and may be used:

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

Product IDs should be stable. Do not rename IDs casually because saved systems and BOM logic depend on them.

---

## Product Type vs Category

`productType` defines electrical/design behavior.

`category` defines UI grouping in the product selector.

Do not use category names for electrical behavior.

Examples:

```txt
productType: battery            -> energy storage behavior
productType: mppt               -> PV input + DC charger output behavior
productType: inverter_charger   -> DC bidirectional + AC input/output behavior
productType: busbar             -> passive common node behavior
category: Batteries             -> selector grouping only
category: Charging              -> selector grouping only
category: Distribution          -> selector grouping only
```

---

## Existing Product Catalogue Documentation Summary

The existing product README states:

- `src/data/products/index.ts` is the catalogue entry point.
- `src/data/products.ts` re-exports the catalogue for existing app code.
- Products are generally one file per product under `src/data/products/catalog/<category>/`.
- `import.meta.glob('./catalog/**/*.ts', { eager: true })` auto-discovers active products.
- Categories are for UI grouping only.
- Product types define electrical behavior.
- `validateCatalog()` and `assertCatalogValid()` exist under `src/data/products/helpers/validation.ts`.
- Helper functions exist under `src/data/products/helpers/catalogUtils.ts` and should be preferred over raw product field reads when appropriate.

The existing fuse catalogue markdown states:

- Fuse files follow naming like `fuse-{style}-{manufacturer}-{voltage}v.ts`.
- Fuse variant IDs follow `fuse-{style}-{manufacturer}-{voltage}v-{current}a`.
- Fuse UI grouping uses category/style, manufacturer, voltage rating, and variants.
- 58 V or higher DC fuses are needed for 48 V nominal systems because fully charged 48 V batteries can approach ~58 V.

---

## Active Catalogue Strategy During Analysis Refactor

The old catalogue spans multiple schema generations. During the System Design Validation Engine refactor, the active catalogue should be intentionally reduced.

Use a small 48 V validation catalogue and move all other products into a legacy folder outside active catalogue discovery.

Do not delete legacy products. Preserve them for reintegration after the engine is stable.

Minimum active products:

- Discover Helios battery: `discover-helios-ess-52-48-16000`
- Generic 48 V-capable busbar / passive distribution device
- Class T fuse product with variants
- One 48 V MPPT, preferably `mppt-vic-150-60`
- Victron 48 V inverter/charger, preferably `inv-vic-mp2-48-5000`
- One DC-DC converter, preferably `orion-tr-48-12-20`
- One PV source / solar array
- One 48 V DC source
- One 120 V AC source
- One 48 V DC load
- One 120 V AC load

Active products should have complete current-generation product data.

---

## Data Quality

Existing `DataQuality` values:

```ts
'complete' | 'partial' | 'placeholder'
```

Meanings:

- `complete`: all key fields verified against reliable manufacturer data.
- `partial`: key fields present, but some specs are estimated or incomplete.
- `placeholder`: generic stand-in or incomplete product.

Active test products may be placeholders only if they still contain complete enough data for validation and are clearly marked as placeholders.

---

## Core Electrical Model

The intended model is:

```txt
Product
  Ports
  Terminal Groups
  Terminals
```

### Product

Catalogue item. Owns identity, ratings, pricing, image, physical dimensions, and UI/product metadata.

### Port

Functional interface on a product. A port is not a physical connector.

A port describes:

- electrical medium: DC, AC, PV, communication, signal, ground
- circuit shape: two-pole, bus, pass-through
- source/sink/pass-through behavior
- voltage/current/power limits
- protection requirements
- communication protocol options if communication

Existing port type:

```ts
ProductPort
```

Important existing fields:

```ts
id
label
kind
topology
role
direction
voltageClass
nominalVoltageV
voltageMinV
voltageMaxV
maxCurrentA
maxPowerW
maxPowerByVoltageW
phases
requiresOvercurrentProtection
requiresDisconnect
recommendedFuseA
maxFuseA
connectorType
supportedProtocols
configuredProtocol
isConfigurable
commTopology
gender
```

### Terminal Group

Internal common node or logical interface behind one or more terminals.

For power, terminal groups are required to represent internal common conductors and their limits.

For communication, terminal groups should represent the whole communication interface, not individual wires.

Suggested type:

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
  kind?: ConnectionPointKind;
  polarity?: ConnectionPolarity;
  internallyCommon: boolean;
  maxCurrentA?: number;
  maxVoltageV?: number;
  notes?: string;
}
```

### Terminal

Physical connector the user wires to.

A terminal owns:

- physical label
- connector type
- canvas position
- physical current rating
- physical cable constraints
- maximum connection count
- terminal group assignment

Existing `TerminalDefinition` should be preserved and extended with:

```ts
terminalGroupId?: string
```

---

## Terminal Group Fallback Rule

For migration:

```txt
If terminal.terminalGroupId exists:
  use explicit terminal group.
Else if terminal.portId exists:
  derive group from componentId + portId + kind + polarity.
Else:
  terminal is its own group.
```

For active products, explicit terminal groups are preferred.

---

## Communication Modelling

Communication is protocol-level only.

Do not model:

- CAN_H
- CAN_L
- CAN_GND
- shield
- individual RJ45 pins
- individual M12 pins

Do model:

- communication port
- connector type
- supported protocol list
- configured protocol
- whether the protocol is configurable
- optional termination support when useful

Example:

```txt
Port: CAN Communication
Terminal Group: CAN Interface
Terminals: RJ45-1, RJ45-2
Protocols: J1939, CANopen, VE.Can, AEbus
```

---

## System Design Validation Engine

The project should have one authoritative design validation engine.

This engine should validate a system design, not simulate electrical operation.

Recommended entry point:

```ts
export function analyzeSystemDesign(
  system: SystemDesign,
  products: Map<string, Product>
): SystemDesignAnalysis
```

Recommended folder:

```txt
src/utils/analysis/
```

Recommended pipeline:

1. Normalize product and system data.
2. Build connectivity graph.
3. Resolve terminal groups and internal common nodes.
4. Detect power domains and communication networks.
5. Assign design currents.
6. Evaluate protection requirements.
7. Evaluate cable sizing and voltage drop.
8. Evaluate fuse/breaker sizing.
9. Evaluate terminal and terminal-group limits.
10. Evaluate compatibility.
11. Generate errors/warnings/info.
12. Emit UI-compatible results.

---

## Design Current Philosophy

Use design currents, not simulated currents.

Important terms:

```txt
ratedCurrentA          published rating
availableCurrentA      source group capacity
requiredCurrentA       load/charger requirement
designCurrentA         value used for sizing/validation
cableSizingCurrentA    final cable-sizing basis after margins/fuse constraints
faultExposureA         simplified source exposure for protection decisions
passThroughCurrentA    conservative current through passive/internal paths
```

Examples:

- MPPT 60 A output branch uses 60 A design current.
- Helios battery source capacity is 200 A.
- Two Helios batteries in parallel can provide 400 A if both are connected through valid branches.
- A 5000 W inverter on 48 V should use the published DC current rating if available; otherwise derive from W/V with margin.

---

## Fuse and Cable Rules

The app should determine:

- Whether a fuse/breaker is required.
- Where protection should be located.
- Whether selected protection is large enough for design current.
- Whether selected protection is too large for the cable.
- Whether selected protection violates product/port/terminal max fuse limits.
- Whether fuse voltage rating is valid.
- Whether selected cable ampacity is valid.
- Whether voltage drop suggests cable upsizing.
- Whether selected cable physically fits the terminals when data exists.

Port max fuse, cable ampacity, terminal current, and terminal group current are separate concepts. Do not collapse them into one field.

---

## Discover Helios Required Modelling

Discover Helios is the anchor product for terminal group logic.

Required facts:

- Battery charge current: 200 A.
- Battery discharge current: 200 A.
- Four positive terminals are internally common.
- Four negative terminals are internally common.
- Positive internal common rating: 400 A.
- Negative internal common rating: 400 A.
- Each physical terminal rating: 250 A.

The engine must not multiply source current by terminal count.

Correct interpretation:

```txt
Battery source capacity = 200 A
Battery charge acceptance = 200 A
Positive terminal group capacity = 400 A
Negative terminal group capacity = 400 A
Each terminal capacity = 250 A
```

Two Helios batteries in parallel should derive a 400 A source group, while still checking each branch, terminal, fuse, and cable independently.

---

## Existing System Types Summary

Important existing types are in:

```txt
src/types/system.ts
```

Important existing system objects:

```ts
SystemDesign
SystemComponent
SystemConnection
SystemAssumptions
SystemWarning
BomRow
PriceSummary
CableLengthSummaryItem
```

Important existing connection fields:

```ts
fromComponentId
fromTerminalId
toComponentId
toTerminalId
routePoints
routeMode
cableLengthFt
cableLengthUnit
designCurrentOverrideA
calculatedCurrentA
recommendedFuseA
recommendedCableAwg
manualCableAwg
cableColor
cableType
busLink
busType
voltageDropV
voltageDropPercent
wireKind
networkId
cableMode
premanufacturedCableId
includeInBOM
```

Preserve these where practical.

---

## Legacy Analysis Cleanup Rule

The old analysis stack must not remain active in parallel.

Legacy files may be deleted, replaced, or converted to thin wrappers over the new engine.

Known legacy/overlapping analysis files include:

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

Do not leave duplicate active engines.

---

## UI Preservation Rules

Preserve:

- product selector
- categories
- schematic canvas
- terminal rendering
- connection creation
- cable/fuse inspectors
- BOM summary
- price summary
- cable summary
- warning list
- print/export views where currently functional

Do not refactor UI unnecessarily while replacing the analysis engine.

---

## Agent Operating Instructions

When starting a new session:

1. Read this file first.
2. Treat this file as the source of project intent.
3. Do not assume the old product catalogue is authoritative.
4. Do not assume legacy analysis code is authoritative.
5. Prefer explicit ports, terminal groups, terminals, and ratings over old flat fields.
6. Preserve active product IDs and user-facing workflows.
7. Remove dead code when replacing systems.
8. Update this file when major architecture decisions change.

---

## Build/Validation Expectations

After major changes:

- Run TypeScript/build checks available in the project.
- Validate the active product catalogue.
- Confirm product selector still loads active products.
- Confirm schematic placement and connections work.
- Confirm warnings/errors show through the existing UI.
- Confirm BOM and price summaries still work.
- Confirm the Helios, MPPT, inverter/charger, DC-DC, busbar, fuse, source, and load scenarios work.

---

## Implemented Architecture (System Design Validation Engine refactor)

This section reflects the current implementation after the engine refactor.

### Active catalogue isolation

The catalogue is reduced to a fully-supported 48 V validation set under
`src/data/products/catalog/`. Inactive products were moved to
`src/data/products/legacy/` (see its `README.md`) — outside the loader glob
`import.meta.glob('./catalog/**/*.ts')`, so they are preserved but not loaded.
`DEFAULT_SYSTEM` and the single `SYSTEM_PRESETS` entry reference only active products.

Active set: Discover Helios ESS battery, generic 5-point busbar, Class T / ANL / MIDI
fuses, Victron MPPT 150/60 + 150/100, MultiPlus-II 48/5000, Orion-Tr 48/12-20 DC-DC,
2000 W + 400 W solar arrays, generic DC/AC sources, generic DC/AC loads, SmartShunt 500,
and the DC chassis / AC earth grounding symbols.

### Terminal-group product model

`src/types/system.ts` adds `TerminalGroupType`, `TerminalGroupDefinition`,
`Product.terminalGroups`, and `TerminalDefinition.terminalGroupId`. A terminal group is
the internal common node / logical interface behind one or more terminals, and carries the
internal bus current rating. Example: the Helios `main_pos` group is `internallyCommon`
with `maxCurrentA: 400` while each of its four DC+ posts is rated 250 A.

Explicit groups are declared on all 19 active products. Products where internal
commoning carries structural meaning (battery 4×DC+ common bus, busbar, fuse poles) carry
`internallyCommon: true` with a `maxCurrentA` limit. Simple single-terminal poles
(MPPT, inverter/charger, loads, sources, solar arrays, DC-DC, shunt, grounding symbols)
declare `internallyCommon: false` groups that serve as explicit port-to-terminal bindings.

### The engine — `src/utils/analysis/`

Single authoritative entry point `analyzeSystemDesign(system, products): SystemDesignAnalysis`,
consumed by `src/App.tsx` (the UI no longer calls the individual analysis modules). Stages:
normalize → connectivity graph + power domains → communication networks → design-current
sizing → validation (terminal, terminal-group bus, daisy-chain overload, capacity, domain
conflict, communication, product-data) → `DesignIssue[]` + `SystemWarning[]` → legacy
adapters (`legacy.circuitAnalysis | electricalNetlist | electricalSummary |
protectionRecommendations`).

The numeric sizing/summary/warning stages reuse the project's existing deterministic
modules as engine stages (per "reuse clean, deterministic helpers"); they are subordinate
to the single orchestrator and not independently invoked by the UI.

### Validation

`tests/electrical.test.ts` runs against the active catalogue through `analyzeSystemDesign`
(`npm test`, 16 tests green): terminal-group resolution (Helios, busbar), all 8 required
validation scenarios — Scenario 1 (single Helios branch), Scenario 2 (two Helios in
parallel, each branch checked independently), Scenario 3 (single-post combined-bank
overload), Scenario 4 (MPPT PV/DC-output domain separation), Scenario 5 (inverter/charger
DC + AC-in + AC-out three separate domains), Scenario 6 (DC-DC cross-voltage domain
separation), Scenario 7 (DC and AC generic loads), Scenario 8 (protocol-level
communication) — plus a `DEFAULT_SYSTEM` regression guard and 5 pure-helper tests.
`npm run typecheck` and `npm run build` are green.

