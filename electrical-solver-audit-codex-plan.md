# Electrical Solver Audit and Repair Plan for Codex

## Purpose

Repair the electrical solver in the Mobile System Builder app. This is not a UI cleanup task and not a warning-suppression task. The goal is to make the canonical analysis path produce correct branch currents, cable recommendations, fuse recommendations, and warnings from the product model.

The current observed bug is:

- An inverter/charger connected directly to a battery can show `0A` branch current.
- If an MPPT is then also connected to the battery, the inverter/charger branch current becomes non-zero.

That behavior is a solver-model bug. The inverter/charger branch current must be determined by the inverter/charger DC port demand and battery capability whether or not another source such as an MPPT is present.

This plan assumes a lesser Codex model. Follow the steps exactly, keep changes narrow, and add regression coverage before broad refactors.

---

## Current architecture observed in this source snapshot

The richer product model is present.

Relevant files:

```txt
src/types/system.ts
src/utils/analysis/systemDesignValidation.ts
src/utils/circuitAnalysis.ts
src/utils/electricalNetlist.ts
src/utils/electricalCalculations.ts
src/utils/effectiveTerminals.ts
src/utils/portSpecs.ts
src/utils/portLinks.ts
src/utils/communicationNetworks.ts
src/utils/terminalElectrics.ts
src/utils/connectorLimits.ts
src/utils/terminalConnectors.ts
src/data/cableAmpacity.ts
src/data/products/catalog/**
```

Canonical analysis path:

```ts
analyzeSystemDesign(system, PRODUCT_MAP)
  -> buildElectricalNetlist(...)
  -> analyzeSystemCircuits(...)
  -> buildCommunicationNetworks(...)
  -> generateWarnings(...)
```

`App.tsx` enriches `SystemConnection` values from `analyzeSystemDesign(...).legacy.circuitAnalysis`, specifically:

```ts
calculatedCurrentA: connectionAnalysis.designCurrentA
recommendedFuseA: connectionAnalysis.recommendedFuseA
recommendedCableAwg: connectionAnalysis.recommendedCableAwg
```

Therefore, all fixes must feed the canonical solver. Do not fix only the inspector, summary panels, schematic labels, or warnings.

---

## Core product-model rules to preserve

The intended model is:

```txt
Product
  -> ProductPort[]
  -> TerminalGroupDefinition[]
  -> TerminalDefinition[]
```

Responsibilities:

```txt
ProductPort
  - Owns electrical/communication boundary behavior.
  - Owns kind: dc, ac, pv, comm, ground, signal, generic.
  - Owns topology: two_pole, bus, pass_through.
  - Owns role/direction: source, sink, bidirectional, bus, etc.
  - Owns port-level current/power/voltage/protocol limits.

TerminalGroupDefinition
  - Owns conductor/interface grouping.
  - Owns polarity for power conductors.
  - Owns internal commoning and group/bus current limits.
  - Owns conductor-specific OCP requirements, recommended fuse, max fuse.

TerminalDefinition
  - Owns physical connector/jack data.
  - Owns placement and label.
  - Owns per-terminal physical current/contact limit.
  - Owns cable acceptance constraints: min/max/recommended cable size.
```

Do not move electrical behavior down into terminals. Terminals are not source/load devices.

---

## Audit findings

### Finding 1 — Direct battery to inverter/charger can show 0A because terminal ratings are used as operating current too early

In `src/utils/circuitAnalysis.ts`, `terminalCurrents()` currently does this before the `product.productType` switch:

```ts
const declaredA = linkSize > 1 ? null : resolveTerminalCurrentA(terminal, voltage);
if (declaredA != null) {
  ...
  // bidirectional with declared current => storage-like behavior
  return {
    normalLoadCurrentA: 0,
    normalSourceCurrentA: 0,
    hasNormalSource: true,
    hasLoadFollowingSource: true,
    canReceiveCurrent: true,
    sourceCapabilityA: declaredA,
  };
}
```

For a Victron MultiPlus-II DC terminal, `EffectiveTerminal.maxCurrentA` resolves to 250A through terminal/group/port fallback. Because the DC port is bidirectional, the terminal-first branch returns a storage-like capability and exits before this inverter/charger logic runs:

```ts
case 'inverter_charger': {
  if (terminal.kind === 'dc_power') {
    const inverterDrawA = ...;
    const chargerA = ...;
    loadA = inverterDrawA;
    sourceA = chargerA;
    ...
  }
}
```

That makes the inverter/charger look like a battery-like passive storage node instead of a load/source conversion device. When connected only to a battery, both sides can have capability but no demand, so the branch resolves to `0A`. When an MPPT is added, the MPPT contributes a normal source current to the graph, causing unrelated current to appear on the inverter/charger branch.

#### Required repair

Remove terminal physical current ratings from operating-current seeding.

`terminal.maxCurrentA`, `terminalGroup.maxCurrentA`, and `port.maxCurrentA` are ratings/limits. They are not automatically branch operating current. They must be used for validation and limits, not as product demand unless the product is a deliberately generic source/load with no better typed rating.

---

### Finding 2 — Return conductors are still not fully modeled as paired branch current

`circuitAnalysis.ts` has a second pass named `buildPairedConductorSizingFloors()`.

That pass only influences `cableSizingCurrentA`, not `designCurrentA`.

Current behavior:

```txt
DC+ branch designCurrentA may be correct.
DC- branch designCurrentA may be wrong or zero.
DC- cableSizingCurrentA may be raised later.
UI still displays Branch Current from designCurrentA.
Warnings may still consume designCurrentA.
```

This is incomplete. A two-pole leaf-device return conductor carries the same branch current as the matching positive conductor. It must not merely be upsized for cable selection.

#### Required repair

Add a design-current pairing pass, not just a cable-sizing floor pass.

Expected behavior:

```txt
Inverter/charger DC+ branch: designCurrentA = inverter DC demand, e.g. 250A.
Inverter/charger DC- return branch: designCurrentA = same branch current, e.g. 250A.
MPPT BAT+ branch: designCurrentA = MPPT output current, e.g. 50A.
MPPT BAT- branch: designCurrentA = same branch current, e.g. 50A.
DC load + branch: designCurrentA = load current.
DC load - branch: designCurrentA = same load current.
```

Aggregate negative trunks and shunts are different: they can carry the sum/max of multiple branch returns depending on topology and must remain topology-driven.

---

### Finding 3 — Existing source/load behavior is keyed too much from terminal kind and product type, not port + polarity

Examples in `terminalCurrents()`:

```ts
case 'mppt': {
  if (terminal.kind === 'pv_power') loadA = ...;
  else if (terminal.kind === 'dc_power') sourceA = ...;
}
```

Because both positive and negative DC terminals have `kind === 'dc_power'`, this can seed behavior on both conductors unless blocked elsewhere.

The solver should use:

```txt
port kind + port topology + port role + terminal group polarity
```

not just:

```txt
terminal.kind
```

#### Required repair

For two-pole power ports, seed source/load behavior only on active conductors:

```txt
DC: positive conductor only seeds source/load demand.
PV: positive conductor only seeds source/load/source array demand.
AC: line / line2 seed source/load demand.
Neutral, ground, DC-, PV- do not independently seed source/load demand.
```

Return/neutral conductors carry current, but that current is derived from the paired branch, not from independent product source/load behavior.

---

### Finding 4 — `availableCurrentA` still exists and is semantically dangerous

`src/utils/electricalNetlist.ts` still defines:

```ts
availableCurrentA?: number
```

and can set it from protection boundary ratings.

Even if old warnings have been removed, the field name is misleading. A branch fuse rating is not the available current of a whole net. This was previously one source of false errors where a 125A MPPT branch fuse could appear to cap unrelated inverter current on the same battery bus.

#### Required repair

Do not expose branch-fuse ratings as whole-net available current.

Preferred options:

1. Remove `availableCurrentA` from `ElectricalNet` and `ConnectionElectricalContext` if no longer required.
2. Or rename it to a scoped field such as `localProtectionLimitA` or `adjacentProtectionRatingA`, and document that it is not source capacity and must not be used for whole-net source/load checks.

Do not compare whole-net load current to a branch fuse rating.

---

### Finding 5 — Communication protocol belongs on communication ports, not terminal groups or terminals

The type model already has comm metadata on `ProductPort`:

```ts
ProductPort.kind === 'comm'
ProductPort.connectorType
ProductPort.supportedProtocols
ProductPort.configuredProtocol
ProductPort.isConfigurable
ProductPort.commTopology
ProductPort.gender
```

But `communicationNetworks.ts` still resolves communication metadata through legacy `ProductCommunicationPort[]` and assumes `connection.fromTerminalId` / `toTerminalId` are communication port IDs:

```ts
const port = product.communicationPorts.find((p) => p.id === portId);
```

This is wrong because `SystemConnection` stores terminal IDs, not port IDs.

Products can have multiple physical communication terminals on one logical communication port. Example: two RJ45 jacks sharing one CAN/LYNK interface. The protocol is a property of the port/interface, not the terminal jack.

#### Required repair

Make `ProductPort` the canonical source for communication metadata.

For any communication connection:

```txt
connection terminal ID -> effective terminal -> terminal.portId -> ProductPort(kind='comm')
```

Use `SystemComponent.configuredProtocols[portId]`, never `[terminalId]`, for configured protocol selection.

Keep `ProductCommunicationPort[]` only as a temporary migration fallback if needed. All new code should prefer `ProductPort`.

---

### Finding 6 — Cable min/max/recommended sizes need a proper endpoint constraint model

Current model has:

```ts
TerminalDefinition.maxCableAwg?: string
SystemComponent.maxCableAwg?: string
```

There is no terminal-level minimum cable size and no terminal-level manufacturer recommended cable size.

This matters because cable size limits are tied to both:

```txt
1. Physical connector/jack acceptance.
2. Product datasheet recommendation.
```

Connector kind alone is not enough. An M8 stud can physically accept many lug sizes, but a product datasheet may limit or recommend a narrower range. A screw terminal’s wire range depends on the specific terminal block, not only the fact that it is a screw terminal.

#### Required repair

Add cable acceptance metadata to `TerminalDefinition`:

```ts
minCableAwg?: string;
maxCableAwg?: string;          // already exists
recommendedCableAwg?: string;
```

Optional future extension:

```ts
recommendedCableAwgByVoltage?: Partial<Record<number, string>>;
recommendedCableAwgByCurrent?: Array<{ maxCurrentA: number; awg: string }>;
```

Keep connector defaults as fallback only. The terminal/product datasheet should win.

---

## Implementation instructions

### Phase 0 — Add regression harness before changing solver behavior

The uploaded zip contains only `src`, so there may be no visible test runner in this snapshot. In the actual repo root, inspect `package.json`. If Vitest already exists, use it. If not, add a minimal test setup appropriate for the Vite/React/TypeScript stack.

Suggested files:

```txt
src/utils/__tests__/electricalSolver.regression.test.ts
src/utils/__tests__/communicationPorts.regression.test.ts
src/utils/__tests__/cableLimits.regression.test.ts
```

Minimum test helper pattern:

```ts
import { analyzeSystemDesign } from '../analysis';
import { PRODUCT_MAP } from '../../data/products';
import type { SystemDesign } from '../../types/system';

function conn(id: string, fromComponentId: string, fromTerminalId: string, toComponentId: string, toTerminalId: string, extra = {}) {
  return {
    id,
    fromComponentId,
    fromTerminalId,
    toComponentId,
    toTerminalId,
    cableLengthFt: 3,
    ...extra,
  };
}
```

Use real active catalog products where practical:

```txt
inv-vic-mp2-12-3000
mppt-100-50
discover-helios-ess-52-48-16000 or another active battery with explicit terminals
generic busbar / shunt products available in catalog
```

If product IDs differ, search catalog and use equivalent active products.

---

### Phase 1 — Fix the inverter/charger 0A root cause

File:

```txt
src/utils/circuitAnalysis.ts
```

#### 1.1 Remove terminal-first operating current for typed products

In `terminalCurrents()`, the `declaredA = resolveTerminalCurrentA(...)` branch must not run before typed product behavior for normal catalog products.

Replace the current terminal-first block with a helper that only allows declared terminal current to seed operating current for generic fallback products.

Add helper:

```ts
function mayUseTerminalRatingAsOperatingCurrent(product: Product, terminal: EffectiveTerminal): boolean {
  if (product.productType === 'dc_load' || product.productType === 'ac_load') return true;
  if (product.productType === 'accessory' && product.dataQuality === 'placeholder') return true;
  // Optional: allow for deliberately generic source/load products with no typed ratings.
  if (product.productType === 'dc_source' || product.productType === 'ac_source') return true;
  return false;
}
```

If `dc_source` / `ac_source` are not actual product types, do not invent them unless TypeScript already supports them. Keep the helper aligned to existing `ProductType` values.

Then gate the declared current block:

```ts
const declaredA = mayUseTerminalRatingAsOperatingCurrent(product, terminal) && linkSize <= 1
  ? resolveTerminalCurrentA(terminal, voltage)
  : undefined;
```

For typed products such as `battery`, `mppt`, `inverter_charger`, `dc_dc_charger`, `shore_charger`, and `solar_array`, product-type/port-specific logic must run.

#### 1.2 Add active-conductor filtering

Add helpers near `busTypeFromTerminal` use:

```ts
function isActivePowerConductor(busType: BusType): boolean {
  return busType === 'dc_pos' || busType === 'pv_pos' || busType === 'ac_line' || busType === 'ac_line2';
}

function isReturnConductor(busType: BusType): boolean {
  return busType === 'dc_neg' || busType === 'pv_neg' || busType === 'ac_neutral' || busType === 'ac_ground' || busType === 'chassis_ground';
}
```

At the top of `terminalCurrents()` after `busType` is known:

```ts
if (isReturnConductor(busType)) {
  return {
    normalLoadCurrentA: 0,
    normalSourceCurrentA: 0,
    hasNormalSource: false,
    hasLoadFollowingSource: false,
    canReceiveCurrent: true,
    sourceCapabilityA: undefined,
  };
}
```

Do not use this to make DC- branch current zero. This only prevents DC- from independently seeding source/load demand. A later pairing/return propagation pass must set DC- branch `designCurrentA` correctly.

#### 1.3 Ensure inverter/charger DC positive seeds load demand

For `product.productType === 'inverter_charger'`, after removing the early terminal-rating return, the existing logic should execute.

Expected behavior for DC positive terminal of `inv-vic-mp2-12-3000`:

```txt
normalLoadCurrentA = 250A max DC current
normalSourceCurrentA = 120A charger current
hasNormalSource = true
canReceiveCurrent = true
sourceCapabilityA = 250A or max(250A, 120A)
```

Expected direct branch:

```txt
Battery DC+ -> inverter/charger DC+ = 250A design current
Battery DC- -> inverter/charger DC- = 250A design current after return pairing
```

#### Regression test

Create a system with one battery and one inverter/charger connected directly:

```txt
battery dc_pos -> inverter dc_pos
battery dc_neg -> inverter dc_neg
```

Assert:

```txt
positive branch designCurrentA > 0
positive branch designCurrentA approximately equals inverterChargerRatings.maxDcCurrentA
negative branch designCurrentA equals positive branch designCurrentA
```

Then add an MPPT to the same battery and assert the inverter/charger branch current does not change just because the MPPT exists.

---

### Phase 2 — Replace cable-only pairing with design-current pairing

File:

```txt
src/utils/circuitAnalysis.ts
```

Current second pass:

```ts
buildPairedConductorSizingFloors(...)
```

This only raises `cableSizingCurrentA`.

Add a new pass before the sizing-floor pass:

```ts
buildPairedConductorDesignCurrents(...)
```

Purpose:

```txt
For each two-pole leaf-device port, force the return branch design current to match the active conductor branch current.
```

Do not special-case MPPT or inverter/charger by product ID. Use the port model.

#### 2.1 Identify pairable leaf endpoints

A pairable endpoint is:

```txt
- product is a leaf power device
- product is not a busbar, fuse, breaker, shunt, disconnect, contactor, relay, distribution product, or communication accessory
- terminal belongs to a ProductPort with topology === 'two_pole'
- port kind is dc, pv, or ac
```

Use existing helpers where possible:

```ts
isLeafPowerDevice(product)
getTerminalPortId(product, terminal)
getTerminalPort(product, terminal)
busTypeFromTerminal(terminal)
```

#### 2.2 Group connections by leaf component and port

For every system connection and endpoint:

```txt
key = `${componentId}:${portId}`
collect active conductor connections: dc_pos, pv_pos, ac_line, ac_line2
collect return conductor connections: dc_neg, pv_neg, ac_neutral
ignore chassis ground for branch-current pairing unless product data explicitly models equipment-ground current, which V1 does not
```

For each group:

```txt
pairedCurrentA = max(designCurrentA of active conductor connections, designCurrentA of return conductor connections)
```

Then force all active and return branch design currents in the group to at least `pairedCurrentA`.

Important: this must affect `designCurrentA`, not only `cableSizingCurrentA`.

Suggested implementation pattern:

1. First pass: run `analyzeConnection(...)` for all connections.
2. Build `pairedDesignCurrents: Map<connectionId, number>` from first-pass results.
3. Second pass: rerun affected connections with `inferredDesignCurrentA = max(existing inferred, pairedDesignCurrent)`.
4. Third pass: run cable-sizing floor if still needed to account for selected fuse upsizing.

Do not shrink manual `designCurrentOverrideA`.

#### 2.3 Direct component-pair fallback

Also preserve a simple direct pair fallback:

```txt
If two components have both a dc_pos and dc_neg connection between them, pair those connection currents.
```

This catches simple direct battery/inverter cases even if port metadata is incomplete.

#### Regression tests

1. Battery -> inverter/charger direct positive/negative:

```txt
DC+ design current = I/C max DC current
DC- design current = same
```

2. Battery -> fuse -> inverter/charger positive, battery -> inverter/charger negative:

```txt
positive segment to inverter = I/C max DC current
negative branch = same
```

3. MPPT -> battery/bus:

```txt
BAT+ design current = MPPT output current
BAT- design current = same
```

4. DC load -> battery/bus:

```txt
positive and negative both equal load current
```

---

### Phase 3 — Treat aggregate negative trunks and shunts separately from leaf returns

Leaf returns are paired to their positive branch. Aggregate returns are not one leaf branch; they can carry multiple return currents.

Examples of aggregate return devices:

```txt
battery negative common
negative busbar
shunt
LYNX/distributor negative trunk
chassis negative trunk, if modeled
```

Do not use branch fuse rating as a fake return current. Instead, derive aggregate return current from connected return branches.

#### Minimum V1 behavior

For each DC negative connection that touches an aggregate return endpoint:

```txt
current = max downstream leaf return branch current observed across that cut
```

For shunts or negative trunk devices connected between battery negative and the rest of the system:

```txt
shunt/trunk current = max or sum of downstream simultaneous return currents, matching how positive bus current is currently summarized
```

Given the existing solver uses conservative design currents, use conservative aggregation:

```txt
If multiple independent loads can operate at once, sum them on shared trunk segments.
If branches are alternative modes of the same device port, use max.
```

Do not overbuild this into full time-domain power-flow simulation. This is still a schematic design-current solver.

#### Recommended implementation approach

Add a dedicated return-current propagation pass after active-conductor design current is known.

Pseudo-approach:

```txt
1. Build a DC- graph from all dc_neg connection/internal edges.
2. Seed each leaf-device negative terminal with that leaf port's paired active-conductor design current.
3. Mark battery negative terminals as return sinks/sources for the DC- graph.
4. For each DC- connection edge, compute the total seeded return current on one side of the cut that must return to the battery side.
5. Set designCurrentA for that DC- edge to that computed return current unless a user override is larger.
```

If this is too large for one Codex pass, implement Phase 2 first and add tests documenting current aggregate behavior. But do not add special-case overrides like “if shunt, use fuse rating.”

#### Regression tests

1. Two DC loads share one negative bus back through a shunt:

```txt
load1 return = load1 current
load2 return = load2 current
shunt/battery negative trunk = load1 + load2 current
```

2. MPPT and inverter/charger connected to same battery negative bus:

```txt
MPPT return branch = MPPT output current
I/C return branch = I/C DC demand
shared battery negative trunk/shunt = appropriate aggregate current
```

3. Battery-to-battery parallel interconnect:

```txt
inter-battery negative interconnect must not be forced to full pack fuse rating unless it actually carries full pack return current by topology
```

---

### Phase 4 — Clean up netlist `availableCurrentA`

File:

```txt
src/utils/electricalNetlist.ts
```

Search for:

```txt
availableCurrentA
```

Do one of the following:

Preferred:

```txt
Remove availableCurrentA from ElectricalNet and ConnectionElectricalContext.
```

If removal is too large:

```txt
Rename availableCurrentA to adjacentProtectionRatingA or localProtectionLimitA.
Update comments to say: this is not source capacity and must not be compared to whole-net load.
```

Check consumers:

```txt
src/components/summary/ElectricalSummary.tsx
src/utils/systemSummary.ts
src/utils/electricalCalculations.ts
src/utils/analysis/systemDesignValidation.ts
```

Do not show a branch fuse as “Available” for the whole net.

#### Regression test

System:

```txt
battery -> bus
MPPT branch protected by 60A or 125A fuse
inverter branch requires 250A
```

Assert:

```txt
MPPT branch fuse does not cap inverter branch current.
No source-capacity or overcurrent warning is created on inverter branch because of MPPT fuse.
Actually undersized inverter fuse still creates branch-level error.
```

---

### Phase 5 — Repair communication protocol ownership and endpoint resolution

Files:

```txt
src/types/system.ts
src/utils/communicationNetworks.ts
src/components/inspector/ConnectionInspector.tsx
src/components/inspector/ComponentInspector.tsx
src/dev/ProductBuilderApp.tsx
src/data/products/catalog/**
```

#### 5.1 ProductPort is canonical for comm protocol metadata

`ProductPort` already has:

```ts
connectorType?: CommunicationConnectorType;
supportedProtocols?: CommunicationProtocol[];
configuredProtocol?: CommunicationProtocol;
isConfigurable?: boolean;
commTopology?: CommunicationTopologyType;
gender?: 'male' | 'female';
```

Use these fields.

Mark `Product.communicationPorts?: ProductCommunicationPort[]` as legacy/deprecated in comments. Do not remove it immediately if many products still use it. Use it only as fallback during migration.

#### 5.2 Add endpoint resolver

In `communicationNetworks.ts`, replace `resolveCommPort(componentId, portId, ...)` with a resolver that takes a terminal ID and maps to a port.

Pseudo-code:

```ts
interface ResolvedCommEndpoint {
  component: SystemComponent;
  product: Product;
  terminalId: string;
  portId: string;
  port: ProductPort;
  configuredProtocol?: CommunicationProtocol;
}

function resolveCommEndpoint(
  componentId: string,
  terminalId: string,
  products: Map<string, Product>,
  components: SystemDesign['components']
): ResolvedCommEndpoint | undefined {
  const component = components.find((c) => c.id === componentId);
  if (!component) return undefined;
  const product = products.get(component.productId);
  if (!product) return undefined;

  const terminal = getEffectiveTerminal(product, terminalId, component);
  if (!terminal || terminal.kind !== 'network') return undefined;

  const portId = terminal.portId;
  if (!portId) return undefined;

  const port = product.ports?.find((p) => p.id === portId && p.kind === 'comm');
  if (!port) {
    // Legacy fallback only: find matching ProductCommunicationPort by portId or terminalId.
  }

  const configuredProtocol = component.configuredProtocols?.[portId] ?? port.configuredProtocol;
  return { component, product, terminalId, portId, port, configuredProtocol };
}
```

#### 5.3 DSU keys must be port keys, not raw terminal IDs

Current code does:

```ts
const fromKey = portKey({ componentId: conn.fromComponentId, portId: conn.fromTerminalId });
```

Replace with:

```ts
const fromEndpoint = resolveCommEndpoint(conn.fromComponentId, conn.fromTerminalId, ...);
const fromKey = portKey({ componentId: conn.fromComponentId, portId: fromEndpoint.portId });
```

Same for `to`.

Also fix `connectedWireIds` collection. Current code only checks whether the connection's `from` endpoint is in the network. It should include a wire if either resolved endpoint belongs to the network.

#### 5.4 Configured protocols are keyed by portId

`SystemComponent.configuredProtocols` must use `portId`, not terminal ID.

Update UI code that reads/writes protocol config:

```txt
ConnectionInspector.tsx
ComponentInspector.tsx
ProductBuilderApp.tsx, if applicable
```

In `ConnectionInspector.tsx`, current code searches:

```ts
fromProduct?.communicationPorts?.find((p) => p.id === connection.fromTerminalId)
fromComponent?.configuredProtocols?.[connection.fromTerminalId]
```

Replace with resolved communication endpoint logic.

#### 5.5 Catalog migration rule

For communication products:

```txt
- ProductPort(kind='comm') carries supportedProtocols/configuredProtocol/connectorType/isConfigurable.
- TerminalGroupDefinition(groupType='communication_interface') points to the port via portId.
- TerminalDefinition only points to terminalGroupId and defines physical jack placement/connector.
```

Examples:

```txt
One logical CAN/LYNK interface with two RJ45 jacks:
  ProductPort id = 'lynk'
  TerminalGroup id = 'lynk_iface', portId = 'lynk', groupType = communication_interface, internallyCommon = true
  Terminal ids = 'lynk_1', 'lynk_2', both terminalGroupId = 'lynk_iface'

Four-port passive CAN splitter:
  If all four ports are one passive bus, either:
    - one ProductPort with four terminals, plus product.commAccessoryBehavior='passive'
  or:
    - four ProductPorts, and passive accessory behavior unions them internally
  Pick one convention and document it.
```

#### Regression tests

1. Product with terminal ID different from port ID:

```txt
connect terminal 'can_out_jack_1' where terminal.portId = 'can_out'
network protocol resolves from ProductPort 'can_out'
```

2. Configurable battery CAN port:

```txt
component.configuredProtocols = { can_out: 'Pylon LV' }
network reports Pylon LV
```

3. Wrong protocol on same passive network:

```txt
port A configured J1939, port B configured VE.Can
COMM_PROTOCOL_CONFLICT error
```

4. Two physical jacks on same comm port:

```txt
both terminal IDs resolve to the same port ID
network does not create fake duplicate protocols or miss wires
```

---

### Phase 6 — Add terminal-level cable size limits

Files:

```txt
src/types/system.ts
src/utils/circuitAnalysis.ts
src/utils/connectorLimits.ts or new src/utils/cableLimits.ts
src/components/inspector/ConnectionInspector.tsx
src/dev/components/TerminalEditorPanel.tsx
src/data/products/helpers/validation.ts
src/data/products/PORT_TERMINAL_MODEL.md
src/data/products/catalog/** active products
```

#### 6.1 Extend TerminalDefinition

Add:

```ts
/** Smallest cable this terminal/datasheet allows, e.g. '14' or '2'. */
minCableAwg?: string;

/** Manufacturer recommended cable size for this terminal/connection. */
recommendedCableAwg?: string;
```

`maxCableAwg` already exists. Keep it.

Do not put this only on `TerminalConnector`. Connector defaults may exist, but product terminal data wins.

Recommended comment:

```ts
// Cable acceptance is terminal-owned because the actual device terminal block/stud
// and product datasheet determine acceptable wire range. Connector kind provides
// only a fallback default.
```

#### 6.2 Add resolver

Create a helper such as:

```txt
src/utils/cableLimits.ts
```

Exports:

```ts
export interface CableSizeConstraint {
  minCableAwg?: string;
  maxCableAwg?: string;
  recommendedCableAwg?: string;
}

export function endpointCableSizeConstraint(
  product: Product,
  component: SystemComponent,
  terminal: EffectiveTerminal
): CableSizeConstraint
```

Resolution order:

```txt
1. TerminalDefinition explicit min/max/recommended.
2. Component instance override only where such override already exists, currently maxCableAwg.
3. Connector-kind default fallback, if implemented.
```

For a connection, combine endpoint constraints:

```txt
connection minCableAwg = larger physical conductor requirement of the two endpoints
connection maxCableAwg = smaller maximum accepted by either endpoint
connection recommendedCableAwg = datasheet recommended size when present and legal; otherwise solver auto size
```

Be careful with AWG ordering. `CABLE_TABLE` is ordered from smallest conductor to largest conductor:

```txt
18, 16, 14, 12, 10, 8, 6, 4, 2, 1, 1/0, 2/0, 4/0
```

So:

```txt
larger conductor = greater index
smaller conductor = lower index
minimum cable size means selected index must be >= min index
maximum cable size means selected index must be <= max index
```

#### 6.3 Apply in cable selection

In `circuitAnalysis.ts`, replace current max-only logic:

```ts
const maxCableAwg = smallerMaxCableAwg(...)
```

with a combined constraint helper.

Cable selection must:

```txt
- never choose smaller than minCableAwg
- never choose larger than maxCableAwg if avoidable
- warn/error if the required ampacity/voltage drop cannot be met within the allowed min/max range
- warn if user manualCableAwg is outside terminal limits
- prefer recommendedCableAwg if it satisfies ampacity, voltage drop, and min/max constraints
```

Severity guidance:

```txt
manual cable smaller than minCableAwg: error
manual cable larger than maxCableAwg: error or warning; use error if physically impossible
auto-selected cable capped at max and ampacity/drop still insufficient: error
recommended cable below required ampacity: ignore recommendation and warn/info that datasheet recommendation is insufficient for inferred current
```

#### Regression tests

1. Terminal max 6 AWG, branch current requires 2 AWG:

```txt
selected cable capped or error generated: CABLE_EXCEEDS_TERMINAL_MAX or TERMINAL_CANNOT_ACCEPT_REQUIRED_CABLE
```

2. Terminal min 4 AWG, branch current only needs 10 AWG:

```txt
auto-selected cable is 4 AWG or larger
```

3. Datasheet recommended 2 AWG, branch current only needs 6 AWG:

```txt
auto-selected cable should prefer 2 AWG if within max and voltage/drop constraints
```

4. User manually selects cable outside min/max:

```txt
warning/error emitted and inspector shows issue
```

---

### Phase 7 — Consolidate warnings and remove duplicate solver calls where practical

Currently multiple modules call `analyzeSystemCircuits()` independently:

```txt
App.tsx
systemDesignValidation.ts
electricalCalculations.ts
systemSummary.ts
protectionRecommendations.ts
```

This can be acceptable short-term, but it creates risk that UI state and warnings are based on different solver runs or stale enriched values.

#### Required near-term rule

All UI and warnings must consume the same canonical output shape from `analyzeSystemDesign()` where possible.

Do not introduce another solver.

#### Future cleanup

If not too disruptive, make `generateWarnings()` accept precomputed `netlist`, `circuitAnalysis`, and `batteryTopology` from `analyzeSystemDesign()` instead of recomputing them internally.

Do not do this before fixing branch current tests.

---

## Expected acceptance tests

After implementation, these scenarios must pass.

### A. Direct battery to inverter/charger

Setup:

```txt
Battery DC+ -> inverter/charger DC+
Battery DC- -> inverter/charger DC-
```

Expected:

```txt
DC+ branch current > 0
DC+ branch current equals inverter/charger max DC demand, e.g. 250A for MultiPlus-II 12/3000
DC- branch current equals DC+ branch current
No MPPT is required to make the branch current appear
```

### B. Direct battery to inverter/charger plus MPPT

Setup:

```txt
Battery DC+ -> inverter/charger DC+
Battery DC- -> inverter/charger DC-
MPPT BAT+ -> battery/bus DC+
MPPT BAT- -> battery/bus DC-
```

Expected:

```txt
Inverter/charger branch remains based on inverter/charger demand
MPPT branch remains based on MPPT output
Adding MPPT does not create or change inverter/charger demand
```

### C. MPPT DC output branch

Expected:

```txt
BAT+ branch = MPPT max output current
BAT- branch = same current
PV input branch is based on PV source/array current, not MPPT terminal rating alone
```

### D. Branch fuse isolation

Setup:

```txt
Battery/bus feeds MPPT branch with 60A/125A fuse
Battery/bus also feeds inverter branch requiring 250A
```

Expected:

```txt
MPPT fuse applies only to MPPT branch
MPPT fuse does not cap inverter branch
Undersized inverter branch fuse still errors
Fuse larger than cable ampacity still errors
```

### E. Shunt / negative trunk

Setup:

```txt
Battery negative -> shunt -> negative bus
multiple loads return to negative bus
```

Expected:

```txt
each leaf return branch has its paired branch current
shunt/trunk current reflects aggregate return current
shunt rating warning only when aggregate return exceeds shunt rating
```

### F. Communication protocol on port

Setup:

```txt
connection uses terminal ID that maps to comm port ID
component.configuredProtocols keyed by portId
```

Expected:

```txt
network protocol resolves from ProductPort
no dependency on ProductCommunicationPort except temporary fallback
terminal group and terminal do not carry protocol selection
```

### G. Cable size limits

Expected:

```txt
terminal minCableAwg, maxCableAwg, recommendedCableAwg are enforced in auto sizing and manual validation
connector defaults are fallback only
```

---

## Coding constraints

- Do not add special cases for individual product IDs.
- Do not suppress warnings to hide wrong currents.
- Do not set DC- current to zero globally.
- Do not use fuse rating as operating current.
- Do not use terminal maxCurrentA as branch current for typed products.
- Do not create a second analyzer.
- Keep `analyzeSystemDesign()` as the public/canonical analysis API.
- Add tests before or alongside each solver change.
- Keep existing BOM, product selection, schematic, auto-routing, premanufactured cable, and save/load behavior intact.

---

## Suggested implementation order for Codex

1. Add regression tests for direct battery -> inverter/charger and direct battery -> inverter/charger + MPPT.
2. Fix terminal-first operating current in `terminalCurrents()`.
3. Add active-conductor filtering so return conductors do not seed source/load demand.
4. Add design-current pairing pass for two-pole leaf-device returns.
5. Add branch-fuse isolation regression tests and clean up `availableCurrentA`.
6. Repair communication endpoint resolution so terminal IDs map to comm ProductPort IDs.
7. Add terminal-level cable min/max/recommended fields and enforce them in cable selection.
8. Add shunt/aggregate return tests; improve return-current propagation if current behavior is still wrong.
9. Run full typecheck/build/tests.
10. Manually verify in the UI:
    - direct battery -> inverter/charger
    - battery + inverter/charger + MPPT
    - branch with inline fuse
    - shunt negative bus
    - configurable CAN/VE.Bus/AEbus communication connection
    - terminal cable max/min constraints in the inspector

