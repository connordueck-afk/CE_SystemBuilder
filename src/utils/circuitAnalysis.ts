import type {
  Product,
  SystemComponent,
  SystemConnection,
  SystemDesign,
  TerminalDefinition,
  TerminalDirection,
} from '../types/system';
import { CABLE_TABLE, cableByAwg, cableForCurrent, voltageDropV } from '../data/cableAmpacity';
import { STANDARD_FUSE_RATINGS, nextStandardFuse } from '../data/fuseRatings';
import { continuousFactorForBus, DEFAULT_ASSUMPTIONS } from '../data/electricalRules';
import { getEffectiveProductForComponent } from './solarCalculations';
import { getEffectiveTerminals, isDynamicSingleConductorProduct } from './effectiveTerminals';
import { canProvidePower, canReceivePower, inferTerminalDirection } from './terminalDirection';
import { busTypeFromTerminal, busTypeRequiresFuse, type BusType } from './electricalNetlist';
import { buildInternalDistributionEdges, hasDistributionTopology } from './distributionTopology';
import { resolveTerminalCurrentA } from './terminalElectrics';
import { formatFeetAndInches } from './cableSummary';
import { analyzeBatteryTopology } from './batteryTopology';

const PROTECTION_TYPES = new Set(['fuse', 'breaker']);
const CONDUCTIVE_PASS_THROUGH_TYPES = new Set([
  'busbar',
  'dc_distribution',
  'solar_combiner',
  'pvCombinerBox',
  'dcDisconnect',
  'acDisconnect',
  'relay',
  'contactor',
  'transferSwitch',
  'fuse',
  'breaker',
]);

type EdgeKind = 'connection' | 'internal';

interface TerminalNode {
  key: string;
  component: SystemComponent;
  product: Product;
  terminal: TerminalDefinition;
  busType: BusType;
  behavior: TerminalBehavior;
}

interface TerminalBehavior {
  direction: TerminalDirection;
  normalLoadCurrentA: number;
  normalSourceCurrentA: number;
  hasNormalSource: boolean;
  hasLoadFollowingSource: boolean;
  canReceiveCurrent: boolean;
  canSourceFaultCurrent: boolean;
  sourceCapabilityA?: number;
  requiresOvercurrentProtection: boolean;
  recommendedFuseA?: number;
  maxFuseA?: number;
}

interface GraphEdge {
  id: string;
  kind: EdgeKind;
  fromKey: string;
  toKey: string;
  busType: BusType;
  connectionId?: string;
  lengthFt?: number;
  componentId?: string;
  protectionRatingA?: number;
  protectionLabel?: string;
  protectedTerminalKey?: string;
}

export interface BranchProtectionDevice {
  componentId: string;
  label: string;
  ratingA?: number;
}

export interface SourceProtectionStatus {
  side: 'from' | 'to';
  sourcePresent: boolean;
  required: boolean;
  protected: boolean;
  protection?: BranchProtectionDevice;
}

export interface BranchValidationIssue {
  code: string;
  message: string;
}

interface SideSummary {
  keys: Set<string>;
  normalLoadCurrentA: number;
  normalSourceCurrentA: number;
  hasNormalSource: boolean;
  hasLoadFollowingSource: boolean;
  canReceiveCurrent: boolean;
  canSourceFaultCurrent: boolean;
  sourceCapacityA?: number;
  requiresOvercurrentProtection: boolean;
  recommendedFuseA?: number;
  maxFuseA?: number;
}

export interface ConnectionCircuitAnalysis {
  connectionId: string;
  busType: BusType;
  designCurrentA: number;
  voltageV: number;
  protectionRequired: boolean;
  protectedBy: BranchProtectionDevice[];
  sourceProtection: SourceProtectionStatus[];
  minimumFuseA?: number;
  recommendedFuseA?: number;
  selectedFuseA?: number;
  effectiveBranchLimitA?: number;
  recommendedCableAwg?: string;
  selectedCableAwg?: string;
  /** Current used to pick the cable ampacity (continuous-load and fuse aware). */
  cableSizingCurrentA?: number;
  voltageDropV?: number;
  voltageDropPercent?: number;
  errors: BranchValidationIssue[];
  warnings: string[];
}

export interface SystemCircuitAnalysis {
  connections: Map<string, ConnectionCircuitAnalysis>;
}

function terminalKey(componentId: string, terminalId: string): string {
  return `${componentId}:${terminalId}`;
}

function isPowerBus(busType: BusType): boolean {
  return busType !== 'unknown' && busType !== 'signal';
}

function isProtectionProduct(product: Product | undefined): boolean {
  return Boolean(product && PROTECTION_TYPES.has(product.productType));
}

function isBatteryProduct(product: Product | undefined): boolean {
  return product?.productType === 'battery';
}

function isCollectorProduct(product: Product | undefined): boolean {
  return Boolean(product && ['busbar', 'dc_distribution'].includes(product.productType));
}

function isConductivePassThroughProduct(product: Product): boolean {
  if (hasDistributionTopology(product)) return false;
  return CONDUCTIVE_PASS_THROUGH_TYPES.has(product.productType) || isDynamicSingleConductorProduct(product);
}

/**
 * A "leaf" power device terminates a branch with its own positive and negative
 * leads (battery, load, MPPT, inverter/charger, etc.) — as opposed to busbars,
 * distributors, pass-throughs, and protection devices that just relay a bus. Its
 * supply and return conductors form a pair that must be sized to the same current.
 */
function isLeafPowerDevice(product: Product | undefined): boolean {
  if (!product) return false;
  if (isProtectionProduct(product)) return false;
  if (isCollectorProduct(product)) return false;
  if (hasDistributionTopology(product)) return false;
  if (isConductivePassThroughProduct(product)) return false;
  return true;
}

function normalizeConductorToken(value: string): string {
  return value.replace(/[-_]/g, '');
}

function protectionConductorKey(terminalId: string, powerTerminalCount: number): string {
  const id = terminalId.toLowerCase();
  if (powerTerminalCount <= 2) return 'single';

  const leadingPole = id.match(/^(l\d+|line\d+|p\d+|phase[-_]?[abc])_(?:in|out)$/);
  if (leadingPole) return normalizeConductorToken(leadingPole[1]);

  const trailingPole = id.match(/^(?:in|out)_(l\d+|line\d+|p\d+|phase[-_]?[abc])$/);
  if (trailingPole) return normalizeConductorToken(trailingPole[1]);

  const leadingGeneric = id.match(/^(.+)_(?:in|out)$/);
  if (leadingGeneric) return normalizeConductorToken(leadingGeneric[1]);

  const trailingGeneric = id.match(/^(?:in|out)_(.+)$/);
  if (trailingGeneric) return normalizeConductorToken(trailingGeneric[1]);

  return id;
}

function passThroughGroupKey(product: Product, node: TerminalNode, powerTerminalCount: number): string {
  if (!isProtectionProduct(product)) return node.busType;
  return `${node.busType}:${protectionConductorKey(node.terminal.id, powerTerminalCount)}`;
}

function positiveNumber(value: number | undefined): number | undefined {
  return value != null && Number.isFinite(value) && value > 0 ? value : undefined;
}

function instanceCurrentOverrideA(product: Product, component: SystemComponent): number | undefined {
  const currentA = positiveNumber(component.instanceMaxCurrentA);
  if (currentA == null) return undefined;
  if (product.productType === 'dc_load' || product.productType === 'ac_load') return currentA;
  if (product.productType === 'shorePowerInlet' || product.productType === 'battery') return currentA;
  if (product.productType === 'accessory' && product.dataQuality === 'placeholder') return currentA;
  return undefined;
}

function maxDefined(...values: Array<number | undefined>): number | undefined {
  const defined = values.filter((value): value is number => value != null && Number.isFinite(value));
  return defined.length ? Math.max(...defined) : undefined;
}

function minDefined(...values: Array<number | undefined>): number | undefined {
  const defined = values.filter((value): value is number => value != null && Number.isFinite(value));
  return defined.length ? Math.min(...defined) : undefined;
}

function cableTableIndex(awg: string | undefined): number | undefined {
  if (!awg) return undefined;
  const index = CABLE_TABLE.findIndex((cable) => cable.awg === awg);
  return index >= 0 ? index : undefined;
}

function smallerMaxCableAwg(...awgs: Array<string | undefined>): string | undefined {
  const indexes = awgs
    .map(cableTableIndex)
    .filter((index): index is number => index != null);
  if (indexes.length === 0) return undefined;
  return CABLE_TABLE[Math.min(...indexes)].awg;
}

function estimatePowerCurrent(powerW: number | undefined, voltageV: number | undefined): number | undefined {
  if (!powerW || !voltageV || voltageV <= 0) return undefined;
  return powerW / voltageV;
}

function defaultTerminalVoltage(product: Product, component: SystemComponent, terminal: TerminalDefinition, system: SystemDesign): number {
  if (terminal.voltageNominalV) return terminal.voltageNominalV;
  if (terminal.kind === 'ac_power') {
    return product.inverterChargerRatings?.acInputVoltageV ??
      product.inverterChargerRatings?.acOutputVoltageV ??
      component.instanceVoltageV ??
      120;
  }
  if (terminal.kind === 'pv_power') {
    return product.solarPanelRatings?.vmpV ??
      product.solarPanelRatings?.vocV ??
      product.maxPvVoltageV ??
      terminal.voltageMaxV ??
      system.nominalVoltage;
  }
  return component.instanceVoltageV ?? product.batteryRatings?.nominalVoltageV ?? system.nominalVoltage;
}

function loadCurrentFromProduct(
  product: Product,
  component: SystemComponent,
  terminal: TerminalDefinition,
  system: SystemDesign
): number | undefined {
  const voltage = defaultTerminalVoltage(product, component, terminal, system);
  if (component.instanceMaxCurrentA != null) return positiveNumber(component.instanceMaxCurrentA);

  if (product.loadRatings?.currentA != null) return positiveNumber(product.loadRatings.currentA);
  if (product.loadRatings?.powerW != null) return estimatePowerCurrent(product.loadRatings.powerW, voltage);
  if (product.continuousPowerW != null) return estimatePowerCurrent(product.continuousPowerW, voltage);
  if (product.maxCurrentA != null) return positiveNumber(product.maxCurrentA);

  return undefined;
}

function terminalCurrents(
  product: Product,
  component: SystemComponent,
  terminal: TerminalDefinition,
  system: SystemDesign
): Pick<TerminalBehavior, 'normalLoadCurrentA' | 'normalSourceCurrentA' | 'hasNormalSource' | 'hasLoadFollowingSource' | 'canReceiveCurrent' | 'sourceCapabilityA'> {
  const busType = busTypeFromTerminal(terminal);
  const direction = inferTerminalDirection(terminal);
  const terminalId = terminal.id.toLowerCase();
  const voltage = defaultTerminalVoltage(product, component, terminal, system);

  let loadA = 0;
  let sourceA = 0;
  let hasNormalSource = canProvidePower(terminal) && direction !== 'input';
  let hasLoadFollowingSource = false;
  let canReceive = canReceivePower(terminal);
  let sourceCapabilityA: number | undefined;

  if (!isPowerBus(busType)) {
    return { normalLoadCurrentA: 0, normalSourceCurrentA: 0, hasNormalSource: false, hasLoadFollowingSource: false, canReceiveCurrent: false };
  }

  const instanceOverrideA = instanceCurrentOverrideA(product, component);
  if (instanceOverrideA != null) {
    if (direction === 'output' || terminal.role === 'source') {
      return {
        normalLoadCurrentA: 0,
        normalSourceCurrentA: instanceOverrideA,
        hasNormalSource: true,
        hasLoadFollowingSource: false,
        canReceiveCurrent: false,
        sourceCapabilityA: instanceOverrideA,
      };
    }
    if (direction === 'input' || terminal.role === 'sink') {
      return {
        normalLoadCurrentA: instanceOverrideA,
        normalSourceCurrentA: 0,
        hasNormalSource: false,
        hasLoadFollowingSource: false,
        canReceiveCurrent: true,
        sourceCapabilityA: undefined,
      };
    }
    return {
      normalLoadCurrentA: 0,
      normalSourceCurrentA: 0,
      hasNormalSource: true,
      hasLoadFollowingSource: true,
      canReceiveCurrent: true,
      sourceCapabilityA: instanceOverrideA,
    };
  }

  if (isProtectionProduct(product) || isConductivePassThroughProduct(product)) {
    return {
      normalLoadCurrentA: 0,
      normalSourceCurrentA: 0,
      hasNormalSource: false,
      hasLoadFollowingSource: false,
      canReceiveCurrent: true,
      sourceCapabilityA: undefined,
    };
  }

  // Terminal-first: if this terminal declares maxCurrentA or maxPowerW, resolve current
  // directly from terminal data without needing a product-type switch. This is what
  // makes new "open" products work — they just define terminals with the right values.
  const declaredA = resolveTerminalCurrentA(terminal, voltage);
  if (declaredA != null) {
    if (direction === 'output' || terminal.role === 'source') {
      return {
        normalLoadCurrentA: 0,
        normalSourceCurrentA: declaredA,
        hasNormalSource: declaredA > 0,
        hasLoadFollowingSource: false,
        canReceiveCurrent: false,
        sourceCapabilityA: declaredA,
      };
    }
    if (direction === 'input' || terminal.role === 'sink') {
      return {
        normalLoadCurrentA: declaredA,
        normalSourceCurrentA: 0,
        hasNormalSource: false,
        hasLoadFollowingSource: false,
        canReceiveCurrent: true,
        sourceCapabilityA: undefined,
      };
    }
    // Bidirectional with declared current — load-following storage (battery-like).
    // Do NOT set normalSourceCurrentA: that would size every attached wire at full
    // discharge current regardless of load. Instead declare capability only and let
    // edgeCurrentFromSides() propagate the actual load demand.
    return {
      normalLoadCurrentA: 0,
      normalSourceCurrentA: 0,
      hasNormalSource: true,
      hasLoadFollowingSource: true,
      canReceiveCurrent: true,
      sourceCapabilityA: declaredA,
    };
  }

  switch (product.productType) {
    case 'battery': {
      const dischargeA = positiveNumber(component.instanceMaxCurrentA) ??
        positiveNumber(product.batteryRatings?.maxDischargeCurrentA) ??
        positiveNumber(product.maxCurrentA);
      sourceCapabilityA = dischargeA;
      hasNormalSource = true;
      hasLoadFollowingSource = true;
      canReceive = true;
      break;
    }

    case 'solar_array': {
      sourceA = positiveNumber(product.maxPvCurrentA) ??
        positiveNumber(product.solarPanelRatings?.iscA) ??
        positiveNumber(product.solarPanelRatings?.impA) ??
        0;
      sourceCapabilityA = sourceA;
      hasNormalSource = sourceA > 0;
      break;
    }

    case 'mppt': {
      if (terminal.kind === 'pv_power') {
        loadA = positiveNumber(product.mpptRatings?.maxPvCurrentA) ??
          positiveNumber(product.maxPvCurrentA) ??
          0;
      } else if (terminal.kind === 'dc_power') {
        sourceA = positiveNumber(product.mpptRatings?.maxOutputCurrentA) ??
          positiveNumber(product.maxCurrentA) ??
          0;
        sourceCapabilityA = sourceA;
        hasNormalSource = sourceA > 0;
      }
      break;
    }

    case 'dc_dc_charger': {
      if (terminalId.startsWith('in')) {
        loadA = positiveNumber(product.dcDcChargerRatings?.inputCurrentA) ??
          estimatePowerCurrent(product.dcDcChargerRatings?.outputPowerW ?? product.continuousPowerW, voltage) ??
          positiveNumber(product.maxCurrentA) ??
          0;
      } else if (terminalId.startsWith('out')) {
        sourceA = positiveNumber(product.dcDcChargerRatings?.outputCurrentA) ??
          positiveNumber(product.maxCurrentA) ??
          0;
        sourceCapabilityA = sourceA;
        hasNormalSource = sourceA > 0;
      }
      break;
    }

    case 'inverter_charger': {
      if (terminal.kind === 'dc_power') {
        const inverterDrawA = positiveNumber(product.inverterChargerRatings?.maxDcCurrentA) ??
          estimatePowerCurrent(
            product.inverterChargerRatings?.continuousInverterW ?? product.continuousPowerW,
            system.nominalVoltage * system.assumptions.inverterEfficiency
          ) ??
          positiveNumber(product.maxCurrentA) ??
          0;
        const chargerA = positiveNumber(product.inverterChargerRatings?.chargerCurrentA) ?? 0;
        loadA = inverterDrawA;
        sourceA = chargerA;
        sourceCapabilityA = maxDefined(inverterDrawA, chargerA);
        hasNormalSource = chargerA > 0;
        canReceive = true;
      } else if (terminal.kind === 'ac_power' && terminalId.includes('in')) {
        loadA = positiveNumber(product.inverterChargerRatings?.acInputCurrentA) ??
          estimatePowerCurrent(product.continuousPowerW, voltage) ??
          0;
      } else if (terminal.kind === 'ac_power' && terminalId.includes('out')) {
        sourceA = positiveNumber(product.inverterChargerRatings?.acOutputCurrentA) ??
          estimatePowerCurrent(product.continuousPowerW, voltage) ??
          0;
        sourceCapabilityA = sourceA;
        hasNormalSource = sourceA > 0;
      }
      break;
    }

    case 'shore_charger': {
      if (terminal.kind === 'ac_power') {
        loadA = estimatePowerCurrent(product.continuousPowerW, voltage) ?? 0;
      } else if (terminal.kind === 'dc_power') {
        sourceA = positiveNumber(product.maxCurrentA) ?? 0;
        sourceCapabilityA = sourceA;
        hasNormalSource = sourceA > 0;
      }
      break;
    }

    case 'dc_load':
    case 'ac_load': {
      loadA = loadCurrentFromProduct(product, component, terminal, system) ?? 0;
      break;
    }

    case 'shorePowerInlet': {
      sourceA = positiveNumber(component.instanceMaxCurrentA) ??
        positiveNumber(product.maxCurrentA) ??
        estimatePowerCurrent(product.continuousPowerW, voltage) ??
        0;
      sourceCapabilityA = sourceA;
      hasNormalSource = sourceA > 0;
      break;
    }

    default: {
      if (isProtectionProduct(product) || isConductivePassThroughProduct(product)) {
        hasNormalSource = false;
        canReceive = true;
        break;
      }

      const genericCurrentA = loadCurrentFromProduct(product, component, terminal, system) ?? 0;
      if (direction === 'input') {
        loadA = genericCurrentA;
      } else if (direction === 'output') {
        sourceA = genericCurrentA;
        sourceCapabilityA = sourceA;
        hasNormalSource = sourceA > 0;
      } else if (product.productType === 'accessory' && product.dataQuality === 'placeholder') {
        sourceA = genericCurrentA;
        sourceCapabilityA = sourceA;
        hasNormalSource = sourceA > 0;
      }
      break;
    }
  }

  return {
    normalLoadCurrentA: loadA,
    normalSourceCurrentA: sourceA,
    hasNormalSource: hasNormalSource || sourceA > 0,
    hasLoadFollowingSource,
    canReceiveCurrent: canReceive || loadA > 0 || product.productType === 'battery',
    sourceCapabilityA,
  };
}

function terminalBehavior(
  product: Product,
  component: SystemComponent,
  terminal: TerminalDefinition,
  system: SystemDesign
): TerminalBehavior {
  const currents = terminalCurrents(product, component, terminal, system);
  const busType = busTypeFromTerminal(terminal);
  const isSourceLike = currents.hasNormalSource || product.productType === 'battery';

  return {
    direction: inferTerminalDirection(terminal),
    ...currents,
    canSourceFaultCurrent: isPowerBus(busType) && isSourceLike,
    requiresOvercurrentProtection: Boolean(terminal.requiresOvercurrentProtection),
    recommendedFuseA: positiveNumber(terminal.recommendedFuseA),
    maxFuseA: positiveNumber(terminal.maxFuseA),
  };
}

function buildTerminalNodes(system: SystemDesign, products: Map<string, Product>): Map<string, TerminalNode> {
  const nodes = new Map<string, TerminalNode>();

  for (const component of system.components) {
    const baseProduct = products.get(component.productId);
    const product = getEffectiveProductForComponent(component, baseProduct);
    if (!product) continue;

    for (const terminal of getEffectiveTerminals(product, component)) {
      const key = terminalKey(component.id, terminal.id);
      nodes.set(key, {
        key,
        component,
        product,
        terminal,
        busType: busTypeFromTerminal(terminal),
        behavior: terminalBehavior(product, component, terminal, system),
      });
    }
  }

  resolvePassThroughBusTypes(nodes, system);

  return nodes;
}

/**
 * Pass-through conductors (fuses, breakers, disconnects, bare busbars) are
 * bus-agnostic: their polarity/bus is determined by whatever they are wired to,
 * not by a fixed terminal type. The effective-terminal layer only stamps that
 * bus type when a separate inference pass has populated `inferredPolarity` on the
 * placed component. When it hasn't (e.g. a fuse wired between two un-polarized
 * dynamic conductors), those terminals come back as `unknown`, which would drop
 * the internal conductive edge and break current propagation across the device —
 * producing different branch currents before and after a fuse.
 *
 * This resolves that at analysis time by letting an `unknown` pass-through node
 * adopt the bus type of a connected neighbour (or a sibling power terminal on the
 * same single-conductor device), propagated to a fixed point so it spans chains.
 */
function resolvePassThroughBusTypes(nodes: Map<string, TerminalNode>, system: SystemDesign): void {
  const neighbors = new Map<string, string[]>();
  const link = (a: string, b: string) => {
    neighbors.set(a, [...(neighbors.get(a) ?? []), b]);
    neighbors.set(b, [...(neighbors.get(b) ?? []), a]);
  };

  for (const connection of system.connections) {
    const a = terminalKey(connection.fromComponentId, connection.fromTerminalId);
    const b = terminalKey(connection.toComponentId, connection.toTerminalId);
    if (nodes.has(a) && nodes.has(b)) link(a, b);
  }

  // Power terminals on a single-conductor device (fuse/breaker/bare busbar) all
  // sit on the same bus, so they can seed each other's bus type.
  const byComponent = new Map<string, TerminalNode[]>();
  for (const node of nodes.values()) {
    byComponent.set(node.component.id, [...(byComponent.get(node.component.id) ?? []), node]);
  }
  for (const group of byComponent.values()) {
    if (!isDynamicSingleConductorProduct(group[0].product)) continue;
    const powerKeys = group
      .filter((node) => ['dc_power', 'pv_power', 'ac_power'].includes(node.terminal.kind))
      .map((node) => node.key);
    for (let i = 0; i < powerKeys.length; i += 1) {
      for (let j = i + 1; j < powerKeys.length; j += 1) link(powerKeys[i], powerKeys[j]);
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes.values()) {
      if (node.busType !== 'unknown' || !isConductivePassThroughProduct(node.product)) continue;
      for (const neighborKey of neighbors.get(node.key) ?? []) {
        const neighborBusType = nodes.get(neighborKey)?.busType;
        if (neighborBusType && neighborBusType !== 'unknown') {
          node.busType = neighborBusType;
          changed = true;
          break;
        }
      }
    }
  }
}

function connectionBusType(from: TerminalNode | undefined, to: TerminalNode | undefined): BusType {
  if (!from || !to) return 'unknown';
  if (from.busType === to.busType) return from.busType;
  if (from.busType === 'unknown') return to.busType;
  if (to.busType === 'unknown') return from.busType;
  return 'unknown';
}

function buildGraphEdges(system: SystemDesign, nodes: Map<string, TerminalNode>): GraphEdge[] {
  const edges: GraphEdge[] = [];

  for (const connection of system.connections) {
    const fromKey = terminalKey(connection.fromComponentId, connection.fromTerminalId);
    const toKey = terminalKey(connection.toComponentId, connection.toTerminalId);
    const from = nodes.get(fromKey);
    const to = nodes.get(toKey);
    const busType = connectionBusType(from, to);
    edges.push({
      id: `conn:${connection.id}`,
      kind: 'connection',
      fromKey,
      toKey,
      busType,
      connectionId: connection.id,
      lengthFt: connection.cableLengthFt,
    });
  }

  for (const component of system.components) {
    const componentNodes = [...nodes.values()].filter((node) => node.component.id === component.id);
    const product = componentNodes[0]?.product;
    if (!product) continue;

    if (hasDistributionTopology(product)) {
      for (const internalEdge of buildInternalDistributionEdges(component, product)) {
        const fromKey = terminalKey(component.id, internalEdge.fromTerminalId);
        const toKey = terminalKey(component.id, internalEdge.toTerminalId);
        if (!nodes.has(fromKey) || !nodes.has(toKey)) continue;

        edges.push({
          id: `internal:${component.id}:${internalEdge.id}`,
          kind: 'internal',
          fromKey,
          toKey,
          busType: internalEdge.busType,
          componentId: component.id,
          protectionRatingA: internalEdge.protectionRatingA,
          protectionLabel: internalEdge.fuseSlotId
            ? `${component.label ?? product.name} ${internalEdge.protectionLabel ?? internalEdge.fuseSlotId}`
            : undefined,
          protectedTerminalKey: internalEdge.fuseSlotId ? toKey : undefined,
        });
      }
      continue;
    }

    if (!isConductivePassThroughProduct(product)) continue;

    const powerNodes = componentNodes.filter((node) => ['dc_power', 'pv_power', 'ac_power'].includes(node.terminal.kind));
    const groups = new Map<string, { busType: BusType; nodes: TerminalNode[] }>();
    for (const node of powerNodes) {
      if (!isPowerBus(node.busType)) continue;
      const groupKey = passThroughGroupKey(product, node, powerNodes.length);
      const group = groups.get(groupKey) ?? { busType: node.busType, nodes: [] };
      group.nodes.push(node);
      groups.set(groupKey, group);
    }

    for (const { busType, nodes: group } of groups.values()) {
      if (group.length < 2) continue;
      const first = group[0];
      for (const node of group.slice(1)) {
        edges.push({
          id: `internal:${component.id}:${first.terminal.id}:${node.terminal.id}`,
          kind: 'internal',
          fromKey: first.key,
          toKey: node.key,
          busType,
          componentId: component.id,
          protectionRatingA: product.protectionRatings?.currentRatingA ?? product.maxCurrentA,
          protectionLabel: isProtectionProduct(product) ? component.label ?? product.name : undefined,
        });
      }
    }
  }

  return edges;
}

function buildAdjacency(edges: GraphEdge[]): Map<string, GraphEdge[]> {
  const adjacency = new Map<string, GraphEdge[]>();
  for (const edge of edges) {
    adjacency.set(edge.fromKey, [...(adjacency.get(edge.fromKey) ?? []), edge]);
    adjacency.set(edge.toKey, [...(adjacency.get(edge.toKey) ?? []), edge]);
  }
  return adjacency;
}

function otherKey(edge: GraphEdge, key: string): string {
  return edge.fromKey === key ? edge.toKey : edge.fromKey;
}

function collectSide(
  startKey: string,
  blockedEdgeId: string,
  busType: BusType,
  adjacency: Map<string, GraphEdge[]>,
  nodes: Map<string, TerminalNode>
): Set<string> {
  const visited = new Set<string>();
  const pending = [startKey];

  while (pending.length > 0) {
    const key = pending.pop()!;
    if (visited.has(key)) continue;
    visited.add(key);

    for (const edge of adjacency.get(key) ?? []) {
      if (edge.id === blockedEdgeId) continue;
      if (edge.busType !== busType) continue;

      const nextKey = otherKey(edge, key);
      const nextNode = nodes.get(nextKey);
      if (!nextNode || nextNode.busType !== busType) continue;
      pending.push(nextKey);
    }
  }

  return visited;
}

function summarizeSide(keys: Set<string>, nodes: Map<string, TerminalNode>): SideSummary {
  let normalLoadCurrentA = 0;
  let normalSourceCurrentA = 0;
  let hasNormalSource = false;
  let hasLoadFollowingSource = false;
  let canReceiveCurrent = false;
  let canSourceFaultCurrent = false;
  let requiresOvercurrentProtection = false;
  let sourceCapacityA: number | undefined;
  let recommendedFuseA: number | undefined;
  let maxFuseA: number | undefined;

  for (const key of keys) {
    const behavior = nodes.get(key)?.behavior;
    if (!behavior) continue;

    normalLoadCurrentA += behavior.normalLoadCurrentA;
    normalSourceCurrentA += behavior.normalSourceCurrentA;
    hasNormalSource = hasNormalSource || behavior.hasNormalSource;
    hasLoadFollowingSource = hasLoadFollowingSource || behavior.hasLoadFollowingSource;
    canReceiveCurrent = canReceiveCurrent || behavior.canReceiveCurrent;
    canSourceFaultCurrent = canSourceFaultCurrent || behavior.canSourceFaultCurrent;
    requiresOvercurrentProtection = requiresOvercurrentProtection || behavior.requiresOvercurrentProtection;
    sourceCapacityA = sourceCapacityA == null
      ? behavior.sourceCapabilityA
      : behavior.sourceCapabilityA == null
        ? sourceCapacityA
        : sourceCapacityA + behavior.sourceCapabilityA;
    recommendedFuseA = maxDefined(recommendedFuseA, behavior.recommendedFuseA);
    maxFuseA = minDefined(maxFuseA, behavior.maxFuseA);
  }

  return {
    keys,
    normalLoadCurrentA,
    normalSourceCurrentA,
    hasNormalSource,
    hasLoadFollowingSource,
    canReceiveCurrent,
    canSourceFaultCurrent,
    sourceCapacityA,
    requiresOvercurrentProtection,
    recommendedFuseA,
    maxFuseA,
  };
}

function edgeCurrentFromSides(from: SideSummary, to: SideSummary): number {
  // A side only inherits a source's *full* rated output when it contains genuine
  // load-following storage (a battery/bus that takes whatever the source produces).
  // A side whose only sink is a fixed load must not pin the branch at the source
  // rating: that load's real demand is already captured by `loadDriven` below as
  // min(sourceCurrent, loadDemand). Treating a fixed load as a full absorber is the
  // bug that made e.g. a 50A source feeding a 15A load read 50A across the branch
  // (including on both sides of an in-line fuse).
  const canAbsorbNormalSourceCurrent = (side: SideSummary): boolean => {
    return side.hasLoadFollowingSource;
  };

  const currentAvailableToLoad = (sourceSide: SideSummary, loadDemandA: number): number => {
    if (!sourceSide.hasNormalSource && !sourceSide.canSourceFaultCurrent) return 0;

    // Batteries and other storage-like sources follow the load current. Current-limited
    // sources such as MPPTs, DC-DC chargers, and inverter AC outputs advertise their
    // normal source current, so they cannot make their branch inherit every downstream load.
    if (sourceSide.hasLoadFollowingSource || sourceSide.normalSourceCurrentA <= 0) return loadDemandA;
    return Math.min(loadDemandA, sourceSide.normalSourceCurrentA);
  };

  const loadDriven = Math.max(
    currentAvailableToLoad(to, from.normalLoadCurrentA),
    currentAvailableToLoad(from, to.normalLoadCurrentA)
  );
  const sourceDriven = Math.max(
    canAbsorbNormalSourceCurrent(to) ? from.normalSourceCurrentA : 0,
    canAbsorbNormalSourceCurrent(from) ? to.normalSourceCurrentA : 0
  );

  return Math.max(loadDriven, sourceDriven);
}

function voltageForConnection(
  connection: SystemConnection,
  busType: BusType,
  nodes: Map<string, TerminalNode>,
  system: SystemDesign
): number {
  const from = nodes.get(terminalKey(connection.fromComponentId, connection.fromTerminalId));
  const to = nodes.get(terminalKey(connection.toComponentId, connection.toTerminalId));
  const terminalVoltages = [from, to]
    .map((node) => node ? defaultTerminalVoltage(node.product, node.component, node.terminal, system) : undefined)
    .filter((value): value is number => value != null && Number.isFinite(value) && value > 0);

  if (terminalVoltages.length > 0) return Math.max(...terminalVoltages);
  if (busType === 'ac_line' || busType === 'ac_neutral' || busType === 'ac_ground') return 120;
  return system.nominalVoltage;
}

function nodesForConnection(
  connection: SystemConnection,
  nodes: Map<string, TerminalNode>
): [TerminalNode | undefined, TerminalNode | undefined] {
  return [
    nodes.get(terminalKey(connection.fromComponentId, connection.fromTerminalId)),
    nodes.get(terminalKey(connection.toComponentId, connection.toTerminalId)),
  ];
}

function otherComponentId(connection: SystemConnection, componentId: string): string | undefined {
  if (connection.fromComponentId === componentId) return connection.toComponentId;
  if (connection.toComponentId === componentId) return connection.fromComponentId;
  return undefined;
}

function batteryCollectorLead(
  connection: SystemConnection,
  nodes: Map<string, TerminalNode>,
  shortLeadMaxFt: number
): { collectorId: string; batteryId: string; busType: BusType; connectionId: string } | undefined {
  if (connection.cableLengthFt > shortLeadMaxFt) return undefined;

  const [fromNode, toNode] = nodesForConnection(connection, nodes);
  if (!fromNode || !toNode || fromNode.busType !== toNode.busType) return undefined;
  if (fromNode.busType !== 'dc_pos' && fromNode.busType !== 'dc_neg') return undefined;

  if (isBatteryProduct(fromNode.product) && isCollectorProduct(toNode.product)) {
    return {
      collectorId: toNode.component.id,
      batteryId: fromNode.component.id,
      busType: fromNode.busType,
      connectionId: connection.id,
    };
  }

  if (isBatteryProduct(toNode.product) && isCollectorProduct(fromNode.product)) {
    return {
      collectorId: fromNode.component.id,
      batteryId: toNode.component.id,
      busType: toNode.busType,
      connectionId: connection.id,
    };
  }

  return undefined;
}

function batterySetKey(batteryIds: Iterable<string>): string {
  return [...batteryIds].sort().join('|');
}

function selectedProtectionRatingFromCollector(
  collectorId: string,
  system: SystemDesign,
  nodes: Map<string, TerminalNode>,
  productsByComponent: Map<string, Product | undefined>,
  shortLeadMaxFt: number
): number | undefined {
  const ratings: number[] = [];

  for (const connection of system.connections) {
    if (connection.fromComponentId !== collectorId && connection.toComponentId !== collectorId) continue;
    if (connection.cableLengthFt > shortLeadMaxFt) continue;

    const [fromNode, toNode] = nodesForConnection(connection, nodes);
    if (!fromNode || !toNode) continue;

    const collectorNode = fromNode.component.id === collectorId ? fromNode : toNode;
    if (collectorNode.busType !== 'dc_pos') continue;

    const otherId = otherComponentId(connection, collectorId);
    const otherProduct = otherId ? productsByComponent.get(otherId) : undefined;
    const ratingA = isProtectionProduct(otherProduct) ? protectionRating(otherProduct) : undefined;
    if (ratingA != null) ratings.push(ratingA);
  }

  return ratings.length > 0 ? Math.max(...ratings) : undefined;
}

function buildParallelBankReturnCurrentOverrides(
  system: SystemDesign,
  nodes: Map<string, TerminalNode>,
  productsByComponent: Map<string, Product | undefined>,
  shortLeadMaxFt: number
): Map<string, number> {
  const leadsByCollectorAndBus = new Map<string, Set<string>>();
  for (const connection of system.connections) {
    const lead = batteryCollectorLead(connection, nodes, shortLeadMaxFt);
    if (!lead) continue;
    const key = `${lead.collectorId}:${lead.busType}`;
    leadsByCollectorAndBus.set(key, new Set([...(leadsByCollectorAndBus.get(key) ?? []), lead.batteryId]));
  }

  const positiveCollectors = new Map<string, { collectorId: string; fuseA: number }>();
  for (const [key, batteryIds] of leadsByCollectorAndBus) {
    const [collectorId, busType] = key.split(':') as [string, BusType];
    if (busType !== 'dc_pos' || batteryIds.size < 2) continue;

    const fuseA = selectedProtectionRatingFromCollector(collectorId, system, nodes, productsByComponent, shortLeadMaxFt);
    if (fuseA == null) continue;
    positiveCollectors.set(batterySetKey(batteryIds), { collectorId, fuseA });
  }

  const overrides = new Map<string, number>();
  for (const [key, batteryIds] of leadsByCollectorAndBus) {
    const [collectorId, busType] = key.split(':') as [string, BusType];
    if (busType !== 'dc_neg' || batteryIds.size < 2) continue;

    const positiveCollector = positiveCollectors.get(batterySetKey(batteryIds));
    if (!positiveCollector) continue;

    for (const connection of system.connections) {
      if (connection.fromComponentId !== collectorId && connection.toComponentId !== collectorId) continue;

      const [fromNode, toNode] = nodesForConnection(connection, nodes);
      if (!fromNode || !toNode || fromNode.busType !== 'dc_neg' || toNode.busType !== 'dc_neg') continue;

      const otherId = otherComponentId(connection, collectorId);
      const otherProduct = otherId ? productsByComponent.get(otherId) : undefined;
      if (isBatteryProduct(otherProduct)) continue;

      overrides.set(connection.id, Math.max(overrides.get(connection.id) ?? 0, positiveCollector.fuseA));
    }
  }

  // Daisy-chain parallel packs: Battery2+ → Battery1+, Battery1+ → Fuse → bus.
  // The fuse is on Battery1's outgoing positive lead, not on the busbar's output,
  // so the busbar-based detection above never fires. Find the pack fuse directly
  // from the short battery-to-fuse connection and apply it to the dc_neg return
  // from either battery to non-battery loads.
  const packFuseByBatteryId = new Map<string, number>();
  for (const connection of system.connections) {
    if (connection.cableLengthFt > shortLeadMaxFt) continue;
    const [fromNode, toNode] = nodesForConnection(connection, nodes);
    if (!fromNode || !toNode) continue;
    if (fromNode.busType !== 'dc_pos' || toNode.busType !== 'dc_pos') continue;

    const batteryNode = isBatteryProduct(fromNode.product) ? fromNode
      : isBatteryProduct(toNode.product) ? toNode
      : null;
    const otherNode = batteryNode === fromNode ? toNode : fromNode;
    if (!batteryNode || !isProtectionProduct(otherNode.product)) continue;

    const rating = protectionRating(otherNode.product);
    if (rating == null) continue;
    packFuseByBatteryId.set(
      batteryNode.component.id,
      Math.max(packFuseByBatteryId.get(batteryNode.component.id) ?? 0, rating)
    );
  }

  for (const connection of system.connections) {
    if (connection.cableLengthFt > shortLeadMaxFt) continue;
    const [fromNode, toNode] = nodesForConnection(connection, nodes);
    if (!fromNode || !toNode) continue;
    if (fromNode.busType !== 'dc_pos' || toNode.busType !== 'dc_pos') continue;
    if (!isBatteryProduct(fromNode.product) || !isBatteryProduct(toNode.product)) continue;

    // Find the pack fuse from either side of this inter-battery positive connection
    const fuseA = maxDefined(
      packFuseByBatteryId.get(fromNode.component.id),
      packFuseByBatteryId.get(toNode.component.id)
    );
    if (fuseA == null) continue;

    // The positive interconnect itself carries the parallel battery's full
    // contribution to the pack output, so size it for the pack fuse rating too.
    // Without this it has no current source on either side (both ends are
    // load-following batteries) and falls back to the table-minimum cable.
    overrides.set(connection.id, Math.max(overrides.get(connection.id) ?? 0, fuseA));

    // Apply the pack fuse rating to dc_neg connections from either battery. This
    // covers both the negative return to the bank's collector/bus and the
    // battery-to-battery negative interconnect, which carries the same current.
    for (const batteryId of [fromNode.component.id, toNode.component.id]) {
      for (const negConn of system.connections) {
        if (negConn.fromComponentId !== batteryId && negConn.toComponentId !== batteryId) continue;
        const [negFrom, negTo] = nodesForConnection(negConn, nodes);
        if (!negFrom || !negTo || negFrom.busType !== 'dc_neg' || negTo.busType !== 'dc_neg') continue;
        overrides.set(negConn.id, Math.max(overrides.get(negConn.id) ?? 0, fuseA));
      }
    }
  }

  return overrides;
}

function cableForAmpacityAndDrop(
  ampacityCurrentA: number,
  voltageDropCurrentA: number,
  lengthFt: number,
  voltageV: number,
  maxDropPercent: number,
  maxCableAwg?: string
): { awg: string; dropV: number; dropPercent: number; satisfiesDrop: boolean } {
  const firstAmpacityMatch = cableForCurrent(ampacityCurrentA);
  const startIndex = Math.max(0, CABLE_TABLE.findIndex((cable) => cable.awg === firstAmpacityMatch.awg));
  const maxCableIndex = cableTableIndex(maxCableAwg);
  const endIndex = maxCableIndex == null ? CABLE_TABLE.length - 1 : maxCableIndex;
  const cappedStartIndex = Math.min(startIndex, endIndex);

  for (const cable of CABLE_TABLE.slice(cappedStartIndex, endIndex + 1)) {
    const dropV = voltageDropV(voltageDropCurrentA, lengthFt, cable.awg);
    const dropPercent = voltageV > 0 ? (dropV / voltageV) * 100 : 0;
    if (dropPercent <= maxDropPercent) {
      return { awg: cable.awg, dropV, dropPercent, satisfiesDrop: true };
    }
  }

  const largestAllowed = CABLE_TABLE[endIndex];
  const dropV = voltageDropV(voltageDropCurrentA, lengthFt, largestAllowed.awg);
  const dropPercent = voltageV > 0 ? (dropV / voltageV) * 100 : 0;
  return { awg: largestAllowed.awg, dropV, dropPercent, satisfiesDrop: dropPercent <= maxDropPercent };
}

function chooseFuse(minimumA: number, maximumA: number | undefined, preferredA: number | undefined): number | undefined {
  if (preferredA != null && preferredA >= minimumA && (maximumA == null || preferredA <= maximumA)) {
    return preferredA;
  }

  return STANDARD_FUSE_RATINGS.find((rating) => rating >= minimumA && (maximumA == null || rating <= maximumA));
}

function protectionRating(product: Product | undefined): number | undefined {
  return product?.protectionRatings?.currentRatingA ?? product?.maxCurrentA;
}

function protectionDeviceFromNode(node: TerminalNode): BranchProtectionDevice | undefined {
  if (!isProtectionProduct(node.product)) return undefined;
  return {
    componentId: node.component.id,
    label: node.component.label ?? node.product.name,
    ratingA: protectionRating(node.product),
  };
}

function isProtectionSourceTerminal(node: TerminalNode | undefined): boolean {
  if (!node || !isProtectionProduct(node.product)) return false;
  return node.terminal.id === 'in' || node.terminal.direction === 'input';
}

function dedupeProtectionDevices(devices: BranchProtectionDevice[]): BranchProtectionDevice[] {
  return devices.filter((device, index, all) => {
    const key = `${device.componentId}:${device.label}:${device.ratingA ?? ''}`;
    return all.findIndex((item) => `${item.componentId}:${item.label}:${item.ratingA ?? ''}` === key) === index;
  });
}

function slotProtectionAtTerminal(
  key: string,
  adjacency: Map<string, GraphEdge[]>
): BranchProtectionDevice | undefined {
  const edge = (adjacency.get(key) ?? []).find((item) => item.protectedTerminalKey === key && item.protectionLabel);
  if (!edge) return undefined;
  return {
    componentId: edge.componentId ?? '',
    label: edge.protectionLabel!,
    ratingA: edge.protectionRatingA,
  };
}

function selectedProtectionDevicesForConnection(
  connection: SystemConnection,
  nodes: Map<string, TerminalNode>,
  adjacency: Map<string, GraphEdge[]>
): BranchProtectionDevice[] {
  const endpointKeys = [
    terminalKey(connection.fromComponentId, connection.fromTerminalId),
    terminalKey(connection.toComponentId, connection.toTerminalId),
  ];
  const devices = endpointKeys.flatMap((key) => {
    const node = nodes.get(key);
    const productDevice = node ? protectionDeviceFromNode(node) : undefined;
    const slotDevice = slotProtectionAtTerminal(key, adjacency);
    return [productDevice, slotDevice].filter((item): item is BranchProtectionDevice => Boolean(item));
  });

  return dedupeProtectionDevices(devices);
}

function protectionForSourceSide(
  sideKey: string,
  oppositeKey: string,
  connectionLengthFt: number,
  shortSourceLeadMaxFt: number,
  nodes: Map<string, TerminalNode>,
  adjacency: Map<string, GraphEdge[]>
): BranchProtectionDevice | undefined {
  const sideNode = nodes.get(sideKey);
  const oppositeNode = nodes.get(oppositeKey);

  // A cable endpoint on a fuse or breaker is protected from sources behind that
  // device. Fuse current interruption is bidirectional; "in/out" labels only
  // help identify source leads that terminate at the fuse.
  if (sideNode && isProtectionProduct(sideNode.product)) {
    const device = protectionDeviceFromNode(sideNode);
    if (device) return device;
  }

  // A source lead ending at a fuse or breaker is allowed when the lead is short
  // enough to treat the protection device as mounted at that source endpoint.
  // The schematic does not model physical mounting, so cable length is the
  // configured proxy for "close enough".
  if (
    oppositeNode &&
    isProtectionProduct(oppositeNode.product) &&
    connectionLengthFt <= shortSourceLeadMaxFt
  ) {
    const device = protectionDeviceFromNode(oppositeNode);
    if (device) return device;
  }

  // Parallel battery banks often use short leads from each battery to a local
  // collector bus, with one main fuse leaving the bank. Treat those short
  // battery-to-collector segments as pack interconnects instead of requiring a
  // separate source-side fuse on every segment.
  if (
    sideNode &&
    oppositeNode &&
    connectionLengthFt <= shortSourceLeadMaxFt &&
    sideNode.busType === 'dc_pos' &&
    oppositeNode.busType === 'dc_pos' &&
    (
      (isBatteryProduct(sideNode.product) && isCollectorProduct(oppositeNode.product)) ||
      (isCollectorProduct(sideNode.product) && isBatteryProduct(oppositeNode.product))
    )
  ) {
    const collectorNode = isCollectorProduct(sideNode.product) ? sideNode : oppositeNode;
    return {
      componentId: collectorNode.component.id,
      label: 'Short parallel battery bank interconnect',
    };
  }

  // Daisy-chain parallel packs wire Battery2+ directly to Battery1+, with the
  // outgoing fuse on Battery1's lead. The inter-battery positive connection is
  // pack wiring — no individual source-side fuse is required between the two
  // battery terminals when the cable is within the interconnect length limit.
  if (
    sideNode &&
    oppositeNode &&
    connectionLengthFt <= shortSourceLeadMaxFt &&
    sideNode.busType === 'dc_pos' &&
    oppositeNode.busType === 'dc_pos' &&
    isBatteryProduct(sideNode.product) &&
    isBatteryProduct(oppositeNode.product)
  ) {
    return {
      componentId: sideNode.component.id,
      label: 'Short parallel battery pack interconnect',
    };
  }

  // A cable endpoint on the source/upstream terminal of a fuse or breaker keeps
  // the legacy V1 behavior when a project has not configured a short-lead limit.
  if (oppositeNode && isProtectionSourceTerminal(oppositeNode) && shortSourceLeadMaxFt <= 0) {
    const device = protectionDeviceFromNode(oppositeNode);
    if (device) return device;
  }

  // Distribution products model protected outputs as internal fused edges.
  return slotProtectionAtTerminal(sideKey, adjacency);
}

function sourceSideRequiresProtection(
  side: SideSummary | undefined,
  busType: BusType,
  cableAmpacityA: number | undefined
): boolean {
  if (!side || !isPowerBus(busType)) return false;
  const sourcePresent = side.canSourceFaultCurrent || side.hasNormalSource;
  if (!sourcePresent) return false;
  if (!busTypeRequiresFuse(busType) && !side.requiresOvercurrentProtection) return false;
  if (side.requiresOvercurrentProtection) return true;

  // Current-limited electronic sources do not require another source-side fuse
  // when their available current is already below the conductor ampacity.
  if (!side.hasLoadFollowingSource && side.sourceCapacityA != null && cableAmpacityA != null) {
    return side.sourceCapacityA > cableAmpacityA;
  }

  return true;
}

function sourceProtectionStatus(
  side: 'from' | 'to',
  sideSummary: SideSummary | undefined,
  sideKey: string,
  oppositeKey: string,
  connectionLengthFt: number,
  shortSourceLeadMaxFt: number,
  busType: BusType,
  cableAmpacityA: number | undefined,
  nodes: Map<string, TerminalNode>,
  adjacency: Map<string, GraphEdge[]>
): SourceProtectionStatus {
  const sourcePresent = Boolean(sideSummary?.canSourceFaultCurrent || sideSummary?.hasNormalSource);
  const required = sourceSideRequiresProtection(sideSummary, busType, cableAmpacityA);
  const protection = required
    ? protectionForSourceSide(sideKey, oppositeKey, connectionLengthFt, shortSourceLeadMaxFt, nodes, adjacency)
    : undefined;

  return {
    side,
    sourcePresent,
    required,
    protected: required ? Boolean(protection) : true,
    protection,
  };
}

function protectionDevicesForConnection(
  connection: SystemConnection,
  productsByComponent: Map<string, Product | undefined>,
  componentsById: Map<string, SystemComponent>,
  adjacency: Map<string, GraphEdge[]>
): BranchProtectionDevice[] {
  const productBoundaries = [connection.fromComponentId, connection.toComponentId].flatMap((componentId) => {
    const product = productsByComponent.get(componentId);
    const component = componentsById.get(componentId);
    if (!component || !isProtectionProduct(product)) return [];
    return [{
      componentId,
      label: component.label ?? product!.name,
      ratingA: protectionRating(product),
    }];
  });

  const endpointKeys = [
    terminalKey(connection.fromComponentId, connection.fromTerminalId),
    terminalKey(connection.toComponentId, connection.toTerminalId),
  ];
  const slotBoundaries = endpointKeys.flatMap((key) => {
    return (adjacency.get(key) ?? [])
      .filter((edge) => edge.protectedTerminalKey === key && edge.protectionLabel)
      .map((edge) => ({
        componentId: edge.componentId ?? '',
        label: edge.protectionLabel!,
        ratingA: edge.protectionRatingA,
      }));
  });

  return dedupeProtectionDevices([...productBoundaries, ...slotBoundaries]);
}

function analyzeConnection(
  connection: SystemConnection,
  edge: GraphEdge | undefined,
  nodes: Map<string, TerminalNode>,
  adjacency: Map<string, GraphEdge[]>,
  system: SystemDesign,
  productsByComponent: Map<string, Product | undefined>,
  componentsById: Map<string, SystemComponent>,
  inferredDesignCurrentA?: number,
  inferredVoltageV?: number,
  cableSizingCurrentFloorA?: number
): ConnectionCircuitAnalysis {
  const fromKey = terminalKey(connection.fromComponentId, connection.fromTerminalId);
  const toKey = terminalKey(connection.toComponentId, connection.toTerminalId);
  const fromNode = nodes.get(fromKey);
  const toNode = nodes.get(toKey);
  const busType = edge?.busType ?? connectionBusType(fromNode, toNode);
  const voltageV = inferredVoltageV ?? voltageForConnection(connection, busType, nodes, system);
  const protectedBy = protectionDevicesForConnection(connection, productsByComponent, componentsById, adjacency);
  const selectedProtectionDevices = selectedProtectionDevicesForConnection(connection, nodes, adjacency);
  const selectedFuseA = minDefined(...selectedProtectionDevices.map((device) => device.ratingA));
  const maxSelectedFuseA = maxDefined(...selectedProtectionDevices.map((device) => device.ratingA));
  const errors: BranchValidationIssue[] = [];
  const warnings: string[] = [];
  const addError = (code: string, message: string) => {
    errors.push({ code, message });
  };

  // A communication wire carries no power. It is never a current-carrying,
  // protectable, or sizeable conductor, so it gets no design current, fuse,
  // cable, or protection logic.
  if (connection.wireKind === 'communication') {
    return {
      connectionId: connection.id,
      busType,
      designCurrentA: 0,
      voltageV,
      protectionRequired: false,
      protectedBy: [],
      sourceProtection: [],
      recommendedCableAwg: undefined,
      selectedCableAwg: undefined,
      voltageDropV: 0,
      voltageDropPercent: 0,
      errors: [],
      warnings: [],
    };
  }

  let designCurrentA = positiveNumber(connection.designCurrentOverrideA) ?? positiveNumber(inferredDesignCurrentA) ?? 0;
  let fromSide: SideSummary | undefined;
  let toSide: SideSummary | undefined;

  if (edge && isPowerBus(busType) && fromNode && toNode) {
    fromSide = summarizeSide(collectSide(fromKey, edge.id, busType, adjacency, nodes), nodes);
    toSide = summarizeSide(collectSide(toKey, edge.id, busType, adjacency, nodes), nodes);
    if (!designCurrentA) designCurrentA = edgeCurrentFromSides(fromSide, toSide);
  }

  if (!designCurrentA) {
    const fallbackLoad = maxDefined(fromNode?.behavior.normalLoadCurrentA, toNode?.behavior.normalLoadCurrentA) ?? 0;
    const fallbackSource = maxDefined(fromNode?.behavior.normalSourceCurrentA, toNode?.behavior.normalSourceCurrentA) ?? 0;
    designCurrentA = Math.max(fallbackLoad, fallbackSource);
  }

  // A direct bus link is a bolted, zero-impedance join — the two terminals are
  // effectively the same node. It carries current and bus type but is never a
  // protectable/sizeable conductor, so it gets no fuse, cable, or protection logic.
  if (connection.busLink) {
    return {
      connectionId: connection.id,
      busType,
      designCurrentA,
      voltageV,
      protectionRequired: false,
      protectedBy: [],
      sourceProtection: [],
      recommendedCableAwg: undefined,
      selectedCableAwg: undefined,
      voltageDropV: 0,
      voltageDropPercent: 0,
      errors: [],
      warnings: [],
    };
  }

  const sideRequiresProtection = Boolean(fromSide?.requiresOvercurrentProtection || toSide?.requiresOvercurrentProtection);
  const faultSourcePresent = Boolean(
    fromSide?.canSourceFaultCurrent ||
    toSide?.canSourceFaultCurrent ||
    fromNode?.behavior.canSourceFaultCurrent ||
    toNode?.behavior.canSourceFaultCurrent
  );
  const sourcePresent = faultSourcePresent ||
    Boolean(fromSide?.hasNormalSource || toSide?.hasNormalSource || fromNode?.behavior.hasNormalSource || toNode?.behavior.hasNormalSource);
  const protectionRequired = isPowerBus(busType) &&
    designCurrentA > 0 &&
    (busTypeRequiresFuse(busType) || sideRequiresProtection) &&
    sourcePresent;

  const preferredFuseA = maxDefined(
    fromSide?.recommendedFuseA,
    toSide?.recommendedFuseA,
    fromNode?.behavior.recommendedFuseA,
    toNode?.behavior.recommendedFuseA
  );
  const terminalMaxFuseA = minDefined(
    fromSide?.maxFuseA,
    toSide?.maxFuseA,
    fromNode?.behavior.maxFuseA,
    toNode?.behavior.maxFuseA
  );
  const maxCableAwg = smallerMaxCableAwg(
    fromNode?.component.maxCableAwg,
    toNode?.component.maxCableAwg,
    fromNode?.terminal.maxCableAwg,
    toNode?.terminal.maxCableAwg
  );

  // PV source/output conductors are sized at 156% of design current (NEC 690.8);
  // all other circuits use the standard 125% continuous-load factor.
  const continuousFactor = continuousFactorForBus(busType);
  const minimumFuseA = protectionRequired ? nextStandardFuse(designCurrentA * continuousFactor) : undefined;
  const targetFuseA = minimumFuseA != null ? Math.max(minimumFuseA, preferredFuseA ?? 0) : undefined;
  const cableSizingCurrentA = Math.max(
    designCurrentA * continuousFactor,
    targetFuseA ?? 0,
    maxSelectedFuseA ?? 0,
    // A return/supply conductor is sized to match its paired leg so a fuse that
    // upsizes one side upsizes the other (both carry the same branch current).
    cableSizingCurrentFloorA ?? 0
  );
  const autoCable = cableForAmpacityAndDrop(
    cableSizingCurrentA,
    designCurrentA,
    connection.cableLengthFt,
    voltageV,
    system.assumptions.maxVoltageDropPercent,
    maxCableAwg
  );
  const selectedAwg = connection.manualCableAwg && cableByAwg(connection.manualCableAwg)
    ? connection.manualCableAwg
    : autoCable.awg;
  const selectedCable = cableByAwg(selectedAwg);
  const dropV = voltageDropV(designCurrentA, connection.cableLengthFt, selectedAwg);
  const dropPercent = voltageV > 0 ? (dropV / voltageV) * 100 : 0;
  const maxFuseByCableA = selectedCable?.ampacity;
  const maximumFuseA = minDefined(maxFuseByCableA, terminalMaxFuseA);
  const recommendedFuseA = minimumFuseA != null
    ? chooseFuse(minimumFuseA, maximumFuseA, preferredFuseA) ?? minimumFuseA
    : undefined;
  const effectiveBranchLimitA = selectedFuseA ?? recommendedFuseA;
  const shortSourceLeadMaxFt = system.assumptions.batteryInterconnectMaxLengthFt ?? DEFAULT_ASSUMPTIONS.batteryInterconnectMaxLengthFt;
  const sourceProtection = [
    sourceProtectionStatus('from', fromSide, fromKey, toKey, connection.cableLengthFt, shortSourceLeadMaxFt, busType, maxFuseByCableA, nodes, adjacency),
    sourceProtectionStatus('to', toSide, toKey, fromKey, connection.cableLengthFt, shortSourceLeadMaxFt, busType, maxFuseByCableA, nodes, adjacency),
  ];
  const finalProtectionRequired = sourceProtection.some((status) => status.required && !status.protected);

  if (dropPercent > system.assumptions.maxVoltageDropPercent) {
    warnings.push(`Voltage drop ${dropPercent.toFixed(1)}% exceeds ${system.assumptions.maxVoltageDropPercent}% limit - consider larger cable or shorter run`);
  }

  if (selectedCable && designCurrentA > selectedCable.ampacity) {
    addError(
      'CABLE_UNDERSIZED_FOR_BRANCH_CURRENT',
      `${selectedAwg} AWG cable ampacity is ${selectedCable.ampacity}A, below the ${designCurrentA.toFixed(0)}A branch design current`
    );
  }

  const fuseProtectingCableA = maxSelectedFuseA ?? recommendedFuseA;
  if ((finalProtectionRequired || selectedFuseA != null) && fuseProtectingCableA != null && maxFuseByCableA != null && fuseProtectingCableA > maxFuseByCableA) {
    addError(
      'FUSE_OVER_CABLE_AMPACITY',
      `${fuseProtectingCableA}A fuse exceeds ${selectedAwg} AWG cable ampacity of ${maxFuseByCableA}A`
    );
  }

  if (selectedFuseA != null && selectedFuseA < designCurrentA) {
    addError(
      'SELECTED_FUSE_UNDER_BRANCH_CURRENT',
      `${selectedFuseA}A selected fuse is below the ${designCurrentA.toFixed(0)}A branch design current`
    );
  } else if (selectedFuseA != null && minimumFuseA != null && selectedFuseA < minimumFuseA) {
    warnings.push(`${selectedFuseA}A selected fuse is below the ${minimumFuseA}A continuous-load recommendation for ${designCurrentA.toFixed(0)}A design current`);
  }

  if (minimumFuseA != null && terminalMaxFuseA != null && minimumFuseA > terminalMaxFuseA) {
    addError(
      'REQUIRED_FUSE_EXCEEDS_DEVICE_MAX',
      `Required fuse ${minimumFuseA}A exceeds terminal maximum fuse rating of ${terminalMaxFuseA}A`
    );
  }

  if (selectedFuseA != null && terminalMaxFuseA != null && selectedFuseA > terminalMaxFuseA) {
    addError(
      'SELECTED_FUSE_EXCEEDS_DEVICE_MAX',
      `${selectedFuseA}A selected fuse exceeds terminal maximum fuse rating of ${terminalMaxFuseA}A`
    );
  }

  for (const status of sourceProtection) {
    if (!status.required || status.protected) continue;
    addError(
      'SOURCE_SIDE_PROTECTION_MISSING',
      `${status.side === 'from' ? 'From' : 'To'} side source can energize this ${busType.replace('_', ' ')} branch without source-side fuse or breaker protection`
    );
  }

  const selectedCableIndex = cableTableIndex(selectedAwg);
  const maxCableIndex = cableTableIndex(maxCableAwg);
  if (maxCableAwg && selectedCableIndex != null && maxCableIndex != null && selectedCableIndex > maxCableIndex) {
    warnings.push(`${selectedAwg} AWG exceeds endpoint maximum cable size of ${maxCableAwg} AWG`);
  }

  if (maxCableAwg && autoCable.awg === maxCableAwg) {
    const uncappedCable = cableForAmpacityAndDrop(
      cableSizingCurrentA,
      designCurrentA,
      connection.cableLengthFt,
      voltageV,
      system.assumptions.maxVoltageDropPercent
    );
    if (cableTableIndex(uncappedCable.awg)! > cableTableIndex(maxCableAwg)!) {
      warnings.push(`Auto cable recommendation capped at endpoint maximum of ${maxCableAwg} AWG`);
    }
  }

  if (!autoCable.satisfiesDrop && !connection.manualCableAwg) {
    warnings.push(`Voltage drop target cannot be met with available cable sizes at ${formatFeetAndInches(connection.cableLengthFt)}`);
  }

  return {
    connectionId: connection.id,
    busType,
    designCurrentA,
    voltageV,
    protectionRequired: finalProtectionRequired,
    protectedBy,
    sourceProtection,
    minimumFuseA,
    recommendedFuseA,
    selectedFuseA,
    effectiveBranchLimitA,
    recommendedCableAwg: selectedAwg,
    selectedCableAwg: selectedAwg,
    cableSizingCurrentA,
    voltageDropV: parseFloat(dropV.toFixed(3)),
    voltageDropPercent: parseFloat(dropPercent.toFixed(2)),
    errors,
    warnings,
  };
}

/**
 * Sizing floors that pair each leaf device's positive and negative DC leads so the
 * return conductor is never smaller than the supply (and vice versa). Returns a map
 * of connectionId → minimum cable-sizing current, derived from a first analysis pass.
 */
function buildPairedConductorSizingFloors(
  system: SystemDesign,
  nodes: Map<string, TerminalNode>,
  productsByComponent: Map<string, Product | undefined>,
  analyses: Map<string, ConnectionCircuitAnalysis>
): Map<string, number> {
  interface Lead { connectionId: string; busType: BusType; sizingA: number; }
  const leadsByDevice = new Map<string, Lead[]>();

  for (const connection of system.connections) {
    if (connection.wireKind === 'communication' || connection.busLink) continue;
    const analysis = analyses.get(connection.id);
    if (!analysis) continue;
    const sizingA = analysis.cableSizingCurrentA ?? 0;

    const endpoints: Array<[string, string]> = [
      [connection.fromComponentId, connection.fromTerminalId],
      [connection.toComponentId, connection.toTerminalId],
    ];
    for (const [componentId, terminalId] of endpoints) {
      const node = nodes.get(terminalKey(componentId, terminalId));
      if (!node || (node.busType !== 'dc_pos' && node.busType !== 'dc_neg')) continue;
      if (!isLeafPowerDevice(productsByComponent.get(componentId))) continue;
      const list = leadsByDevice.get(componentId) ?? [];
      list.push({ connectionId: connection.id, busType: node.busType, sizingA });
      leadsByDevice.set(componentId, list);
    }
  }

  const floors = new Map<string, number>();
  const raise = (connectionId: string, valueA: number) => {
    if (valueA <= 0) return;
    floors.set(connectionId, Math.max(floors.get(connectionId) ?? 0, valueA));
  };

  for (const [componentId, leads] of leadsByDevice) {
    const posLeads = leads.filter((lead) => lead.busType === 'dc_pos');
    const negLeads = leads.filter((lead) => lead.busType === 'dc_neg');
    if (posLeads.length === 0 || negLeads.length === 0) continue;

    const posMaxA = Math.max(...posLeads.map((lead) => lead.sizingA));
    const negMaxA = Math.max(...negLeads.map((lead) => lead.sizingA));

    // The return conductor carries the same current as the supply, so size it to at
    // least the supply leg (e.g. when a fuse upsizes the positive side).
    for (const lead of negLeads) raise(lead.connectionId, posMaxA);

    // The supply leg should likewise match the return — except for batteries, whose
    // parallel-bank shared negative return legitimately carries more current than an
    // individual battery's positive lead (sized by the parallel-return override).
    if (!isBatteryProduct(productsByComponent.get(componentId))) {
      for (const lead of posLeads) raise(lead.connectionId, negMaxA);
    }
  }

  return floors;
}

export function analyzeSystemCircuits(system: SystemDesign, products: Map<string, Product>): SystemCircuitAnalysis {
  const nodes = buildTerminalNodes(system, products);
  const edges = buildGraphEdges(system, nodes);
  const adjacency = buildAdjacency(edges);
  const productsByComponent = new Map(
    system.components.map((component) => [
      component.id,
      getEffectiveProductForComponent(component, products.get(component.productId)),
    ])
  );
  const componentsById = new Map(system.components.map((component) => [component.id, component]));
  const edgesByConnectionId = new Map(
    edges
      .filter((edge) => edge.kind === 'connection' && edge.connectionId)
      .map((edge) => [edge.connectionId!, edge])
  );
  const shortSourceLeadMaxFt = system.assumptions.batteryInterconnectMaxLengthFt ?? DEFAULT_ASSUMPTIONS.batteryInterconnectMaxLengthFt;
  const inferredDesignCurrents = buildParallelBankReturnCurrentOverrides(
    system,
    nodes,
    productsByComponent,
    shortSourceLeadMaxFt
  );
  const inferredVoltages = new Map<string, number>();
  const batteryTopology = analyzeBatteryTopology(system, products);
  for (const pack of batteryTopology.packs) {
    for (const connectionId of pack.outputConnectionIds) {
      inferredVoltages.set(connectionId, pack.voltageV);
    }
  }

  const connectionById = new Map(system.connections.map((connection) => [connection.id, connection]));
  const connections = new Map<string, ConnectionCircuitAnalysis>();
  for (const connection of system.connections) {
    connections.set(
      connection.id,
      analyzeConnection(
        connection,
        edgesByConnectionId.get(connection.id),
        nodes,
        adjacency,
        system,
        productsByComponent,
        componentsById,
        inferredDesignCurrents.get(connection.id),
        inferredVoltages.get(connection.id)
      )
    );
  }

  // Second pass: pair each leaf device's supply/return legs so a fuse that upsizes
  // one conductor upsizes its mate (both carry the same branch current). Only the
  // smaller conductor of a pair is re-sized, so this never shrinks a cable.
  const sizingFloors = buildPairedConductorSizingFloors(system, nodes, productsByComponent, connections);
  for (const [connectionId, floorA] of sizingFloors) {
    const existing = connections.get(connectionId);
    const connection = connectionById.get(connectionId);
    if (!existing || !connection) continue;
    if ((existing.cableSizingCurrentA ?? 0) >= floorA) continue;
    connections.set(
      connectionId,
      analyzeConnection(
        connection,
        edgesByConnectionId.get(connectionId),
        nodes,
        adjacency,
        system,
        productsByComponent,
        componentsById,
        inferredDesignCurrents.get(connectionId),
        inferredVoltages.get(connectionId),
        floorA
      )
    );
  }

  return { connections };
}
