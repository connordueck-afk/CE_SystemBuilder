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
import { continuousFactorForBus } from '../data/electricalRules';
import { getEffectiveProductForComponent } from './solarCalculations';
import { getEffectiveTerminals, isDynamicSingleConductorProduct } from './effectiveTerminals';
import { canProvidePower, canReceivePower, inferTerminalDirection } from './terminalDirection';
import { busTypeFromTerminal, busTypeRequiresFuse, type BusType } from './electricalNetlist';
import { buildInternalDistributionEdges, hasDistributionTopology } from './distributionTopology';
import { resolveTerminalCurrentA } from './terminalElectrics';

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
  componentId?: string;
  protectionRatingA?: number;
  protectionLabel?: string;
  protectedTerminalKey?: string;
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
  protectedBy: Array<{ componentId: string; label: string; ratingA?: number }>;
  minimumFuseA?: number;
  recommendedFuseA?: number;
  recommendedCableAwg?: string;
  voltageDropV?: number;
  voltageDropPercent?: number;
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

function isConductivePassThroughProduct(product: Product): boolean {
  if (hasDistributionTopology(product)) return false;
  return CONDUCTIVE_PASS_THROUGH_TYPES.has(product.productType) || isDynamicSingleConductorProduct(product);
}

function positiveNumber(value: number | undefined): number | undefined {
  return value != null && Number.isFinite(value) && value > 0 ? value : undefined;
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

  return nodes;
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

    const groups = new Map<BusType, TerminalNode[]>();
    for (const node of componentNodes) {
      if (!isPowerBus(node.busType)) continue;
      groups.set(node.busType, [...(groups.get(node.busType) ?? []), node]);
    }

    for (const [busType, group] of groups) {
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
  const canAcceptNormalSourceCurrent = (side: SideSummary): boolean => {
    return side.canReceiveCurrent || side.normalLoadCurrentA > 0;
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
    canAcceptNormalSourceCurrent(to) ? from.normalSourceCurrentA : 0,
    canAcceptNormalSourceCurrent(from) ? to.normalSourceCurrentA : 0
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

function protectionDevicesForConnection(
  connection: SystemConnection,
  productsByComponent: Map<string, Product | undefined>,
  componentsById: Map<string, SystemComponent>,
  adjacency: Map<string, GraphEdge[]>
): Array<{ componentId: string; label: string; ratingA?: number }> {
  const productBoundaries = [connection.fromComponentId, connection.toComponentId].flatMap((componentId) => {
    const product = productsByComponent.get(componentId);
    const component = componentsById.get(componentId);
    if (!component || !isProtectionProduct(product)) return [];
    return [{
      componentId,
      label: component.label ?? product!.name,
      ratingA: product!.protectionRatings?.currentRatingA ?? product!.maxCurrentA,
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

  return [...productBoundaries, ...slotBoundaries].filter((boundary, index, all) => {
    const key = `${boundary.componentId}:${boundary.label}:${boundary.ratingA ?? ''}`;
    return all.findIndex((item) => `${item.componentId}:${item.label}:${item.ratingA ?? ''}` === key) === index;
  });
}

function analyzeConnection(
  connection: SystemConnection,
  edge: GraphEdge | undefined,
  nodes: Map<string, TerminalNode>,
  adjacency: Map<string, GraphEdge[]>,
  system: SystemDesign,
  productsByComponent: Map<string, Product | undefined>,
  componentsById: Map<string, SystemComponent>
): ConnectionCircuitAnalysis {
  const fromKey = terminalKey(connection.fromComponentId, connection.fromTerminalId);
  const toKey = terminalKey(connection.toComponentId, connection.toTerminalId);
  const fromNode = nodes.get(fromKey);
  const toNode = nodes.get(toKey);
  const busType = edge?.busType ?? connectionBusType(fromNode, toNode);
  const voltageV = voltageForConnection(connection, busType, nodes, system);
  const protectedBy = protectionDevicesForConnection(connection, productsByComponent, componentsById, adjacency);
  const warnings: string[] = [];

  let designCurrentA = positiveNumber(connection.designCurrentOverrideA) ?? 0;
  let fromSide: SideSummary | undefined;
  let toSide: SideSummary | undefined;

  if (!designCurrentA && edge && isPowerBus(busType) && fromNode && toNode) {
    fromSide = summarizeSide(collectSide(fromKey, edge.id, busType, adjacency, nodes), nodes);
    toSide = summarizeSide(collectSide(toKey, edge.id, busType, adjacency, nodes), nodes);
    designCurrentA = edgeCurrentFromSides(fromSide, toSide);
  }

  if (!designCurrentA) {
    const fallbackLoad = maxDefined(fromNode?.behavior.normalLoadCurrentA, toNode?.behavior.normalLoadCurrentA) ?? 0;
    const fallbackSource = maxDefined(fromNode?.behavior.normalSourceCurrentA, toNode?.behavior.normalSourceCurrentA) ?? 0;
    designCurrentA = Math.max(fallbackLoad, fallbackSource);
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
  const cableSizingCurrentA = targetFuseA ?? designCurrentA * continuousFactor;
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

  if (dropPercent > system.assumptions.maxVoltageDropPercent) {
    warnings.push(`Voltage drop ${dropPercent.toFixed(1)}% exceeds ${system.assumptions.maxVoltageDropPercent}% limit - consider larger cable or shorter run`);
  }

  if (protectionRequired && recommendedFuseA != null && maxFuseByCableA != null && recommendedFuseA > maxFuseByCableA) {
    warnings.push(`${selectedAwg} AWG cable ampacity is ${maxFuseByCableA}A, below the ${recommendedFuseA}A fuse needed for ${designCurrentA.toFixed(0)}A design current`);
  }

  if (minimumFuseA != null && terminalMaxFuseA != null && minimumFuseA > terminalMaxFuseA) {
    warnings.push(`Required fuse ${minimumFuseA}A exceeds terminal maximum fuse rating of ${terminalMaxFuseA}A`);
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
    warnings.push(`Voltage drop target cannot be met with available cable sizes at ${connection.cableLengthFt.toFixed(1)} ft`);
  }

  return {
    connectionId: connection.id,
    busType,
    designCurrentA,
    voltageV,
    protectionRequired,
    protectedBy,
    minimumFuseA,
    recommendedFuseA,
    recommendedCableAwg: selectedAwg,
    voltageDropV: parseFloat(dropV.toFixed(3)),
    voltageDropPercent: parseFloat(dropPercent.toFixed(2)),
    warnings,
  };
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
        componentsById
      )
    );
  }

  return { connections };
}
