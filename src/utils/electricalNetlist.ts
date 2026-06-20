import type {
  ElectricalType,
  Product,
  SystemComponent,
  SystemConnection,
  SystemDesign,
  TerminalDefinition,
} from '../types/system';
import { getEffectiveTerminal, getEffectiveTerminals, isDynamicSingleConductorProduct } from './effectiveTerminals';
import { canProvidePower } from './terminalDirection';

export type BusType =
  | 'dc_pos'
  | 'dc_neg'
  | 'pv_pos'
  | 'pv_neg'
  | 'ac_line'
  | 'ac_neutral'
  | 'ac_ground'
  | 'chassis_ground'
  | 'signal'
  | 'unknown';

export interface TerminalNodeRef {
  key: string;
  componentId: string;
  terminalId: string;
  component: SystemComponent;
  product: Product;
  terminal: TerminalDefinition;
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
  availableCurrentA?: number;
  protectedBy?: ProtectionBoundary[];
  requiresFuse: boolean;
}

export interface ConnectionElectricalContext {
  connectionId: string;
  fromNetId?: string;
  toNetId?: string;
  busType: BusType;
  operatingCurrentA: number;
  availableCurrentA?: number;
  recommendedFuseRequired: boolean;
}

export interface ElectricalNetlist {
  terminals: Map<string, TerminalNodeRef>;
  terminalNetIds: Map<string, string>;
  nets: ElectricalNet[];
  connectionContexts: Map<string, ConnectionElectricalContext>;
  conflicts: string[];
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

function terminalKey(componentId: string, terminalId: string): string {
  return `${componentId}:${terminalId}`;
}

export function busTypeFromTerminal(terminal: TerminalDefinition): BusType {
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
    if (terminal.polarity === 'neutral') return 'ac_neutral';
    if (terminal.polarity === 'ground') return 'ac_ground';
    if (terminal.electricalType === 'ac') return 'ac_line';
  }

  if (terminal.kind === 'chassis_ground') return 'chassis_ground';
  if (terminal.kind === 'signal' || terminal.kind === 'network') return 'signal';
  return 'unknown';
}

export function busTypeRequiresFuse(busType: BusType): boolean {
  return busType === 'dc_pos' || busType === 'ac_line';
}

export function isReturnOrGroundBus(busType: BusType): boolean {
  return busType === 'dc_neg' || busType === 'pv_neg' || busType === 'ac_neutral' || busType === 'ac_ground' || busType === 'chassis_ground';
}

function estimateProductCurrentA(product: Product, component: SystemComponent, system: SystemDesign): number {
  const voltage = component.instanceVoltageV ?? system.nominalVoltage;
  if (component.instanceMaxCurrentA != null) return component.instanceMaxCurrentA;
  if (product.productType === 'solar_array') {
    return product.maxPvCurrentA ?? product.solarPanelRatings?.iscA ?? product.solarPanelRatings?.impA ?? 0;
  }
  if (product.productType === 'inverter_charger' && product.continuousPowerW) {
    return product.continuousPowerW / (system.nominalVoltage * system.assumptions.inverterEfficiency);
  }
  if (product.continuousPowerW && voltage > 0) return product.continuousPowerW / voltage;
  if (product.maxCurrentA && !PROTECTION_TYPES.has(product.productType) && !PASS_THROUGH_TYPES.has(product.productType)) {
    return product.maxCurrentA;
  }
  return 0;
}

function shouldInternallyJoin(product: Product): boolean {
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

function isSolarSeriesConnection(from: TerminalNodeRef, to: TerminalNodeRef): boolean {
  return from.product.productType === 'solar_array' &&
    to.product.productType === 'solar_array' &&
    from.terminal.kind === 'pv_power' &&
    to.terminal.kind === 'pv_power' &&
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
  const order: BusType[] = ['dc_pos', 'dc_neg', 'pv_pos', 'pv_neg', 'ac_line', 'ac_neutral', 'ac_ground', 'chassis_ground', 'signal', 'unknown'];
  return order.indexOf(a) - order.indexOf(b);
}

export function buildElectricalNetlist(system: SystemDesign, products: Map<string, Product>): ElectricalNetlist {
  const terminals = new Map<string, TerminalNodeRef>();
  const dsu = new DisjointSet();
  const conflicts: string[] = [];
  const protectionBoundaries = new Map<string, ProtectionBoundary>();
  const solarSeriesConnectionIds = new Set<string>();

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

    if (shouldInternallyJoin(product) && !PROTECTION_TYPES.has(product.productType)) {
      const powerKeys = effectiveTerminals
        .filter((terminal) => ['dc_power', 'pv_power', 'ac_power'].includes(terminal.kind))
        .map((terminal) => terminalKey(component.id, terminal.id));
      for (let i = 1; i < powerKeys.length; i += 1) {
        dsu.union(powerKeys[0], powerKeys[i]);
      }
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
    if (knownBusTypes.length > 1) {
      conflicts.push(`Net has conflicting bus types: ${knownBusTypes.join(', ')}.`);
    }

    const count = (busTypeCounts.get(busType) ?? 0) + 1;
    busTypeCounts.set(busType, count);
    const netId = `net-${busType.replace(/_/g, '-')}-${count}`;

    const componentIds = [...new Set(group.map((ref) => ref.componentId))].sort();
    const terminalKeys = group.map((ref) => ref.key).sort();

    let sourceCurrentA = 0;
    let loadCurrentA = 0;
    for (const ref of group) {
      const currentA = estimateProductCurrentA(ref.product, ref.component, system);
      if (currentA <= 0) continue;
      if (canProvidePower(ref.terminal)) sourceCurrentA += currentA;
      else loadCurrentA += currentA;
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
    };

    nets.push(net);
    for (const key of terminalKeys) terminalNetIds.set(key, netId);
  }

  const netsById = new Map(nets.map((net) => [net.id, net]));
  const connectionContexts = new Map<string, ConnectionElectricalContext>();

  for (const connection of system.connections) {
    const fromKey = terminalKey(connection.fromComponentId, connection.fromTerminalId);
    const toKey = terminalKey(connection.toComponentId, connection.toTerminalId);
    const fromNetId = terminalNetIds.get(fromKey);
    const toNetId = terminalNetIds.get(toKey);
    const fromNet = fromNetId ? netsById.get(fromNetId) : undefined;
    const toNet = toNetId ? netsById.get(toNetId) : undefined;
    const isSolarSeries = solarSeriesConnectionIds.has(connection.id);
    const busType: BusType = isSolarSeries
      ? 'unknown'
      : fromNet && fromNet.busType !== 'unknown'
      ? fromNet.busType
      : toNet?.busType ?? 'unknown';
    const operatingCurrentA = Math.max(
      connection.calculatedCurrentA ?? 0,
      fromNet?.operatingCurrentA ?? 0,
      toNet?.operatingCurrentA ?? 0
    );

    const fromRef = terminals.get(fromKey);
    const toRef = terminals.get(toKey);
    const boundaryComponent = [fromRef, toRef].find((ref) => ref && PROTECTION_TYPES.has(ref.product.productType));
    const boundary = boundaryComponent ? protectionBoundaries.get(boundaryComponent.componentId) : undefined;
    const availableCurrentA = boundary?.ratingA;

    if (boundary) {
      for (const netId of [fromNetId, toNetId]) {
        const net = netId ? netsById.get(netId) : undefined;
        if (!net) continue;
        net.protectedBy = [...(net.protectedBy ?? []), boundary];
        net.availableCurrentA = net.availableCurrentA == null
          ? boundary.ratingA
          : boundary.ratingA == null
            ? net.availableCurrentA
            : Math.min(net.availableCurrentA, boundary.ratingA);
      }
    }

    connectionContexts.set(connection.id, {
      connectionId: connection.id,
      fromNetId,
      toNetId,
      busType,
      operatingCurrentA,
      availableCurrentA,
      recommendedFuseRequired: busTypeRequiresFuse(busType),
    });
  }

  return { terminals, terminalNetIds, nets, connectionContexts, conflicts };
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
