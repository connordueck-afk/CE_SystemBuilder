import type { EffectiveTerminal, SystemDesign, SystemComponent, SystemConnection, SystemWarning, Product } from '../types/system';
import { buildCommunicationNetworks, communicationNetworkWarnings } from './communicationNetworks';
import { nextStandardFuse } from '../data/fuseRatings';
import { cableByAwg } from '../data/cableAmpacity';
import { CONTINUOUS_LOAD_FACTOR } from '../data/electricalRules';
import { validateSystemConnection } from './connectionRules';
import { findSolarArrayFeedingComponent } from './solarCalculations';
import { canProvidePower } from './terminalDirection';
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
import { getEffectiveTerminal, getEffectiveTerminals } from './effectiveTerminals';
import { getProductPort, linkGroupKey } from './portLinks';
import { getTerminalPortId, portMaxCurrentA, terminalKind, terminalRole } from './portSpecs';
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
  'custom_solar_array',
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

/**
 * Standard DC system voltage classes and the nominal-voltage band each covers.
 * A "48V system" spans roughly 40-64V because 48V-class LiFePO4 batteries sit at
 * ~51.2V nominal while inverters/lead-acid report 48V. Sources in the same band
 * are the same system and must not be flagged as incompatible.
 */
const VOLTAGE_CLASS_BANDS: Array<{ classV: number; minV: number; maxV: number }> = [
  { classV: 12, minV: 10, maxV: 16 },
  { classV: 24, minV: 20, maxV: 32 },
  { classV: 48, minV: 40, maxV: 64 },
];

/**
 * Maps a raw nominal voltage to its DC system voltage class (12/24/48). Voltages
 * outside the standard bands fall back to their rounded value so genuinely
 * distinct domains still compare unequal.
 */
function voltageClassFor(voltage: number): number {
  const band = VOLTAGE_CLASS_BANDS.find((b) => voltage >= b.minV && voltage <= b.maxV);
  return band ? band.classV : normalizeVoltage(voltage);
}

function arrayValueIncludes(values: number[], target: number): boolean {
  return values.some((value) => Math.abs(value - target) < 0.01);
}

function sourceVoltageForTerminal(ref: TerminalNodeRef, system: SystemDesign): number | undefined {
  const { component, product, terminal } = ref;
  if (terminal.nominalVoltageV != null) return terminal.nominalVoltageV;
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
  return SOURCE_COMPATIBILITY_TYPES.has(ref.product.productType) || terminalRole(ref.product, ref.terminal) === 'source';
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
  const batteryInternalShareCurrentA = (componentId: string, externalCurrentA: number): number => {
    const pack = batteryTopology.packByBatteryId.get(componentId);
    if (!pack || pack.parallelCount <= 1) return externalCurrentA;
    return externalCurrentA / pack.parallelCount;
  };

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
  const attachedPeakCurrentA = (componentId: string, terminalIds: string[]): number => {
    const terminalSet = new Set(terminalIds);
    let maxA = 0;

    for (const connection of system.connections) {
      const terminalId = connectionTerminalForComponent(connection, componentId);
      if (!terminalId || !terminalSet.has(terminalId)) continue;
      maxA = Math.max(maxA, connectionDesignCurrentA(connection));
    }

    return maxA;
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

      const voltageClass = voltageClassFor(voltage);
      sourceRefsByVoltage.set(voltageClass, [
        ...(sourceRefsByVoltage.get(voltageClass) ?? []),
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
      const busTerminalIds = getEffectiveTerminals(product, comp)
        .filter((terminal) => {
          const kind = terminalKind(product, terminal);
          return kind === 'dc_power' || kind === 'pv_power' || kind === 'ac_power';
        })
        .map((terminal) => terminal.id);
      const busCurrentA = attachedPeakCurrentA(comp.id, busTerminalIds);
      if (busCurrentA > productBusRatingA) {
        warn(
          'error',
          `"${productLabel(comp, product)}" is rated for ${productBusRatingA}A but its largest attached branch carries ${busCurrentA.toFixed(0)}A`,
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

  // ---- Port-linked device limits ----
  // Three rules for devices that expose internal ports (resolved through the
  // terminal group's portId):
  //   (1a) each physical jack carries at most its terminal.maxCurrentA
  //   (1c) a port's internal busbar carries at most port.busRatingA (incl. pass-through)
  //   (2)  every connected positive lead in a port has a connected return (and vice versa)
  for (const comp of system.components) {
    const product = productByComponent.get(comp.id);
    if (!product) continue;
    const terminals = getEffectiveTerminals(product, comp);
    const terminalById = new Map(terminals.map((terminal) => [terminal.id, terminal]));
    const isPowerKind = (terminal: EffectiveTerminal) => {
      const k = terminal.kind;
      return k === 'dc_power' || k === 'pv_power' || k === 'ac_power';
    };
    // Link-group key: terminals sharing portId + kind + polarity are one bonded node.
    const linkKeyOf = (terminal: EffectiveTerminal): string | null => linkGroupKey(product, terminal);

    // External cables per link group — parallel jacks on one bonded node share current.
    const cablesPerLinkGroup = new Map<string, number>();
    for (const connection of system.connections) {
      const terminalId = connectionTerminalForComponent(connection, comp.id);
      const terminal = terminalId ? terminalById.get(terminalId) : undefined;
      const linkKey = terminal ? linkKeyOf(terminal) : null;
      if (linkKey) cablesPerLinkGroup.set(linkKey, (cablesPerLinkGroup.get(linkKey) ?? 0) + 1);
    }

    // (1a) Per-jack over-current.
    for (const connection of system.connections) {
      const terminalId = connectionTerminalForComponent(connection, comp.id);
      const terminal = terminalId ? terminalById.get(terminalId) : undefined;
      if (!terminal || !isPowerKind(terminal) || terminal.maxCurrentA == null) continue;
      const linkKey = linkKeyOf(terminal);
      const cablesOnGroup = linkKey ? Math.max(1, cablesPerLinkGroup.get(linkKey) ?? 1) : 1;
      // Linked jacks share their bonded node's current equally across their cables.
      const jackCurrentA = connectionDesignCurrentA(connection) / cablesOnGroup;
      if (jackCurrentA > terminal.maxCurrentA + 0.5) {
        warn(
          'error',
          `"${productLabel(comp, product)}" ${terminal.label} connection carries ${jackCurrentA.toFixed(0)}A, above this connection point's ${terminal.maxCurrentA}A rating`,
          'TERMINAL_OVERCURRENT',
          comp.id,
          connection.id
        );
      }
    }

    // (1c) Internal port busbar over-current. The through-current of a port's
    // internal busbar is the current the *device itself* drives through that port —
    // not the operating current of the shared external net it sits on. A 100A MPPT
    // tied to a 210A battery bus carries 100A through its own output busbar, not 210A;
    // using the net total here produced false PORT_BUS_OVERLOADED errors on every
    // smaller device sharing a busbar.
    //
    // Collector products (busbars, distributors) are rated by BUSBAR_OVERLOADED /
    // DISTRIBUTION_BUS_OVERLOADED on the correct net math, and series pass-through
    // ports by the fuse checks, so both are excluded here.
    const isCollectorProduct = product.productType === 'busbar'
      || product.productType === 'dc_distribution'
      || Boolean(product.distributionTopology);
    if (!isCollectorProduct) {
      for (const port of product.ports ?? []) {
        const portRatingA = portMaxCurrentA(port);
        if (portRatingA == null || port.topology === 'pass_through') continue;

        // Internal busbar current per bonded node: parallel jacks sharing a link group
        // sum (a battery's paralleled posts carry their combined current on the shared
        // internal bus), while separate poles stay separate. Inter-battery interconnects
        // are internal pack wiring — the current crossing them is accounted at the pack
        // feeder, not as extra load on a single battery's full-rated bus — so they are
        // excluded; otherwise a daisy-chained battery double-counts the same current
        // flowing in one bonded post and out another. The bus current is the largest of
        // the bonded-node sums.
        const currentByLinkGroup = new Map<string, number>();
        const seenConns = new Set<string>();
        for (const connection of system.connections) {
          if (seenConns.has(connection.id)) continue;
          const terminalId = connectionTerminalForComponent(connection, comp.id);
          const terminal = terminalId ? terminalById.get(terminalId) : undefined;
          if (!terminal || getTerminalPortId(product, terminal) !== port.id || !isPowerKind(terminal)) continue;
          seenConns.add(connection.id);
          const otherId = connection.fromComponentId === comp.id ? connection.toComponentId : connection.fromComponentId;
          const otherProduct = productByComponent.get(otherId);
          if (product.productType === 'battery' && otherProduct?.productType === 'battery') continue;
          const groupKey = linkKeyOf(terminal) ?? terminal.id;
          currentByLinkGroup.set(groupKey, (currentByLinkGroup.get(groupKey) ?? 0) + connectionDesignCurrentA(connection));
        }

        const externalBusCurrentA = currentByLinkGroup.size > 0 ? Math.max(...currentByLinkGroup.values()) : 0;
        const busCurrentA = product.productType === 'battery'
          ? batteryInternalShareCurrentA(comp.id, externalBusCurrentA)
          : externalBusCurrentA;
        if (busCurrentA > portRatingA + 0.5) {
          warn(
            'error',
            `"${productLabel(comp, product)}" ${port.label ?? port.id} internal busbar carries ${busCurrentA.toFixed(0)}A, above its ${portRatingA}A rating`,
            'PORT_BUS_OVERLOADED',
            comp.id
          );
        }
      }
    }

    // (2) DC+/DC- return pairing, required only for two-pole ports. `bus` and
    // `pass_through` ports are single-polarity / series and their poles legitimately
    // stand alone. Falls back to the legacy passive-product skip while ports are
    // untyped during migration.
    if (!isPassiveElectricalProduct(product)) {
      interface PolePresence { hasPos: boolean; hasNeg: boolean; posLabel?: string; negLabel?: string; }
      const presenceByPort = new Map<string, PolePresence>();
      for (const terminal of terminals) {
        if (terminal.kind !== 'dc_power' && terminal.kind !== 'pv_power') continue;
        if (!connectedTerminals.has(`${comp.id}:${terminal.id}`)) continue;
        const resolvedPortId = getTerminalPortId(product, terminal);
        const topo = getProductPort(product, resolvedPortId)?.topology;
        if (topo === 'bus' || topo === 'pass_through') continue;
        const busType = busTypeFromTerminal(terminal);
        const isPos = busType === 'dc_pos' || busType === 'pv_pos';
        const isNeg = busType === 'dc_neg' || busType === 'pv_neg';
        if (!isPos && !isNeg) continue;
        const portKey = resolvedPortId ?? '__device__';
        const presence = presenceByPort.get(portKey) ?? { hasPos: false, hasNeg: false };
        if (isPos) { presence.hasPos = true; presence.posLabel = terminal.label; }
        if (isNeg) { presence.hasNeg = true; presence.negLabel = terminal.label; }
        presenceByPort.set(portKey, presence);
      }
      for (const [portKey, presence] of presenceByPort) {
        const portSuffix = portKey === '__device__'
          ? ''
          : ` ${getProductPort(product, portKey)?.label ?? portKey} port`;
        if (presence.hasPos && !presence.hasNeg) {
          warn(
            'error',
            `"${productLabel(comp, product)}"${portSuffix} has a connected positive (${presence.posLabel}) but no return (negative) — every DC+ needs a DC- return`,
            'DC_RETURN_MISSING',
            comp.id
          );
        } else if (presence.hasNeg && !presence.hasPos) {
          warn(
            'error',
            `"${productLabel(comp, product)}"${portSuffix} has a connected negative (${presence.negLabel}) but no positive lead — every DC- needs a DC+ supply`,
            'DC_RETURN_MISSING',
            comp.id
          );
        }
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
    const returnDesignCurrentA = Math.max(...returnConnections.map(connectionDesignCurrentA));
    const requiredReturnA = returnDesignCurrentA > 0 ? returnDesignCurrentA : requiredA;
    if (returnAmpacityA != null && returnAmpacityA < requiredReturnA) {
      warn(
        'error',
        `DC negative return for ${label} is rated ${returnAmpacityA}A but the return branch carries ${requiredReturnA.toFixed(0)}A`,
        'DC_NEG_RETURN_UNDERSIZED',
        componentId,
        positiveConnection.id
      );
    }
  };

  // Battery-to-battery helpers: detect and find matching negative interconnects
  // between the same two batteries, regardless of terminal number or direction.
  const isBatteryToBatteryPositiveInterconnect = (connection: SystemConnection): boolean => {
    const fromProduct = productByComponent.get(connection.fromComponentId);
    const toProduct = productByComponent.get(connection.toComponentId);
    return fromProduct?.productType === 'battery' && toProduct?.productType === 'battery';
  };

  const matchingNegativeBatteryInterconnects = (batteryIdA: string, batteryIdB: string): SystemConnection[] =>
    negativeConnections.filter((conn) => connectionBetweenComponents(conn, batteryIdA, batteryIdB));

  for (const connection of system.connections) {
    if (connectionBusType(connection) !== 'dc_pos') continue;

    const designCurrentA = connectionDesignCurrentA(connection);
    if (designCurrentA <= 0) continue;

    const fromComp = componentById.get(connection.fromComponentId);
    const toComp = componentById.get(connection.toComponentId);
    const fromProduct = productByComponent.get(connection.fromComponentId);
    const toProduct = productByComponent.get(connection.toComponentId);
    if (!fromComp || !toComp || !fromProduct || !toProduct) continue;

    // --- Question A: Battery-to-battery positive interconnect ---
    // Look for a matching negative interconnect between the same two batteries.
    // Terminal numbers and connection direction do not matter.
    if (isBatteryToBatteryPositiveInterconnect(connection)) {
      const matchingNegatives = matchingNegativeBatteryInterconnects(connection.fromComponentId, connection.toComponentId);
      checkReturnPath(
        connection,
        designCurrentA,
        matchingNegatives,
        `battery interconnect between ${productLabel(fromComp, fromProduct)} and ${productLabel(toComp, toProduct)}`
      );
      continue;
    }

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
      // --- Question B: Pack-external positive feeder ---
      // For pack-external DC+ feeders, look for a pack-external DC- return from
      // any battery in the same pack. Diagonal takeoff is valid (the positive
      // and negative external takeoffs do not need to be on the same physical
      // battery). Do not filter by the right component — DC+ and DC- may use
      // different busbar components in parallel busbar systems.
      const returnConnections = left.product.productType === 'battery'
        ? returnConnectionsForBatteryPack(left.component.id)
        : right.product.productType === 'battery'
          ? returnConnectionsForBatteryPack(right.component.id)
          : returnConnectionsBetween(left.component.id, right.component.id);
      checkReturnPath(
        connection,
        requiredA,
        returnConnections,
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

    if (product.productType === 'custom_solar_array') {
      const ratings = comp.customSolarArrayRatings;
      const computedPowerW =
        ratings?.powerW ??
        (ratings?.vmpV != null && ratings.impA != null ? ratings.vmpV * ratings.impA : undefined);
      const missingRequired =
        ratings?.vocV == null ||
        ratings.iscA == null ||
        computedPowerW == null ||
        !(ratings.vocV > 0) ||
        !(ratings.iscA > 0) ||
        !(computedPowerW > 0);

      if (missingRequired) {
        warn(
          'warning',
          `"${comp.label ?? product.name}" needs aggregate PV ratings: Voc, Isc, and power or Vmp x Imp.`,
          'CUSTOM_SOLAR_ARRAY_INCOMPLETE',
          comp.id
        );
      }

      const invalid =
        (ratings?.vmpV != null && ratings.vocV != null && ratings.vmpV > ratings.vocV) ||
        (ratings?.impA != null && ratings.iscA != null && ratings.impA > ratings.iscA) ||
        (ratings?.coldVocV != null && ratings.vocV != null && ratings.coldVocV < ratings.vocV);

      if (invalid) {
        warn(
          'error',
          `"${comp.label ?? product.name}" has invalid aggregate PV ratings. Check Vmp <= Voc, Imp <= Isc, and cold Voc >= Voc.`,
          'CUSTOM_SOLAR_ARRAY_INVALID_RATINGS',
          comp.id
        );
      }
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
    const arrayVoltageV = solarStats.coldVocV ?? solarStats.vocV;
    if (arrayVoltageV > mppt.maxPvVoltageV) {
      warn(
        'error',
        `"${comp.label ?? product.name}" PV input over-voltage: array Voc ${arrayVoltageV.toFixed(1)}V exceeds ${mppt.maxPvVoltageV}V limit`,
        'MPPT_PV_VOLTAGE_EXCEEDED',
        comp.id
      );
    } else if (arrayVoltageV > mppt.maxPvVoltageV * 0.9) {
      warn(
        'warning',
        `"${comp.label ?? product.name}" PV input is close to voltage limit: array Voc ${arrayVoltageV.toFixed(1)}V of ${mppt.maxPvVoltageV}V`,
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

    // Max PV power is voltage-dependent on Victron MPPTs; prefer the rating at
    // the system's actual battery voltage, falling back to the scalar.
    const maxPvPowerW = mppt.maxPvPowerByVoltageW?.[system.nominalVoltage] ?? mppt.maxPvPowerW;
    if (maxPvPowerW != null && solarStats.powerW > maxPvPowerW) {
      warn(
        'warning',
        `"${comp.label ?? product.name}" is over-paneled: array ${solarStats.powerW.toFixed(0)}W exceeds ${maxPvPowerW}W PV rating at ${system.nominalVoltage}V`,
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

  const commNetworks = buildCommunicationNetworks(system, products);
  for (const commWarning of communicationNetworkWarnings(commNetworks)) {
    warnings.push(commWarning as SystemWarning);
  }

  return warnings;
}
