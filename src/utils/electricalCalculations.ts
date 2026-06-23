import type { SystemDesign, SystemComponent, SystemConnection, SystemWarning, Product, TerminalDefinition } from '../types/system';
import { nextStandardFuse } from '../data/fuseRatings';
import { cableForCurrent, cableByAwg, voltageDropV } from '../data/cableAmpacity';
import { CONTINUOUS_LOAD_FACTOR } from '../data/electricalRules';
import { validateSystemConnection } from './connectionRules';
import { findSolarArrayFeedingComponent } from './solarCalculations';
import { canProvidePower, inferTerminalDirection, terminalCurrentLimitA } from './terminalDirection';
import { buildBatteryInterconnectMap } from './batteryPackAnalysis';
import { analyzeSystemCircuits } from './circuitAnalysis';
import {
  buildElectricalNetlist,
  busTypeFromTerminal,
  busTypeRequiresFuse,
  isReturnOrGroundBus,
  type BusType,
  type TerminalNodeRef,
} from './electricalNetlist';
import { resolveTerminalCurrentA } from './terminalElectrics';
import { getEffectiveTerminal } from './effectiveTerminals';
import { getDcBusNominalVoltage, isDcBusTerminal } from './dcBusVoltage';
import { formatFeetAndInches } from './cableSummary';
import { analyzeBatteryTopology } from './batteryTopology';
import { resolveFuseSlot } from './distributionTopology';

const PASS_THROUGH_TYPES = new Set<string>(['fuse', 'breaker']);
const PASSIVE_ELECTRICAL_TYPES = new Set<string>([
  'busbar',
  'dc_distribution',
  'solar_combiner',
  'fuse',
  'breaker',
  'dcDisconnect',
  'acDisconnect',
  'relay',
  'contactor',
  'transferSwitch',
]);
const SOURCE_COMPATIBILITY_TYPES = new Set<string>([
  'battery',
  'mppt',
  'dc_dc_charger',
  'shore_charger',
  'inverter_charger',
  'solar_array',
  'shorePowerInlet',
]);

function isPassiveElectricalProduct(product: Product): boolean {
  return PASSIVE_ELECTRICAL_TYPES.has(product.productType);
}

function productLabel(component: SystemComponent, product: Product): string {
  return component.label ?? product.name;
}

function connectionTouchesComponent(connection: SystemConnection, componentId: string): boolean {
  return connection.fromComponentId === componentId || connection.toComponentId === componentId;
}

function connectionTerminalForComponent(connection: SystemConnection, componentId: string): string | undefined {
  if (connection.fromComponentId === componentId) return connection.fromTerminalId;
  if (connection.toComponentId === componentId) return connection.toTerminalId;
  return undefined;
}

function connectionBetweenComponents(connection: SystemConnection, a: string, b: string): boolean {
  return (
    (connection.fromComponentId === a && connection.toComponentId === b) ||
    (connection.fromComponentId === b && connection.toComponentId === a)
  );
}

function normalizeVoltage(voltage: number): number {
  return Math.round(voltage * 10) / 10;
}

function arrayValueIncludes(values: number[], target: number): boolean {
  return values.some((value) => Math.abs(value - target) < 0.01);
}

function sourceVoltageForTerminal(ref: TerminalNodeRef, system: SystemDesign): number | undefined {
  const { component, product, terminal } = ref;
  if (terminal.voltageNominalV != null) return terminal.voltageNominalV;
  if (component.dcNominalVoltage != null) return component.dcNominalVoltage;
  if (component.instanceVoltageV != null) return component.instanceVoltageV;
  if (product.batteryRatings?.nominalVoltageV != null) return product.batteryRatings.nominalVoltageV;
  if (product.inverterChargerRatings?.dcVoltageV != null) return product.inverterChargerRatings.dcVoltageV;

  if (product.dcDcChargerRatings) {
    if (terminal.id.includes('out') && product.dcDcChargerRatings.outputVoltageV != null) {
      return product.dcDcChargerRatings.outputVoltageV;
    }
    if (terminal.id.includes('in')) {
      const min = product.dcDcChargerRatings.inputVoltageMinV;
      const max = product.dcDcChargerRatings.inputVoltageMaxV;
      if (min != null && max != null && system.nominalVoltage >= min && system.nominalVoltage <= max) {
        return system.nominalVoltage;
      }
    }
  }

  if (product.mpptRatings?.batteryVoltagesV) {
    const voltages = product.mpptRatings.batteryVoltagesV;
    if (arrayValueIncludes(voltages, system.nominalVoltage)) return system.nominalVoltage;
    if (voltages.length === 1) return voltages[0];
  }

  if (typeof product.nominalVoltage === 'number') return product.nominalVoltage;
  if (Array.isArray(product.nominalVoltage)) {
    if (arrayValueIncludes(product.nominalVoltage, system.nominalVoltage)) return system.nominalVoltage;
    if (product.nominalVoltage.length === 1) return product.nominalVoltage[0];
  }

  return undefined;
}

function isSourceCompatibilityTerminal(ref: TerminalNodeRef): boolean {
  if (isPassiveElectricalProduct(ref.product)) return false;
  if (ref.product.productType === 'monitor' || ref.product.productType === 'batteryMonitor') return false;
  if (ref.product.productType === 'dc_load' || ref.product.productType === 'ac_load') return false;
  if (!canProvidePower(ref.terminal) && ref.product.productType !== 'battery') return false;
  return SOURCE_COMPATIBILITY_TYPES.has(ref.product.productType) || ref.terminal.role === 'source';
}

function currentRatingForBusProduct(product: Product): number | undefined {
  return product.busbarRatings?.currentRatingA ?? product.maxCurrentA;
}

function isShuntProduct(product: Product): boolean {
  const text = `${product.id} ${product.name} ${product.description ?? ''} ${product.notes ?? ''}`.toLowerCase();
  return text.includes('shunt') || text.includes('bmv');
}

function shuntCurrentRatingA(product: Product): number | undefined {
  if (product.maxCurrentA != null) return product.maxCurrentA;
  if (product.busbarRatings?.currentRatingA != null) return product.busbarRatings.currentRatingA;

  const text = `${product.name} ${product.description ?? ''} ${product.notes ?? ''}`;
  const match = text.match(/(\d{2,5})\s*A(?:\b|\/)/i);
  return match ? Number(match[1]) : undefined;
}

export function estimateDcCurrent(powerW: number, voltageV: number): number {
  if (voltageV <= 0) return 0;
  return powerW / voltageV;
}

export function estimateInverterDcCurrent(
  acPowerW: number,
  batteryVoltageV: number,
  efficiency: number
): number {
  if (batteryVoltageV <= 0 || efficiency <= 0) return 0;
  return acPowerW / (batteryVoltageV * efficiency);
}

export function recommendedFuseA(continuousCurrentA: number): number {
  return nextStandardFuse(continuousCurrentA * CONTINUOUS_LOAD_FACTOR);
}

export function recommendedCableAwg(currentA: number): string {
  return cableForCurrent(currentA).awg;
}

export function calcVoltageDropPercent(
  currentA: number,
  lengthFt: number,
  awg: string,
  systemVoltageV: number
): number {
  if (systemVoltageV <= 0) return 0;
  const drop = voltageDropV(currentA, lengthFt, awg);
  return (drop / systemVoltageV) * 100;
}

/**
 * @deprecated Superseded by the graph engine in circuitAnalysis.ts, which is the
 * single source of truth wired through App.tsx `enrichConnections`. This function
 * is no longer called anywhere; kept only to avoid a large deletion in this change.
 * Do not wire new UI to it — read `connection.recommendedFuseA/recommendedCableAwg`
 * (already ampacity-capped) instead. Safe to delete in a dedicated cleanup.
 */
export function enrichConnection(
  conn: SystemConnection,
  fromProduct: Product | undefined,
  toProduct: Product | undefined,
  systemVoltage: number,
  efficiency: number,
  fromTerminal?: TerminalDefinition,
  toTerminal?: TerminalDefinition,
  netBusType?: BusType
): SystemConnection {
  const fromCanProvide = fromTerminal ? canProvidePower(fromTerminal) : true;
  const toCanProvide = toTerminal ? canProvidePower(toTerminal) : false;
  const sourceProduct = toCanProvide && !fromCanProvide ? toProduct : fromProduct;
  const loadProduct = sourceProduct === fromProduct ? toProduct : fromProduct;
  const sourceTerminal = sourceProduct === fromProduct ? fromTerminal : toTerminal;

  const solarCurrentA = sourceProduct?.productType === 'solar_array'
    ? sourceProduct.maxPvCurrentA ?? sourceProduct.solarPanelRatings?.iscA ?? sourceProduct.solarPanelRatings?.impA
    : loadProduct?.productType === 'solar_array'
      ? loadProduct.maxPvCurrentA ?? loadProduct.solarPanelRatings?.iscA ?? loadProduct.solarPanelRatings?.impA
      : undefined;
  let currentA = solarCurrentA ?? conn.calculatedCurrentA;

  if (currentA == null) {
    // Terminal-first: prefer declared terminal current/power over product-type switches.
    if (sourceTerminal) {
      const declaredA = resolveTerminalCurrentA(sourceTerminal, systemVoltage);
      if (declaredA != null) currentA = declaredA;
    }

    // Derive from source product (skip pass-throughs - their maxCurrentA is a rating, not circuit current)
    if (currentA == null && sourceProduct?.productType === 'inverter_charger' && sourceProduct.continuousPowerW) {
      currentA = estimateInverterDcCurrent(sourceProduct.continuousPowerW, systemVoltage, efficiency);
    } else if (currentA == null && sourceProduct?.continuousPowerW) {
      currentA = estimateDcCurrent(sourceProduct.continuousPowerW, systemVoltage);
    } else if (currentA == null && sourceProduct?.maxCurrentA && !PASS_THROUGH_TYPES.has(sourceProduct.productType)) {
      currentA = sourceProduct.maxCurrentA;
    }

    // Fallback: derive from consuming product when source is a pass-through or has no power specs.
    // Check load-side terminal declarations before falling back to product-type switches.
    if (!currentA) {
      const loadTerminal = sourceProduct === fromProduct ? toTerminal : fromTerminal;
      if (loadTerminal) {
        const declaredA = resolveTerminalCurrentA(loadTerminal, systemVoltage);
        if (declaredA != null) currentA = declaredA;
      }
    }
    if (!currentA && loadProduct) {
      if (loadProduct.productType === 'inverter_charger' && loadProduct.continuousPowerW) {
        currentA = estimateInverterDcCurrent(loadProduct.continuousPowerW, systemVoltage, efficiency);
      } else if (loadProduct.continuousPowerW) {
        currentA = estimateDcCurrent(loadProduct.continuousPowerW, systemVoltage);
      } else if (loadProduct.maxCurrentA && !PASS_THROUGH_TYPES.has(loadProduct.productType)) {
        currentA = loadProduct.maxCurrentA;
      }
    }

    currentA = currentA ?? 0;
  }

  const sourceLimitA = sourceProduct && sourceTerminal && inferTerminalDirection(sourceTerminal) === 'output'
    ? terminalCurrentLimitA(sourceProduct, sourceTerminal)
    : undefined;
  const limitedCurrentA = sourceLimitA != null ? Math.min(currentA, sourceLimitA) : currentA;
  const fromBusType = fromTerminal ? busTypeFromTerminal(fromTerminal) : 'unknown';
  const toBusType = toTerminal ? busTypeFromTerminal(toTerminal) : 'unknown';
  const busType = netBusType ?? (fromBusType !== 'unknown' ? fromBusType : toBusType);
  const fuseRequired = busTypeRequiresFuse(busType);

  const fuseA = fuseRequired ? conn.recommendedFuseA ?? recommendedFuseA(limitedCurrentA) : undefined;
  const cableSizingCurrentA = fuseA ?? limitedCurrentA * CONTINUOUS_LOAD_FACTOR;
  const recommendedAwg = recommendedCableAwg(cableSizingCurrentA);
  const awg = conn.manualCableAwg && cableByAwg(conn.manualCableAwg)
    ? conn.manualCableAwg
    : recommendedAwg;
  const dropPct = calcVoltageDropPercent(limitedCurrentA, conn.cableLengthFt, awg, systemVoltage);
  const dropV = voltageDropV(limitedCurrentA, conn.cableLengthFt, awg);

  const warnings: string[] = [];
  if (dropPct > 3) {
    warnings.push(`Voltage drop ${dropPct.toFixed(1)}% exceeds 3% limit - consider larger cable or shorter run`);
  }
  if (sourceLimitA != null && currentA > sourceLimitA) {
    warnings.push(`Output limited to ${sourceLimitA}A by ${sourceProduct?.protectionRatings?.protectionType ?? 'device'} rating`);
  }

  return {
    ...conn,
    calculatedCurrentA: limitedCurrentA,
    recommendedFuseA: fuseA,
    recommendedCableAwg: awg,
    voltageDropV: parseFloat(dropV.toFixed(3)),
    voltageDropPercent: parseFloat(dropPct.toFixed(2)),
    warnings,
  };
}

/**
 * @deprecated Pre-terminal-model fuse/cable estimator. Not called anywhere.
 * Superseded by circuitAnalysis.ts. Safe to delete in a dedicated cleanup.
 */
export function enrichConnectionLegacy(
  conn: SystemConnection,
  fromProduct: Product | undefined,
  toProduct: Product | undefined,
  systemVoltage: number,
  efficiency: number
): SystemConnection {
  const solarCurrentA = fromProduct?.productType === 'solar_array'
    ? fromProduct.maxPvCurrentA ?? fromProduct.solarPanelRatings?.iscA ?? fromProduct.solarPanelRatings?.impA
    : toProduct?.productType === 'solar_array'
      ? toProduct.maxPvCurrentA ?? toProduct.solarPanelRatings?.iscA ?? toProduct.solarPanelRatings?.impA
      : undefined;
  let currentA = solarCurrentA ?? conn.calculatedCurrentA;

  if (currentA == null) {
    // Derive from source product (skip pass-throughs — their maxCurrentA is a rating, not circuit current)
    if (currentA == null && fromProduct?.productType === 'inverter_charger' && fromProduct.continuousPowerW) {
      currentA = estimateInverterDcCurrent(fromProduct.continuousPowerW, systemVoltage, efficiency);
    } else if (currentA == null && fromProduct?.continuousPowerW) {
      currentA = estimateDcCurrent(fromProduct.continuousPowerW, systemVoltage);
    } else if (currentA == null && fromProduct?.maxCurrentA && !PASS_THROUGH_TYPES.has(fromProduct.productType)) {
      currentA = fromProduct.maxCurrentA;
    }

    // Fallback: derive from consuming product when source is a pass-through or has no power specs
    if (!currentA && toProduct) {
      if (toProduct.productType === 'inverter_charger' && toProduct.continuousPowerW) {
        currentA = estimateInverterDcCurrent(toProduct.continuousPowerW, systemVoltage, efficiency);
      } else if (toProduct.continuousPowerW) {
        currentA = estimateDcCurrent(toProduct.continuousPowerW, systemVoltage);
      } else if (toProduct.maxCurrentA && !PASS_THROUGH_TYPES.has(toProduct.productType)) {
        currentA = toProduct.maxCurrentA;
      }
    }

    currentA = currentA ?? 0;
  }

  const fuseA = conn.recommendedFuseA ?? recommendedFuseA(currentA);
  const recommendedAwg = recommendedCableAwg(fuseA);
  const awg = conn.manualCableAwg && cableByAwg(conn.manualCableAwg)
    ? conn.manualCableAwg
    : recommendedAwg;
  const dropPct = calcVoltageDropPercent(currentA, conn.cableLengthFt, awg, systemVoltage);
  const dropV = voltageDropV(currentA, conn.cableLengthFt, awg);

  const warnings: string[] = [];
  if (dropPct > 3) {
    warnings.push(`Voltage drop ${dropPct.toFixed(1)}% exceeds 3% limit — consider larger cable or shorter run`);
  }

  return {
    ...conn,
    calculatedCurrentA: currentA,
    recommendedFuseA: fuseA,
    recommendedCableAwg: awg,
    voltageDropV: parseFloat(dropV.toFixed(3)),
    voltageDropPercent: parseFloat(dropPct.toFixed(2)),
    warnings,
  };
}

export function generateWarnings(
  system: SystemDesign,
  products: Map<string, Product>
): SystemWarning[] {
  const warnings: SystemWarning[] = [];
  let warnId = 0;

  const warn = (
    severity: SystemWarning['severity'],
    message: string,
    code: string,
    componentId?: string,
    connectionId?: string
  ) => {
    warnings.push({ id: `w-${++warnId}`, severity, message, code, componentId, connectionId });
  };

  const connectedTerminals = new Set<string>();
  for (const conn of system.connections) {
    connectedTerminals.add(`${conn.fromComponentId}:${conn.fromTerminalId}`);
    connectedTerminals.add(`${conn.toComponentId}:${conn.toTerminalId}`);
  }

  const netlist = buildElectricalNetlist(system, products);
  const circuitAnalysis = analyzeSystemCircuits(system, products);
  const batteryInterconnects = buildBatteryInterconnectMap(system, products);
  const batteryTopology = analyzeBatteryTopology(system, products);
  const componentById = new Map(system.components.map((component) => [component.id, component]));
  const productByComponent = new Map(
    system.components
      .map((component) => [component.id, products.get(component.productId)] as const)
      .filter((entry): entry is readonly [string, Product] => Boolean(entry[1]))
  );
  const netById = new Map(netlist.nets.map((net) => [net.id, net]));

  for (const issue of batteryTopology.issues) {
    warn(issue.severity, issue.message, issue.code, issue.componentId, issue.connectionId);
  }

  const connectionBusType = (connection: SystemConnection): BusType => (
    circuitAnalysis.connections.get(connection.id)?.busType ??
    netlist.connectionContexts.get(connection.id)?.busType ??
    connection.busType ??
    'unknown'
  );
  const connectionDesignCurrentA = (connection: SystemConnection): number => (
    circuitAnalysis.connections.get(connection.id)?.designCurrentA ??
    connection.designCurrentOverrideA ??
    connection.calculatedCurrentA ??
    0
  );
  const connectionCableAmpacityA = (connection: SystemConnection): number | undefined => {
    const context = circuitAnalysis.connections.get(connection.id);
    const awg = connection.manualCableAwg ?? context?.selectedCableAwg ?? context?.recommendedCableAwg ?? connection.recommendedCableAwg;
    return awg ? cableByAwg(awg)?.ampacity : undefined;
  };
  const attachedCurrentA = (componentId: string, terminalIds: string[]): number => {
    const terminalSet = new Set(terminalIds);
    const seenConnectionIds = new Set<string>();
    let totalA = 0;

    for (const connection of system.connections) {
      if (seenConnectionIds.has(connection.id)) continue;
      const terminalId = connectionTerminalForComponent(connection, componentId);
      if (!terminalId || !terminalSet.has(terminalId)) continue;
      seenConnectionIds.add(connection.id);
      totalA += connectionDesignCurrentA(connection);
    }

    return totalA;
  };

  for (const conflict of netlist.conflicts) {
    warn('error', conflict, 'BUS_TYPE_CONFLICT');
  }

  for (const interconnect of batteryInterconnects.values()) {
    if (!interconnect.isSameProduct || !interconnect.isSameNominalVoltage) {
      warn(
        'warning',
        'Battery pack interconnect joins batteries that are not the same product and nominal voltage; review parallel-pack compatibility',
        'BATTERY_PACK_MISMATCH',
        undefined,
        interconnect.connectionId
      );
      continue;
    }

    if (!interconnect.isShortPackInterconnect) {
      warn(
        'warning',
        `Battery pack interconnect is ${formatFeetAndInches(interconnect.cableLengthFt)}; V1 assumes unfused battery interconnects are ${formatFeetAndInches(interconnect.maxLengthFt)} or shorter`,
        'BATTERY_INTERCONNECT_LONG',
        undefined,
        interconnect.connectionId
      );
    }
  }

  for (const net of netlist.nets) {
    if (net.busType !== 'dc_pos') continue;

    const sourceRefsByVoltage = new Map<number, TerminalNodeRef[]>();
    for (const terminalKey of net.terminalKeys) {
      const ref = netlist.terminals.get(terminalKey);
      if (!ref || !isSourceCompatibilityTerminal(ref)) continue;

      const voltage = sourceVoltageForTerminal(ref, system);
      if (voltage == null) continue;

      const normalizedVoltage = normalizeVoltage(voltage);
      sourceRefsByVoltage.set(normalizedVoltage, [
        ...(sourceRefsByVoltage.get(normalizedVoltage) ?? []),
        ref,
      ]);
    }

    if (sourceRefsByVoltage.size > 1) {
      const summary = [...sourceRefsByVoltage.entries()]
        .map(([voltage, refs]) => {
          const labels = [...new Set(refs.map((ref) => productLabel(ref.component, ref.product)))].slice(0, 3);
          return `${voltage}V (${labels.join(', ')})`;
        })
        .join(', ');
      warn(
        'error',
        `Incompatible DC source voltages share ${net.id}: ${summary}`,
        'INCOMPATIBLE_SOURCE_VOLTAGES'
      );
    }
  }

  for (const comp of system.components) {
    const product = products.get(comp.productId);
    if (!product) continue;

    const productBusRatingA = currentRatingForBusProduct(product);
    if (
      productBusRatingA != null &&
      (product.productType === 'busbar' || product.productType === 'dc_distribution' || product.busbarRatings)
    ) {
      for (const net of netlist.nets) {
        if (net.busType === 'unknown' || net.busType === 'signal') continue;
        if (!net.terminalKeys.some((terminalKey) => terminalKey.startsWith(`${comp.id}:`))) continue;
        if (net.operatingCurrentA <= productBusRatingA) continue;

        warn(
          'error',
          `"${productLabel(comp, product)}" is rated for ${productBusRatingA}A but ${net.id} is carrying ${net.operatingCurrentA.toFixed(0)}A`,
          'BUSBAR_OVERLOADED',
          comp.id
        );
      }
    }

    if (!product.distributionTopology) continue;

    for (const bus of product.distributionTopology.buses) {
      const downstreamTerminalIds = (product.distributionTopology.fuseSlots ?? [])
        .filter((slot) => slot.upstreamBusId === bus.id)
        .map((slot) => slot.downstreamTerminalId);
      const busCurrentA = Math.max(
        attachedCurrentA(comp.id, bus.terminalIds),
        attachedCurrentA(comp.id, downstreamTerminalIds)
      );
      const busRatingA = bus.maxCurrentA ?? productBusRatingA;
      if (busRatingA != null && busCurrentA > busRatingA) {
        warn(
          'error',
          `"${productLabel(comp, product)}" ${bus.label} is rated for ${busRatingA}A but connected branches total ${busCurrentA.toFixed(0)}A`,
          'DISTRIBUTION_BUS_OVERLOADED',
          comp.id
        );
      }
    }

    for (const slot of product.distributionTopology.fuseSlots ?? []) {
      const slotCurrentA = attachedCurrentA(comp.id, [slot.downstreamTerminalId]);
      if (slot.maxFuseA != null && slotCurrentA > slot.maxFuseA) {
        warn(
          'error',
          `"${productLabel(comp, product)}" ${slot.label} is rated for a maximum ${slot.maxFuseA}A fuse but branch load is ${slotCurrentA.toFixed(0)}A`,
          'DISTRIBUTION_SLOT_OVERLOADED',
          comp.id
        );
      }

      // An empty fuse position with something wired to its tap is an open (unprotected,
      // non-conducting) branch — flag it so the user knows to insert a fuse.
      const { installed } = resolveFuseSlot(comp, slot);
      const tapConnected = system.connections.some((connection) => (
        (connection.fromComponentId === comp.id && connection.fromTerminalId === slot.downstreamTerminalId) ||
        (connection.toComponentId === comp.id && connection.toTerminalId === slot.downstreamTerminalId)
      ));
      if (!installed && tapConnected) {
        warn(
          'warning',
          `"${productLabel(comp, product)}" ${slot.label} has a branch wired to it but no fuse is installed — the tap is open and unprotected.`,
          'DISTRIBUTION_SLOT_EMPTY',
          comp.id
        );
      }
    }
  }

  const negativeConnections = system.connections.filter((connection) => connectionBusType(connection) === 'dc_neg');
  const returnConnectionsForComponent = (componentId: string): SystemConnection[] => (
    negativeConnections.filter((connection) => connectionTouchesComponent(connection, componentId))
  );
  const returnConnectionsBetween = (leftComponentId: string, rightComponentId: string): SystemConnection[] => (
    negativeConnections.filter((connection) => connectionBetweenComponents(connection, leftComponentId, rightComponentId))
  );

  // Build a pack-membership map so the return-path check can traverse through
  // intra-pack negative interconnects (Battery1− ↔ Battery2−) and find the
  // Pack−'s actual load-side return conductor instead of stopping at the
  // inter-battery wire and falsely concluding the circuit is complete.
  const batteryPackByBatteryId = new Map<string, Set<string>>();
  const getBatteryPack = (batteryId: string): Set<string> => {
    if (!batteryPackByBatteryId.has(batteryId)) batteryPackByBatteryId.set(batteryId, new Set([batteryId]));
    return batteryPackByBatteryId.get(batteryId)!;
  };
  for (const interconnect of batteryInterconnects.values()) {
    const [id1, id2] = interconnect.batteryComponentIds;
    const pack1 = getBatteryPack(id1);
    const pack2 = getBatteryPack(id2);
    if (pack1 === pack2) continue;
    for (const id of pack2) { pack1.add(id); batteryPackByBatteryId.set(id, pack1); }
  }
  // DC-neg connections from any pack member to a non-member — the actual circuit
  // return conductors. Intra-pack connections are excluded; they are pack wiring.
  const returnConnectionsForBatteryPack = (batteryId: string): SystemConnection[] => {
    const packIds = getBatteryPack(batteryId);
    return negativeConnections.filter((conn) => (
      (packIds.has(conn.fromComponentId) || packIds.has(conn.toComponentId)) &&
      !(packIds.has(conn.fromComponentId) && packIds.has(conn.toComponentId))
    ));
  };
  const maxReturnAmpacityA = (connections: SystemConnection[]): number | undefined => {
    const ampacities = connections
      .map(connectionCableAmpacityA)
      .filter((value): value is number => value != null && Number.isFinite(value));
    return ampacities.length > 0 ? Math.max(...ampacities) : undefined;
  };
  const checkReturnPath = (
    positiveConnection: SystemConnection,
    requiredA: number,
    returnConnections: SystemConnection[],
    label: string,
    componentId?: string
  ) => {
    if (returnConnections.length === 0) {
      warn(
        'error',
        `DC positive connection requires a matching DC negative return for ${label}`,
        'DC_NEG_RETURN_MISSING',
        componentId,
        positiveConnection.id
      );
      return;
    }

    const returnAmpacityA = maxReturnAmpacityA(returnConnections);
    if (returnAmpacityA != null && returnAmpacityA < requiredA) {
      warn(
        'error',
        `DC negative return for ${label} is rated ${returnAmpacityA}A but the positive branch can carry ${requiredA.toFixed(0)}A`,
        'DC_NEG_RETURN_UNDERSIZED',
        componentId,
        positiveConnection.id
      );
    }
  };

  for (const connection of system.connections) {
    if (connectionBusType(connection) !== 'dc_pos') continue;

    const designCurrentA = connectionDesignCurrentA(connection);
    if (designCurrentA <= 0) continue;

    const fromComp = componentById.get(connection.fromComponentId);
    const toComp = componentById.get(connection.toComponentId);
    const fromProduct = productByComponent.get(connection.fromComponentId);
    const toProduct = productByComponent.get(connection.toComponentId);
    if (!fromComp || !toComp || !fromProduct || !toProduct) continue;

    const endpoints = [
      { component: fromComp, product: fromProduct },
      { component: toComp, product: toProduct },
    ].filter(({ product }) => !isPassiveElectricalProduct(product) && product.productType !== 'monitor' && product.productType !== 'batteryMonitor');
    if (endpoints.length === 0) continue;

    // The return conductor carries branch current, not the overcurrent device's
    // nameplate rating. Fuse-vs-cable protection is validated on the protected
    // positive conductor separately.
    const requiredA = designCurrentA;
    if (endpoints.length >= 2) {
      const [left, right] = endpoints;
      checkReturnPath(
        connection,
        requiredA,
        returnConnectionsBetween(left.component.id, right.component.id),
        `${productLabel(left.component, left.product)} and ${productLabel(right.component, right.product)}`
      );
      continue;
    }

    const endpoint = endpoints[0];
    const returnConns = endpoint.product.productType === 'battery'
      ? returnConnectionsForBatteryPack(endpoint.component.id)
      : returnConnectionsForComponent(endpoint.component.id);
    checkReturnPath(
      connection,
      requiredA,
      returnConns,
      productLabel(endpoint.component, endpoint.product),
      endpoint.component.id
    );
  }

  const shuntComponentIds = new Set(
    system.components
      .filter((component) => {
        const product = products.get(component.productId);
        return product ? isShuntProduct(product) : false;
      })
      .map((component) => component.id)
  );

  for (const comp of system.components) {
    const product = products.get(comp.productId);
    if (!product || !isShuntProduct(product)) continue;

    const ratingA = shuntCurrentRatingA(product);
    if (ratingA == null) continue;

    const attachedConnections = system.connections.filter((connection) => connectionTouchesComponent(connection, comp.id));
    const maxObservedA = attachedConnections.length > 0
      ? Math.max(...attachedConnections.map(connectionDesignCurrentA))
      : 0;
    if (maxObservedA > ratingA) {
      warn(
        'error',
        `"${productLabel(comp, product)}" is rated for ${ratingA}A but connected return current is ${maxObservedA.toFixed(0)}A`,
        'SHUNT_RATING_EXCEEDED',
        comp.id
      );
    }
  }

  if (shuntComponentIds.size > 0) {
    const warnedBatteryNegativeNets = new Set<string>();
    for (const ref of netlist.terminals.values()) {
      if (ref.product.productType !== 'battery' || ref.busType !== 'dc_neg') continue;

      const netId = netlist.terminalNetIds.get(ref.key);
      if (!netId || warnedBatteryNegativeNets.has(netId)) continue;
      warnedBatteryNegativeNets.add(netId);

      const net = netById.get(netId);
      if (!net) continue;

      const refs = net.terminalKeys
        .map((terminalKey) => netlist.terminals.get(terminalKey))
        .filter((terminalRef): terminalRef is TerminalNodeRef => Boolean(terminalRef));
      const hasShuntTerminal = refs.some((terminalRef) => shuntComponentIds.has(terminalRef.componentId));
      if (!hasShuntTerminal) {
        warn(
          'warning',
          'A shunt is present, but a battery negative net does not pass through the shunt before the rest of the system',
          'SHUNT_NOT_IN_BATTERY_NEGATIVE_PATH',
          ref.componentId
        );
      }

      const bypassRefs = refs.filter((terminalRef) => (
        !shuntComponentIds.has(terminalRef.componentId) &&
        terminalRef.product.productType !== 'battery' &&
        !isPassiveElectricalProduct(terminalRef.product) &&
        terminalRef.product.productType !== 'monitor' &&
        terminalRef.product.productType !== 'batteryMonitor'
      ));
      if (bypassRefs.length > 0) {
        const bypassLabels = [...new Set(bypassRefs.map((terminalRef) => productLabel(terminalRef.component, terminalRef.product)))].slice(0, 3);
        warn(
          'warning',
          `A shunt is present, but battery negative shares a return net with ${bypassLabels.join(', ')} before the shunt`,
          'SHUNT_BYPASS_POSSIBLE',
          ref.componentId
        );
      }
    }
  }

  for (const net of netlist.nets) {
    if (net.busType === 'unknown') continue;

    const protectionLimitA = net.availableCurrentA;
    if (protectionLimitA != null && net.operatingCurrentA > protectionLimitA) {
      warn(
        'error',
        `${net.id} load is ${net.operatingCurrentA.toFixed(0)}A but available protected current is ${protectionLimitA.toFixed(0)}A`,
        'NET_OVER_PROTECTION_LIMIT'
      );
    }

    // Missing protection is evaluated per conductor in circuitAnalysis. A whole net can contain
    // multiple feeder and branch conductors with different protection requirements.
  }

  for (const connection of system.connections) {
    const context = circuitAnalysis.connections.get(connection.id);
    if (!context) continue;

    for (const issue of context.errors) {
      warn('error', issue.message, issue.code, undefined, connection.id);
    }

    if (
      !context.protectionRequired ||
      context.designCurrentA <= 0 ||
      context.protectedBy.length > 0 ||
      context.errors.some((issue) => issue.code === 'SOURCE_SIDE_PROTECTION_MISSING')
    ) {
      continue;
    }

    warn(
      'warning',
      `Connection carries ${context.designCurrentA.toFixed(0)}A on ${context.busType.replace('_', ' ')} without local fuse or breaker protection`,
      'CONNECTION_MISSING_PROTECTION',
      undefined,
      connection.id
    );
  }

  for (const comp of system.components) {
    const product = products.get(comp.productId);
    if (!product) {
      warn('warning', `Component "${comp.label ?? comp.id}" references unknown product "${comp.productId}"`, 'UNKNOWN_PRODUCT', comp.id);
      continue;
    }

    if (product.msrpUsd == null && product.oemPriceUsd == null) {
      warn('info', `"${product.name}" has no price data`, 'MISSING_PRICE', comp.id);
    }

    const hasAnyConnection = system.connections.some(
      (c) => c.fromComponentId === comp.id || c.toComponentId === comp.id
    );

    if (!hasAnyConnection && !['monitor', 'accessory'].includes(product.productType)) {
      warn('warning', `"${comp.label ?? product.name}" is not connected to anything`, 'UNCONNECTED', comp.id);
    }

    if (product.nominalVoltage != null) {
      const volts = Array.isArray(product.nominalVoltage)
        ? product.nominalVoltage
        : [product.nominalVoltage];
      if (!volts.includes(system.nominalVoltage)) {
        warn(
          'error',
          `"${product.name}" is rated for ${volts.join('/')} V but system is ${system.nominalVoltage} V`,
          'VOLTAGE_MISMATCH',
          comp.id
        );
      }
    }
  }

  for (const comp of system.components) {
    const product = products.get(comp.productId);
    if (!product || product.productType !== 'mppt' || !product.mpptRatings) continue;

    const solarArray = findSolarArrayFeedingComponent(comp.id, system.components, system.connections, products);
    const solarStats = solarArray.stats;
    if (!solarStats) continue;

    for (const mismatch of solarArray.mismatches) {
      warn(
        'error',
        `Parallel solar strings must have matching Voc: "${mismatch.leftLabel}" is ${mismatch.leftVocV.toFixed(1)}V, "${mismatch.rightLabel}" is ${mismatch.rightVocV.toFixed(1)}V`,
        'SOLAR_PARALLEL_VOC_MISMATCH',
        comp.id
      );
    }

    const mppt = product.mpptRatings;
    if (solarStats.vocV > mppt.maxPvVoltageV) {
      warn(
        'error',
        `"${comp.label ?? product.name}" PV input over-voltage: array Voc ${solarStats.vocV.toFixed(1)}V exceeds ${mppt.maxPvVoltageV}V limit`,
        'MPPT_PV_VOLTAGE_EXCEEDED',
        comp.id
      );
    } else if (solarStats.vocV > mppt.maxPvVoltageV * 0.9) {
      warn(
        'warning',
        `"${comp.label ?? product.name}" PV input is close to voltage limit: array Voc ${solarStats.vocV.toFixed(1)}V of ${mppt.maxPvVoltageV}V`,
        'MPPT_PV_VOLTAGE_MARGIN',
        comp.id
      );
    }

    const arrayIscA = solarStats.iscA ?? solarStats.impA;
    if (arrayIscA != null && arrayIscA > mppt.maxPvCurrentA) {
      warn(
        'error',
        `"${comp.label ?? product.name}" PV input over-current: array Isc ${arrayIscA.toFixed(1)}A exceeds ${mppt.maxPvCurrentA}A limit`,
        'MPPT_PV_CURRENT_EXCEEDED',
        comp.id
      );
    }

    if (mppt.maxPvPowerW != null && solarStats.powerW > mppt.maxPvPowerW) {
      warn(
        'warning',
        `"${comp.label ?? product.name}" is over-paneled: array ${solarStats.powerW.toFixed(0)}W exceeds ${mppt.maxPvPowerW}W nominal PV rating`,
        'MPPT_PV_POWER_EXCEEDED',
        comp.id
      );
    }
  }

  // Fuse and breaker rating validation
  for (const comp of system.components) {
    const product = products.get(comp.productId);
    if (!product || !PASS_THROUGH_TYPES.has(product.productType)) continue;
    const fuseRatingA = product.maxCurrentA;
    if (!fuseRatingA) continue;

    const fuseBusTypes = new Set(
      system.connections
        .filter((c) => c.fromComponentId === comp.id || c.toComponentId === comp.id)
        .map((c) => netlist.connectionContexts.get(c.id)?.busType)
        .filter((busType): busType is BusType => Boolean(busType))
    );
    if ([...fuseBusTypes].some(isReturnOrGroundBus)) {
      warn(
        'info',
        `"${comp.label ?? product.name}" is on a return/ground bus; ${[...fuseBusTypes].join('/')} conductors normally do not need fuse protection`,
        'UNNEEDED_RETURN_BUS_PROTECTION',
        comp.id
      );
    }

    const adjConns = system.connections.filter(
      (c) => c.fromComponentId === comp.id || c.toComponentId === comp.id
    );
    if (adjConns.length === 0) continue;

    // Under-rated: fuse will nuisance-trip under continuous load
    const knownCurrentConns = adjConns.filter((c) => (c.calculatedCurrentA ?? 0) > 0);
    if (knownCurrentConns.length > 0) {
      const throughCurrentA = Math.max(...knownCurrentConns.map((c) => c.calculatedCurrentA!));
      const minRequired = nextStandardFuse(throughCurrentA * CONTINUOUS_LOAD_FACTOR);
      if (fuseRatingA < throughCurrentA * CONTINUOUS_LOAD_FACTOR) {
        warn(
          'error',
          `"${comp.label ?? product.name}" is under-rated: ${fuseRatingA}A fuse for ${throughCurrentA.toFixed(0)}A continuous load — minimum ${minRequired}A required`,
          'FUSE_UNDER_RATED',
          comp.id
        );
      }
    }

    // Over-rated: fuse exceeds cable ampacity — cable may burn before fuse blows
    const awgs = adjConns.map((c) => c.recommendedCableAwg).filter(Boolean) as string[];
    if (awgs.length > 0) {
      const minAmpacity = Math.min(...awgs.map((awg) => cableByAwg(awg)?.ampacity ?? Infinity));
      if (minAmpacity < Infinity && fuseRatingA > minAmpacity) {
        const worstAwg = awgs.find((awg) => (cableByAwg(awg)?.ampacity ?? Infinity) === minAmpacity)!;
        warn(
          'error',
          `"${comp.label ?? product.name}" is over-rated: ${fuseRatingA}A fuse exceeds ${worstAwg} AWG cable ampacity of ${minAmpacity}A — cable may burn before fuse blows`,
          'FUSE_OVER_RATED',
          comp.id
        );
      }
    }
  }

  for (const conn of system.connections) {
    const validation = validateSystemConnection(conn, system.components, products);
    if (!validation.valid) {
      warn(
        'error',
        `Invalid connection: ${validation.message ?? 'These terminals are not compatible.'}`,
        'INVALID_CONNECTION',
        undefined,
        conn.id
      );
    }

    const fromComp = system.components.find((component) => component.id === conn.fromComponentId);
    const toComp = system.components.find((component) => component.id === conn.toComponentId);
    const fromProduct = fromComp ? products.get(fromComp.productId) : undefined;
    const toProduct = toComp ? products.get(toComp.productId) : undefined;
    const fromTerminal = fromComp && fromProduct
      ? getEffectiveTerminal(fromProduct, conn.fromTerminalId, fromComp)
      : undefined;
    const toTerminal = toComp && toProduct
      ? getEffectiveTerminal(toProduct, conn.toTerminalId, toComp)
      : undefined;
    if (
      !conn.busLink &&
      fromComp &&
      toComp &&
      fromProduct &&
      toProduct &&
      fromTerminal &&
      toTerminal &&
      isDcBusTerminal(fromProduct, fromTerminal) &&
      isDcBusTerminal(toProduct, toTerminal)
    ) {
      const fromVoltage = getDcBusNominalVoltage(fromComp, fromProduct);
      const toVoltage = getDcBusNominalVoltage(toComp, toProduct);
      if (fromVoltage == null || toVoltage == null) {
        warn(
          'warning',
          'One or more directly connected DC buses do not have a nominal voltage assigned. Voltage compatibility could not be verified.',
          'DC_BUS_VOLTAGE_UNKNOWN',
          undefined,
          conn.id
        );
      }
    }

    if ((conn.voltageDropPercent ?? 0) > system.assumptions.maxVoltageDropPercent) {
      warn(
        'warning',
        `Connection has ${conn.voltageDropPercent?.toFixed(1)}% voltage drop (limit: ${system.assumptions.maxVoltageDropPercent}%)`,
        'HIGH_VOLTAGE_DROP',
        undefined,
        conn.id
      );
    }

    for (const connectionWarning of conn.warnings ?? []) {
      if (connectionWarning.toLowerCase().includes('voltage drop')) continue;
      warn('warning', connectionWarning, 'CONNECTION_SIZING_WARNING', undefined, conn.id);
    }
  }

  return warnings;
}
