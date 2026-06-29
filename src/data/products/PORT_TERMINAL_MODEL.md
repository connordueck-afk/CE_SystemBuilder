# Port, Terminal Group, And Terminal Model

Use this file as the compact catalog-porting reference. The type definitions in
`src/types/system.ts` and catalog validation in `src/data/products/helpers/validation.ts`
remain authoritative.

## Mental Model

```txt
Product
  ports             electrical or communication boundary specs
  terminalGroups    internal common nodes, conductor polarity, shared limits
  terminals         physical jacks/posts/connectors and canvas placement
```

Every active product terminal must resolve through:

```txt
terminal.terminalGroupId -> terminalGroup.id
terminalGroup.portId -> port.id
```

Do not use `TerminalDefinition.portId` on active catalog products. It is legacy
fallback data only.

## What Goes Where

### ProductPort

Ports own circuit-level behavior and compatibility.

Put these on the port:

- `id`, `label`
- `kind`: `dc`, `ac`, `pv`, `comm`, `ground`, `signal`, or `generic`
- `topology`: `two_pole`, `bus`, or `pass_through`
- `role`: `source`, `sink`, `bidirectional`, `pass_through`, `bus`, `sense`, or `control`
- `direction`: `input`, `output`, or `bidirectional`
- Voltage specs: `voltageClass`, `nominalVoltageV`, `voltageMinV`, `voltageMaxV`
- Current/power specs: `maxCurrentA`, `maxPowerW`, `maxPowerByVoltageW`
- AC specs: `phases`
- Communication specs: `connectorType`, `supportedProtocols`, `configuredProtocol`,
  `isConfigurable`, `commTopology`, `gender`

Topology meaning:

- `two_pole`: paired conductors on one complete circuit, such as DC+/DC-,
  PV+/PV-, AC line/neutral.
- `bus`: one internally common node with many connection points, such as a
  busbar or single-polarity distribution block.
- `pass_through`: series element with distinct upstream/downstream nodes, such
  as a fuse, breaker, shunt, or disconnect.

### TerminalGroup

Terminal groups own internal common-node facts.

Put these on the terminal group:

- `id`, `portId`, `label`
- `groupType`: `power_conductor`, `communication_interface`, `signal_interface`,
  or `ground_reference`
- Power conductor polarity: `positive`, `negative`, `line`, `line2`, `neutral`,
  or `ground`
- `internallyCommon`
- Shared/internal limits: `maxCurrentA`, `maxVoltageV`
- Protection requirements: `requiresOvercurrentProtection`, `requiresDisconnect`,
  `recommendedFuseA`, `maxFuseA`
- `notes`

For power products, each conductor normally gets its own terminal group. Multiple
physical terminals may share one group when they are internally common, such as
four battery DC+ posts on one internal bus.

For communication products, model the whole interface as one group. Do not model
CAN-H/CAN-L, RJ45 pins, or other individual signal conductors unless the app has
explicit behavior for them.

### Terminal

Terminals own physical and schematic facts only.

Put these on the terminal:

- `id`, `label`
- `terminalGroupId`
- Canvas placement: `side`, `offsetX`, `offsetY`
- Physical limits: per-jack `maxCurrentA`, `maxCableAwg`, `maxConnections`
- Physical connector: `connector`
- `busLinkStandard`, `required`, `connectableTo`, `notes`

Do not put electrical behavior on active product terminals.

Forbidden active-terminal fields include:

- `kind`
- `polarity`
- `role`
- `direction`
- `voltageClass`
- `requiresOvercurrentProtection`
- `requiresDisconnect`
- `recommendedFuseA`
- `maxFuseA`
- `portId`
- `maxPowerW`
- `electricalType`

Catalog validation rejects these because they belong on ports or terminal groups.

## Common Patterns

### Battery

Use one `dc` / `two_pole` port and one terminal group per conductor. If the
battery exposes multiple positive or negative posts, map all same-polarity posts
to the same terminal group and put the internal bus limit on the group.

```ts
ports: [
  {
    id: 'dc',
    kind: 'dc',
    topology: 'two_pole',
    label: 'DC',
    voltageClass: 'dc_low_voltage',
    nominalVoltageV: 51.2,
    maxCurrentA: 200,
    role: 'bidirectional',
    direction: 'bidirectional',
  },
],
terminalGroups: [
  {
    id: 'dc_pos',
    portId: 'dc',
    label: 'DC Positive',
    groupType: 'power_conductor',
    polarity: 'positive',
    internallyCommon: true,
    maxCurrentA: 200,
    requiresOvercurrentProtection: true,
  },
  {
    id: 'dc_neg',
    portId: 'dc',
    label: 'DC Negative',
    groupType: 'power_conductor',
    polarity: 'negative',
    internallyCommon: true,
    maxCurrentA: 200,
  },
],
terminals: [
  {
    id: 'dc_pos',
    terminalGroupId: 'dc_pos',
    label: '+',
    side: 'top',
    offsetX: 35,
    offsetY: -45,
    maxCurrentA: 200,
    connector: { kind: 'stud', holeSize: 'M8' },
  },
],
```

### Busbar

Use a `bus` topology port and one internally common terminal group. If polarity is
set per placed component, leave group polarity unset and document that behavior.

```ts
ports: [
  {
    id: 'main',
    kind: 'generic',
    topology: 'bus',
    label: 'Main',
    maxCurrentA: 600,
    role: 'bus',
    direction: 'bidirectional',
  },
],
terminalGroups: [
  {
    id: 'bus',
    portId: 'main',
    label: 'Bus',
    groupType: 'power_conductor',
    internallyCommon: true,
    maxCurrentA: 600,
  },
],
```

### Fuse, Breaker, Shunt, Or Disconnect

Use one `pass_through` port. Use separate terminal groups for each side because
the two terminals are distinct circuit nodes with a device between them.

```ts
ports: [
  {
    id: 'main',
    kind: 'dc',
    topology: 'pass_through',
    label: 'Main',
    voltageClass: 'dc_low_voltage',
    maxCurrentA: 100,
    role: 'pass_through',
  },
],
terminalGroups: [
  {
    id: 'in',
    portId: 'main',
    label: 'A',
    groupType: 'power_conductor',
    polarity: 'positive',
    internallyCommon: false,
  },
  {
    id: 'out',
    portId: 'main',
    label: 'B',
    groupType: 'power_conductor',
    polarity: 'positive',
    internallyCommon: false,
  },
],
```

### MPPT

Use separate ports for PV input and DC output. Each port is `two_pole` and has
positive and negative terminal groups. PV specs live on the PV port; battery-side
charge output specs live on the DC output port.

```ts
ports: [
  {
    id: 'pv',
    kind: 'pv',
    topology: 'two_pole',
    label: 'PV',
    voltageClass: 'pv_high_voltage',
    voltageMaxV: 150,
    maxCurrentA: 50,
    maxPowerByVoltageW: { 12: 860, 24: 1720, 48: 3440 },
    role: 'sink',
    direction: 'input',
  },
  {
    id: 'dc_out',
    kind: 'dc',
    topology: 'two_pole',
    label: 'DC Output',
    voltageClass: 'dc_low_voltage',
    maxCurrentA: 60,
    role: 'source',
    direction: 'output',
  },
],
```

### Inverter/Charger

Use separate ports for each power domain: DC, AC input, AC output, and any
communication interface. Do not combine AC input and AC output into one port.

```ts
ports: [
  {
    id: 'dc',
    kind: 'dc',
    topology: 'two_pole',
    voltageClass: 'dc_low_voltage',
    nominalVoltageV: 48,
    maxCurrentA: 110,
    role: 'bidirectional',
    direction: 'bidirectional',
  },
  {
    id: 'ac_in',
    kind: 'ac',
    topology: 'two_pole',
    voltageClass: 'ac_120v',
    nominalVoltageV: 120,
    maxCurrentA: 50,
    role: 'sink',
    direction: 'input',
  },
  {
    id: 'ac_out',
    kind: 'ac',
    topology: 'two_pole',
    voltageClass: 'ac_120v',
    nominalVoltageV: 120,
    maxCurrentA: 41,
    role: 'source',
    direction: 'output',
  },
],
```

### Communication Interface

Use a `comm` port and a `communication_interface` terminal group. Keep
`communicationPorts` populated for legacy UI/network consumers until those paths
are fully unified with `ports`.

```ts
ports: [
  {
    id: 've_can',
    kind: 'comm',
    label: 'VE.Can',
    topology: 'two_pole',
    role: 'bidirectional',
    direction: 'bidirectional',
    connectorType: 'RJ45',
    supportedProtocols: ['VE.Can'],
    configuredProtocol: 'VE.Can',
  },
],
terminalGroups: [
  {
    id: 've_can_iface',
    portId: 've_can',
    label: 'VE.Can Interface',
    groupType: 'communication_interface',
    internallyCommon: false,
  },
],
terminals: [
  {
    id: 've_can',
    terminalGroupId: 've_can_iface',
    label: 'VE.Can',
    side: 'top',
    offsetX: 0,
    offsetY: -60,
  },
],
communicationPorts: [
  {
    id: 've_can',
    name: 'VE.Can',
    connectorType: 'RJ45',
    supportedProtocols: ['VE.Can'],
    configuredProtocol: 'VE.Can',
  },
],
```

## Porting Checklist

- One active product per file under `catalog/<category>/<product-id>.ts`.
- Every connectable product has `ports`, `terminalGroups`, and `terminals`.
- Every terminal has `terminalGroupId`.
- Every terminal group references a real `portId`.
- Every `dc`, `pv`, and `ac` port has `kind`, `topology`, `role`, and
  `voltageClass`.
- Power conductor polarity is on terminal groups, not terminals.
- Terminal `maxCurrentA` is a per-jack physical limit.
- Terminal group `maxCurrentA` is an internal/common-node limit.
- Port `maxCurrentA` is the whole circuit or internal port limit.
- Device source/load ratings still belong in typed rating blocks and flat
  compatibility fields when existing consumers need them.
- Unknown manufacturer data should use `dataQuality: 'partial'` or
  `dataQuality: 'placeholder'` and clear notes, not silent guesses.
- Run `.\npm.cmd test` after catalog changes so strict validation catches drift.

## Helpers

Resolve electrical facts through helpers instead of raw field reads:

- `src/utils/portSpecs.ts`
- `src/utils/portLinks.ts`
- `src/utils/effectiveTerminals.ts`

Validation lives in:

- `src/data/products/helpers/validation.ts`
