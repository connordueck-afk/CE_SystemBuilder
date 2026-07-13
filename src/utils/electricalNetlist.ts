import type {
  ElectricalType,
  EffectiveTerminal,
  Product,
  SystemComponent,
  SystemConnection,
  SystemDesign,
} from '../types/system';
import { getEffectiveTerminal, getEffectiveTerminals, isDynamicSingleConductorProduct } from './effectiveTerminals';
import { canProvidePower } from './terminalDirection';
import { buildInternalDistributionEdges, hasDistributionTopology } from './distributionTopology';
import { terminalKind } from './portSpecs';
import { linkGroupSizes, portLinkPairs } from './portLinks';

export type BusType =
  | 'dc_pos'
  | 'dc_neg'
  | 'pv_pos'
  | 'pv_neg'
  | 'ac_line'
  | 'ac_line2'
  | 'ac_line3'
  | 'ac_neutral'
  | 'ac_ground'
  | 'chassis_ground'
  | 'signal'
  | 'communication'
  | 'unknown';

export interface TerminalNodeRef {
  key: string;
  componentId: string;
  terminalId: string;
  component: SystemComponent;
  product: Product;
  terminal: EffectiveTerminal;
  busType: BusType;
}

export interface ProtectionBoundary {
  componentId: string;
  productId: string;
  label: string;
  ratingA?: number;
  protectionType: 'fuse' | 'breaker' | 'device';
  terminalKeys: string[];
}

export interface ElectricalNet {
  id: string;
  busType: BusType;
  terminalKeys: string[];
  componentIds: string[];
  sourceCurrentA: number;
  loadCurrentA: number;
  operatingCurrentA: number;
  protectedBy?: ProtectionBoundary[];
  requiresFuse: boolean;
  /** True when this net's terminals disagree on bus type (e.g. a dynamic busbar
   * with one post wired to dc_neg and another to pv_pos) — an unresolved wiring
   * conflict. `busType` reflects only the first/dominant type, so consumers must
   * check this flag rather than trust `busType`/`requiresFuse` at face value. */
  hasBusTypeConflict: boolean;
  /** Resolved nominal voltage for this electrical domain. Populated by voltage-domain analysis. */
  nominalVoltageV?: number;
  /** Standard voltage class (12/24/48 where applicable), otherwise the resolved nominal voltage. */
  voltageClassV?: number;
  /** Nets separated by passive protection may still share one voltage domain. */
  voltageDomainId?: string;
  voltageResolution?: 'port_evidence' | 'primary_default' | 'unresolved';
  hasVoltageConflict?: boolean;
}

export interface VoltageDomainIssue {
  severity: 'error' | 'warning';
  code:
    | 'NET_VOLTAGE_CONFLICT'
    | 'PORT_VOLTAGE_INCOMPATIBLE'
    | 'COMPONENT_VOLTAGE_RATING_EXCEEDED'
    | 'COMPONENT_VOLTAGE_RATING_UNKNOWN'
    | 'COMPONENT_MEDIUM_INCOMPATIBLE';
  message: string;
  netId?: string;
  componentId?: string;
  terminalKey?: string;
}

export interface ConnectionElectricalContext {
  connectionId: string;
  fromNetId?: string;
  toNetId?: string;
  busType: BusType;
  operatingCurrentA: number;
  recommendedFuseRequired: boolean;
  /** Circuit voltage used for current conversion and voltage-drop calculations. */
  circuitVoltageV?: number;
}

export interface BusTypeConflict {
  message: string;
  busTypes: BusType[];
  /** Every component with a terminal in the conflicted net, for locating/selecting it in the UI. */
  componentIds: string[];
  terminalKeys: string[];
}

export interface ElectricalNetlist {
  terminals: Map<string, TerminalNodeRef>;
  terminalNetIds: Map<string, string>;
  nets: ElectricalNet[];
  connectionContexts: Map<string, ConnectionElectricalContext>;
  conflicts: BusTypeConflict[];
  /** Populated by resolveVoltageDomains before authoritative validation runs. */
  voltageIssues: VoltageDomainIssue[];
}

const PROTECTION_TYPES = new Set(['fuse', 'breaker']);
const PASS_THROUGH_TYPES = new Set([
  'busbar',
  'dc_distribution',
  'solar_combiner',
  'dcDisconnect',
  'acDisconnect',
  'relay',
  'contactor',
  'transferSwitch',
]);

// Note: batteries are deliberately absent here even though they accept an
// instance current override elsewhere (circuitAnalysis.ts) — estimateProductCurrentA
// below always zeroes battery current before this function is ever consulted for
// one (battery branch current is load-driven, not the pack's rated max), so a
// battery case here would be dead code.
function instanceCurrentOverrideA(product: Product, component: SystemComponent): number | undefined {
  const currentA = component.instanceMaxCurrentA;
  if (currentA == null || !Number.isFinite(currentA) || currentA <= 0) return undefined;
  if (product.productType === 'dc_load' || product.productType === 'ac_load') return currentA;
  if (product.productType === 'shorePowerInlet') return currentA;
  if (product.productType === 'accessory' && product.dataQuality === 'placeholder') return currentA;
  return undefined;
}

function terminalKey(componentId: string, terminalId: string): string {
  return `${componentId}:${terminalId}`;
}

export function busTypeFromTerminal(terminal: EffectiveTerminal): BusType {
  if (terminal.electricalType === 'dc_pos') return 'dc_pos';
  if (terminal.electricalType === 'dc_neg') return 'dc_neg';
  if (terminal.electricalType === 'pv_pos') return 'pv_pos';
  if (terminal.electricalType === 'pv_neg') return 'pv_neg';

  if (terminal.kind === 'dc_power') {
    if (terminal.polarity === 'positive') return 'dc_pos';
    if (terminal.polarity === 'negative') return 'dc_neg';
  }

  if (terminal.kind === 'pv_power') {
    if (terminal.polarity === 'positive') return 'pv_pos';
    if (terminal.polarity === 'negative') return 'pv_neg';
  }

  if (terminal.kind === 'ac_power') {
    if (terminal.polarity === 'line') return 'ac_line';
    if (terminal.polarity === 'line2') return 'ac_line2';
    if (terminal.polarity === 'line3') return 'ac_line3';
    if (terminal.polarity === 'neutral') return 'ac_neutral';
    if (terminal.polarity === 'ground') return 'ac_ground';
    if (terminal.electricalType === 'ac') return 'ac_line';
  }

  if (terminal.kind === 'chassis_ground') return 'chassis_ground';
  if (terminal.kind === 'signal') return 'signal';
  if (terminal.kind === 'network') return 'communication';
  return 'unknown';
}

export function busTypeRequiresFuse(busType: BusType): boolean {
  // pv_pos included alongside dc_pos/ac_line: PV source-circuit positive conductors
  // require overcurrent protection under NEC 690.9 when strings are paralleled, the
  // same "positive lead needs a fuse" posture already applied to DC and AC lines.
  return busType === 'dc_pos' || busType === 'pv_pos' || busType === 'ac_line' || busType === 'ac_line2' || busType === 'ac_line3';
}

export function isReturnOrGroundBus(busType: BusType): boolean {
  return busType === 'dc_neg' || busType === 'pv_neg' || busType === 'ac_neutral' || busType === 'ac_ground' || busType === 'chassis_ground';
}

function estimateProductCurrentA(product: Product, component: SystemComponent, system: SystemDesign, terminal?: EffectiveTerminal): number {
  // The netlist owns connectivity and source/load identity. Branch current is
  // resolved by circuitAnalysis, where a conductor edge is available. Passive
  // collectors and series devices only expose ratings here; treating those
  // ratings as operating current makes busbars and fuses look like loads/sources.
  if (PROTECTION_TYPES.has(product.productType) || PASS_THROUGH_TYPES.has(product.productType) || isDynamicSingleConductorProduct(product)) {
    return 0;
  }

  // Batteries advertise source capability on their terminals, but that is not
  // operating current. Actual battery branch current is load-driven and is
  // handled by the circuit analyzer.
  if (product.productType === 'battery') return 0;

  // Return/ground conductors are paired-conductor branches, not independent
  // sources or loads. Their current is reported by analyzeSystemCircuits from
  // the matching branch model and then consumed by warnings/summaries.
  if (terminal && isReturnOrGroundBus(busTypeFromTerminal(terminal))) {
    return 0;
  }

  // A charge controller's PV input advertises a maximum *acceptance* rating, not
  // a draw. Current on a PV net is set by what the array delivers (its Imp/Isc),
  // so a PV-input terminal must not seed load current from its own rating — the
  // same principle as the battery rule above. An array large enough to overload
  // an undersized controller is still caught by the controller's PV terminal and
  // port limits, where the array's source current is the value being checked.
  if (terminal && terminalKind(product, terminal) === 'pv_power' && !canProvidePower(terminal)) {
    return 0;
  }

  const instanceOverrideA = instanceCurrentOverrideA(product, component);
  if (instanceOverrideA != null) return instanceOverrideA;

  const voltage = component.instanceVoltageV ?? system.nominalVoltage;
  if (product.productType === 'solar_array') {
    return product.maxPvCurrentA ?? product.solarPanelRatings?.iscA ?? product.solarPanelRatings?.impA ?? 0;
  }
  if (product.productType === 'custom_solar_array') {
    return component.customSolarArrayRatings?.iscA ?? component.customSolarArrayRatings?.impA ?? 0;
  }
  if (product.productType === 'mppt') {
    return product.mpptRatings?.maxOutputCurrentA ?? product.maxCurrentA ?? 0;
  }
  if (product.productType === 'dc_dc_charger') {
    return product.dcDcChargerRatings?.outputCurrentA ?? product.maxCurrentA ?? 0;
  }
  if (product.productType === 'inverter_charger' && product.continuousPowerW) {
    return product.inverterChargerRatings?.maxDcCurrentA ??
      product.continuousPowerW / (system.nominalVoltage * system.assumptions.inverterEfficiency);
  }
  if (product.loadRatings?.currentA != null) {
    return product.loadRatings.currentA;
  }
  if (product.loadRatings?.powerW && voltage > 0) {
    return product.loadRatings.powerW / voltage;
  }
  if (product.continuousPowerW && voltage > 0) return product.continuousPowerW / voltage;
  if (product.maxCurrentA && !PROTECTION_TYPES.has(product.productType) && !PASS_THROUGH_TYPES.has(product.productType)) {
    return product.maxCurrentA;
  }
  return 0;
}

function shouldInternallyJoin(product: Product): boolean {
  if (hasDistributionTopology(product)) return false;
  return PASS_THROUGH_TYPES.has(product.productType) || isDynamicSingleConductorProduct(product);
}

function protectionBoundaryFor(component: SystemComponent, product: Product): ProtectionBoundary | undefined {
  if (!PROTECTION_TYPES.has(product.productType)) return undefined;
  const ratingA = product.protectionRatings?.currentRatingA ?? product.maxCurrentA;
  return {
    componentId: component.id,
    productId: product.id,
    label: component.label ?? product.name,
    ratingA,
    protectionType: product.protectionRatings?.protectionType ?? (product.productType === 'fuse' ? 'fuse' : 'breaker'),
    terminalKeys: product.terminals.map((terminal) => terminalKey(component.id, terminal.id)),
  };
}

function integratedProtectionBoundaryFor(
  component: SystemComponent,
  product: Product,
  terminal: EffectiveTerminal,
  effectiveTerminals: EffectiveTerminal[]
): ProtectionBoundary | undefined {
  const protection = terminal.integratedProtection;
  if (!protection) return undefined;

  const typeLabel = protection.protectionType === 'breaker' ? 'breaker' : 'fuse';
  const groupId = terminal.terminalGroupId;
  const protectedTerminals = groupId
    ? effectiveTerminals.filter((item) => item.terminalGroupId === groupId)
    : [terminal];

  return {
    componentId: component.id,
    productId: product.id,
    label: protection.label ?? `${component.label ?? product.name} integrated ${typeLabel}`,
    ratingA: protection.currentRatingA,
    protectionType: protection.protectionType,
    terminalKeys: protectedTerminals.map((item) => terminalKey(component.id, item.id)),
  };
}

function appendProtectionBoundary(net: ElectricalNet, boundary: ProtectionBoundary): void {
  const existing = net.protectedBy ?? [];
  const key = `${boundary.componentId}:${boundary.label}:${boundary.ratingA ?? ''}:${boundary.protectionType}`;
  if (existing.some((item) => `${item.componentId}:${item.label}:${item.ratingA ?? ''}:${item.protectionType}` === key)) {
    return;
  }
  net.protectedBy = [...existing, boundary];
}

function isSolarSeriesConnection(from: TerminalNodeRef, to: TerminalNodeRef): boolean {
  return from.product.productType === 'solar_array' &&
    to.product.productType === 'solar_array' &&
    from.terminal.kind === 'pv_power' &&
    to.terminal.kind === 'pv_power' &&
    from.terminal.polarity != null &&
    to.terminal.polarity != null &&
    from.terminal.polarity !== to.terminal.polarity;
}

function isBatterySeriesConnection(from: TerminalNodeRef, to: TerminalNodeRef): boolean {
  return from.product.productType === 'battery' &&
    to.product.productType === 'battery' &&
    from.terminal.kind === 'dc_power' &&
    to.terminal.kind === 'dc_power' &&
    from.terminal.polarity != null &&
    to.terminal.polarity != null &&
    from.terminal.polarity !== to.terminal.polarity;
}

class DisjointSet {
  private parent = new Map<string, string>();

  add(key: string) {
    if (!this.parent.has(key)) this.parent.set(key, key);
  }

  find(key: string): string {
    const parent = this.parent.get(key);
    if (!parent || parent === key) return key;
    const root = this.find(parent);
    this.parent.set(key, root);
    return root;
  }

  union(a: string, b: string) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent.set(rootB, rootA);
  }
}

function sortBusType(a: BusType, b: BusType): number {
  const order: BusType[] = ['dc_pos', 'dc_neg', 'pv_pos', 'pv_neg', 'ac_line', 'ac_line2', 'ac_line3', 'ac_neutral', 'ac_ground', 'chassis_ground', 'signal', 'communication', 'unknown'];
  return order.indexOf(a) - order.indexOf(b);
}

export function buildElectricalNetlist(system: SystemDesign, products: Map<string, Product>): ElectricalNetlist {
  const terminals = new Map<string, TerminalNodeRef>();
  const dsu = new DisjointSet();
  const linkSizeByKey = new Map<string, number>();
  const conflicts: BusTypeConflict[] = [];
  const protectionBoundaries = new Map<string, ProtectionBoundary>();
  const terminalProtectionBoundaries = new Map<string, ProtectionBoundary[]>();
  const solarSeriesConnectionIds = new Set<string>();
  const batterySeriesConnectionIds = new Set<string>();

  for (const component of system.components) {
    const product = products.get(component.productId);
    if (!product) continue;

    const effectiveTerminals = getEffectiveTerminals(product, component);
    for (const terminal of effectiveTerminals) {
      const key = terminalKey(component.id, terminal.id);
      const ref: TerminalNodeRef = {
        key,
        componentId: component.id,
        terminalId: terminal.id,
        component,
        product,
        terminal,
        busType: busTypeFromTerminal(terminal),
      };
      terminals.set(key, ref);
      dsu.add(key);
    }

    const boundary = protectionBoundaryFor(component, product);
    if (boundary) protectionBoundaries.set(component.id, boundary);

    const integratedBoundaryGroups = new Set<string>();
    for (const terminal of effectiveTerminals) {
      if (!terminal.integratedProtection) continue;
      const boundaryGroupKey = terminal.terminalGroupId ?? terminal.id;
      if (integratedBoundaryGroups.has(boundaryGroupKey)) continue;
      integratedBoundaryGroups.add(boundaryGroupKey);

      const integratedBoundary = integratedProtectionBoundaryFor(component, product, terminal, effectiveTerminals);
      if (!integratedBoundary) continue;
      for (const key of integratedBoundary.terminalKeys) {
        terminalProtectionBoundaries.set(key, [
          ...(terminalProtectionBoundaries.get(key) ?? []),
          integratedBoundary,
        ]);
      }
    }

    if (hasDistributionTopology(product)) {
      const edges = buildInternalDistributionEdges(component, product);
      for (const edge of edges) {
        const fromKey = terminalKey(component.id, edge.fromTerminalId);
        const toKey = terminalKey(component.id, edge.toTerminalId);
        if (!terminals.has(fromKey) || !terminals.has(toKey)) continue;

        if (edge.fuseSlotId) {
          const slotBoundary: ProtectionBoundary = {
            componentId: component.id,
            productId: product.id,
            label: `${component.label ?? product.name} ${edge.protectionLabel ?? edge.fuseSlotId}`,
            ratingA: edge.protectionRatingA,
            protectionType: edge.protectionType ?? 'fuse',
            terminalKeys: [fromKey, toKey],
          };
          terminalProtectionBoundaries.set(toKey, [
            ...(terminalProtectionBoundaries.get(toKey) ?? []),
            slotBoundary,
          ]);
        } else {
          dsu.union(fromKey, toKey);
        }
      }
    }

    if (shouldInternallyJoin(product) && !PROTECTION_TYPES.has(product.productType)) {
      const keysByBusType = new Map<BusType, string[]>();
      for (const terminal of effectiveTerminals) {
        if (!['dc_power', 'pv_power', 'ac_power'].includes(terminal.kind)) continue;
        const busType = busTypeFromTerminal(terminal);
        if (busType === 'unknown' || busType === 'signal') continue;
        keysByBusType.set(busType, [
          ...(keysByBusType.get(busType) ?? []),
          terminalKey(component.id, terminal.id),
        ]);
      }

      for (const powerKeys of keysByBusType.values()) {
        for (let i = 1; i < powerKeys.length; i += 1) {
          dsu.union(powerKeys[0], powerKeys[i]);
        }
      }
    }

    // Port-linked jacks (same portId+polarity) are internally bonded into one node.
    for (const pair of portLinkPairs(product, component)) {
      const fromKey = terminalKey(component.id, pair.fromTerminalId);
      const toKey = terminalKey(component.id, pair.toTerminalId);
      if (terminals.has(fromKey) && terminals.has(toKey)) dsu.union(fromKey, toKey);
    }
    for (const [terminalId, size] of linkGroupSizes(product, component)) {
      linkSizeByKey.set(terminalKey(component.id, terminalId), size);
    }
  }

  for (const connection of system.connections) {
    const fromKey = terminalKey(connection.fromComponentId, connection.fromTerminalId);
    const toKey = terminalKey(connection.toComponentId, connection.toTerminalId);
    const from = terminals.get(fromKey);
    const to = terminals.get(toKey);
    if (!from || !to) continue;

    if (isSolarSeriesConnection(from, to)) {
      solarSeriesConnectionIds.add(connection.id);
      continue;
    }
    if (isBatterySeriesConnection(from, to)) {
      batterySeriesConnectionIds.add(connection.id);
      continue;
    }

    const isProtectionConnection =
      PROTECTION_TYPES.has(from.product.productType) ||
      PROTECTION_TYPES.has(to.product.productType);

    if (!isProtectionConnection) {
      dsu.union(fromKey, toKey);
    }
  }

  const groups = new Map<string, TerminalNodeRef[]>();
  for (const ref of terminals.values()) {
    const root = dsu.find(ref.key);
    groups.set(root, [...(groups.get(root) ?? []), ref]);
  }

  const terminalNetIds = new Map<string, string>();
  const nets: ElectricalNet[] = [];
  const busTypeCounts = new Map<BusType, number>();

  const sortedGroups = [...groups.values()].sort((a, b) => a[0].key.localeCompare(b[0].key));
  for (const group of sortedGroups) {
    const knownBusTypes = [...new Set(group.map((ref) => ref.busType).filter((type) => type !== 'unknown'))].sort(sortBusType);
    const busType = knownBusTypes[0] ?? 'unknown';
    const componentIds = [...new Set(group.map((ref) => ref.componentId))].sort();
    const terminalKeys = group.map((ref) => ref.key).sort();
    if (knownBusTypes.length > 1) {
      conflicts.push({
        message: `Net has conflicting bus types: ${knownBusTypes.join(', ')}.`,
        busTypes: knownBusTypes,
        componentIds,
        terminalKeys,
      });
    }

    const count = (busTypeCounts.get(busType) ?? 0) + 1;
    busTypeCounts.set(busType, count);
    const netId = `net-${busType.replace(/_/g, '-')}-${count}`;

    let sourceCurrentA = 0;
    let loadCurrentA = 0;
    for (const ref of group) {
      const currentA = estimateProductCurrentA(ref.product, ref.component, system, ref.terminal);
      if (currentA <= 0) continue;
      // A linked jack carries an equal share of its device's current; summing the
      // bonded jacks in this group then reconstructs the device total rather than
      // multiplying it by the jack count.
      const share = currentA / (linkSizeByKey.get(ref.key) ?? 1);
      if (canProvidePower(ref.terminal)) sourceCurrentA += share;
      else loadCurrentA += share;
    }

    const net: ElectricalNet = {
      id: netId,
      busType,
      terminalKeys,
      componentIds,
      sourceCurrentA,
      loadCurrentA,
      operatingCurrentA: Math.max(sourceCurrentA, loadCurrentA),
      requiresFuse: busTypeRequiresFuse(busType),
      hasBusTypeConflict: knownBusTypes.length > 1,
    };

    nets.push(net);
    for (const key of terminalKeys) terminalNetIds.set(key, netId);
  }

  const netsById = new Map(nets.map((net) => [net.id, net]));
  const connectionContexts = new Map<string, ConnectionElectricalContext>();

  for (const [key, boundaries] of terminalProtectionBoundaries) {
    const netId = terminalNetIds.get(key);
    const net = netId ? netsById.get(netId) : undefined;
    if (!net) continue;

    for (const boundary of boundaries) {
      appendProtectionBoundary(net, boundary);
    }
  }

  for (const connection of system.connections) {
    const fromKey = terminalKey(connection.fromComponentId, connection.fromTerminalId);
    const toKey = terminalKey(connection.toComponentId, connection.toTerminalId);
    const fromNetId = terminalNetIds.get(fromKey);
    const toNetId = terminalNetIds.get(toKey);
    const fromNet = fromNetId ? netsById.get(fromNetId) : undefined;
    const toNet = toNetId ? netsById.get(toNetId) : undefined;
    const isSolarSeries = solarSeriesConnectionIds.has(connection.id);
    const isBatterySeries = batterySeriesConnectionIds.has(connection.id);
    const busType: BusType = isSolarSeries || isBatterySeries
      ? 'unknown'
      : fromNet && fromNet.busType !== 'unknown'
      ? fromNet.busType
      : toNet?.busType ?? 'unknown';
    const operatingCurrentA = Math.max(
      fromNet?.operatingCurrentA ?? 0,
      toNet?.operatingCurrentA ?? 0
    );

    const fromRef = terminals.get(fromKey);
    const toRef = terminals.get(toKey);
    const boundaryComponent = [fromRef, toRef].find((ref) => ref && PROTECTION_TYPES.has(ref.product.productType));
    const boundary = boundaryComponent ? protectionBoundaries.get(boundaryComponent.componentId) : undefined;
    const slotBoundaries = [
      ...(terminalProtectionBoundaries.get(fromKey) ?? []),
      ...(terminalProtectionBoundaries.get(toKey) ?? []),
    ];
    if (boundary) {
      for (const netId of [fromNetId, toNetId]) {
        const net = netId ? netsById.get(netId) : undefined;
        if (!net) continue;
        appendProtectionBoundary(net, boundary);
      }
    }

    for (const slotBoundary of slotBoundaries) {
      for (const netId of [fromNetId, toNetId]) {
        const net = netId ? netsById.get(netId) : undefined;
        if (!net) continue;
        appendProtectionBoundary(net, slotBoundary);
      }
    }

    connectionContexts.set(connection.id, {
      connectionId: connection.id,
      fromNetId,
      toNetId,
      busType,
      operatingCurrentA,
      recommendedFuseRequired: busTypeRequiresFuse(busType),
    });
  }

  return { terminals, terminalNetIds, nets, connectionContexts, conflicts, voltageIssues: [] };
}

export function getConnectionBusType(
  connection: Pick<SystemConnection, 'fromComponentId' | 'fromTerminalId' | 'toComponentId' | 'toTerminalId'>,
  components: SystemComponent[],
  products: Map<string, Product>
): BusType {
  const fromComponent = components.find((component) => component.id === connection.fromComponentId);
  const toComponent = components.find((component) => component.id === connection.toComponentId);
  const fromProduct = fromComponent ? products.get(fromComponent.productId) : undefined;
  const toProduct = toComponent ? products.get(toComponent.productId) : undefined;
  const fromTerminal = fromComponent && fromProduct
    ? getEffectiveTerminal(fromProduct, connection.fromTerminalId, fromComponent)
    : undefined;
  const toTerminal = toComponent && toProduct
    ? getEffectiveTerminal(toProduct, connection.toTerminalId, toComponent)
    : undefined;
  const fromType = fromTerminal ? busTypeFromTerminal(fromTerminal) : 'unknown';
  const toType = toTerminal ? busTypeFromTerminal(toTerminal) : 'unknown';
  return fromType !== 'unknown' ? fromType : toType;
}

export function electricalTypeForBusType(busType: BusType): ElectricalType | undefined {
  if (busType === 'dc_pos' || busType === 'dc_neg' || busType === 'pv_pos' || busType === 'pv_neg') return busType;
  if (busType === 'ac_line' || busType === 'ac_neutral' || busType === 'ac_ground') return 'ac';
  if (busType === 'signal') return 'signal';
  return undefined;
}
