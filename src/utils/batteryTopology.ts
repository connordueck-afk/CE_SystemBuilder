import type { Product, SystemComponent, SystemConnection, SystemDesign, SystemWarning, TerminalDefinition } from '../types/system';
import { busTypeFromTerminal, type BusType } from './electricalNetlist';
import { getEffectiveTerminal } from './effectiveTerminals';

export interface BatteryStringAnalysis {
  id: string;
  batteryComponentIds: string[];
  productId: string;
  seriesCount: number;
  voltageV: number;
  capacityAh?: number;
  capacityWh: number;
  maxChargeCurrentA?: number;
  maxDischargeCurrentA?: number;
  internalConnectionIds: string[];
  positiveTerminalKeys: string[];
  negativeTerminalKeys: string[];
}

export interface BatteryPackAnalysis {
  id: string;
  stringIds: string[];
  batteryComponentIds: string[];
  seriesCount: number;
  parallelCount: number;
  voltageV: number;
  capacityAh?: number;
  capacityWh: number;
  maxChargeCurrentA?: number;
  maxDischargeCurrentA?: number;
  internalConnectionIds: string[];
  outputConnectionIds: string[];
}

export interface BatteryTopologyAnalysis {
  strings: BatteryStringAnalysis[];
  packs: BatteryPackAnalysis[];
  stringByBatteryId: Map<string, BatteryStringAnalysis>;
  packByBatteryId: Map<string, BatteryPackAnalysis>;
  packByOutputConnectionId: Map<string, BatteryPackAnalysis>;
  internalConnectionIds: Set<string>;
  issues: SystemWarning[];
}

interface BatteryEndpoint {
  component: SystemComponent;
  product: Product;
  terminal: TerminalDefinition;
}

interface BatteryLink {
  connection: SystemConnection;
  from: BatteryEndpoint;
  to: BatteryEndpoint;
  busType: BusType;
}

function terminalKey(componentId: string, terminalId: string): string {
  return `${componentId}:${terminalId}`;
}

function endpoint(
  componentId: string,
  terminalId: string,
  system: SystemDesign,
  products: Map<string, Product>
): BatteryEndpoint | undefined {
  const component = system.components.find((item) => item.id === componentId);
  const product = component ? products.get(component.productId) : undefined;
  const terminal = component && product ? getEffectiveTerminal(product, terminalId, component) : undefined;
  if (!component || !product || !terminal || product.productType !== 'battery') return undefined;
  return { component, product, terminal };
}

function batteryConnection(
  connection: SystemConnection,
  system: SystemDesign,
  products: Map<string, Product>
): BatteryLink | undefined {
  const from = endpoint(connection.fromComponentId, connection.fromTerminalId, system, products);
  const to = endpoint(connection.toComponentId, connection.toTerminalId, system, products);
  if (!from || !to) return undefined;
  if (from.terminal.kind !== 'dc_power' || to.terminal.kind !== 'dc_power') return undefined;

  const fromBus = busTypeFromTerminal(from.terminal);
  const toBus = busTypeFromTerminal(to.terminal);
  const busType = fromBus === toBus ? fromBus : 'unknown';
  return { connection, from, to, busType };
}

function productVoltage(product: Product): number {
  return product.batteryRatings?.nominalVoltageV ??
    (typeof product.nominalVoltage === 'number' ? product.nominalVoltage : 0);
}

function productCapacityAh(product: Product): number | undefined {
  return product.batteryRatings?.capacityAh;
}

function productCapacityWh(product: Product): number {
  return product.batteryRatings?.capacityWh ?? product.capacityWh ?? 0;
}

function productChargeA(product: Product): number | undefined {
  return product.batteryRatings?.maxChargeCurrentA;
}

function productDischargeA(product: Product): number | undefined {
  return product.batteryRatings?.maxDischargeCurrentA ?? product.maxCurrentA;
}

function sameStringSignature(left: BatteryStringAnalysis, right: BatteryStringAnalysis): boolean {
  return left.productId === right.productId &&
    left.seriesCount === right.seriesCount &&
    Math.abs(left.voltageV - right.voltageV) < 0.01 &&
    (left.capacityAh ?? -1) === (right.capacityAh ?? -1);
}

function nominalVoltageBand(nominalVoltage: SystemDesign['nominalVoltage']): { minV: number; maxV: number } {
  switch (nominalVoltage) {
    case 12:
      return { minV: 10, maxV: 16 };
    case 24:
      return { minV: 20, maxV: 32 };
    case 48:
      return { minV: 40, maxV: 64 };
    default:
      return { minV: nominalVoltage * 0.8, maxV: nominalVoltage * 1.35 };
  }
}

function voltageInNominalBand(voltageV: number, nominalVoltage: SystemDesign['nominalVoltage']): boolean {
  const band = nominalVoltageBand(nominalVoltage);
  return voltageV >= band.minV && voltageV <= band.maxV;
}

function getOrCreateSet(map: Map<string, Set<string>>, key: string): Set<string> {
  if (!map.has(key)) map.set(key, new Set([key]));
  return map.get(key)!;
}

function union(map: Map<string, Set<string>>, a: string, b: string): void {
  const left = getOrCreateSet(map, a);
  const right = getOrCreateSet(map, b);
  if (left === right) return;
  for (const item of right) {
    left.add(item);
    map.set(item, left);
  }
}

export function isBatterySeriesConnection(
  connection: SystemConnection,
  system: SystemDesign,
  products: Map<string, Product>
): boolean {
  const link = batteryConnection(connection, system, products);
  return Boolean(
    link &&
    link.from.terminal.polarity &&
    link.to.terminal.polarity &&
    link.from.terminal.polarity !== link.to.terminal.polarity
  );
}

export function analyzeBatteryTopology(
  system: SystemDesign,
  products: Map<string, Product>
): BatteryTopologyAnalysis {
  const issues: SystemWarning[] = [];
  let issueId = 0;
  const warn = (
    severity: SystemWarning['severity'],
    message: string,
    code: string,
    componentId?: string,
    connectionId?: string
  ) => {
    issues.push({ id: `battery-topology-${++issueId}`, severity, message, code, componentId, connectionId });
  };

  const batteryComponents = system.components.filter((component) => products.get(component.productId)?.productType === 'battery');
  const componentById = new Map(system.components.map((component) => [component.id, component]));
  const productByComponentId = new Map(
    batteryComponents.map((component) => [component.id, products.get(component.productId)!])
  );
  const batteryLinks = system.connections
    .map((connection) => batteryConnection(connection, system, products))
    .filter((link): link is BatteryLink => Boolean(link));
  const seriesLinks = batteryLinks.filter((link) => link.from.terminal.polarity !== link.to.terminal.polarity);
  const parallelLinks = batteryLinks.filter((link) => link.from.terminal.polarity === link.to.terminal.polarity && link.busType !== 'unknown');
  const internalConnectionIds = new Set<string>();

  const seriesGraph = new Map<string, Set<string>>();
  const seriesConnectionsByBattery = new Map<string, SystemConnection[]>();
  for (const link of seriesLinks) {
    const fromId = link.from.component.id;
    const toId = link.to.component.id;
    seriesGraph.set(fromId, new Set([...(seriesGraph.get(fromId) ?? []), toId]));
    seriesGraph.set(toId, new Set([...(seriesGraph.get(toId) ?? []), fromId]));
    seriesConnectionsByBattery.set(fromId, [...(seriesConnectionsByBattery.get(fromId) ?? []), link.connection]);
    seriesConnectionsByBattery.set(toId, [...(seriesConnectionsByBattery.get(toId) ?? []), link.connection]);
    internalConnectionIds.add(link.connection.id);
  }

  const visited = new Set<string>();
  const strings: BatteryStringAnalysis[] = [];
  const stringByBatteryId = new Map<string, BatteryStringAnalysis>();

  for (const root of batteryComponents) {
    if (visited.has(root.id)) continue;
    const pending = [root.id];
    const batteryIds: string[] = [];
    visited.add(root.id);

    while (pending.length > 0) {
      const id = pending.pop()!;
      batteryIds.push(id);
      for (const next of seriesGraph.get(id) ?? []) {
        if (visited.has(next)) continue;
        visited.add(next);
        pending.push(next);
      }
    }

    const orderedIds = batteryIds.sort();
    const productIds = new Set(orderedIds.map((id) => productByComponentId.get(id)?.id));
    const product = productByComponentId.get(orderedIds[0]);
    if (!product) continue;

    const internalIds = [...new Set(orderedIds.flatMap((id) => seriesConnectionsByBattery.get(id)?.map((conn) => conn.id) ?? []))];
    const seriesCount = orderedIds.length;

    if (productIds.size > 1) {
      warn('error', 'Battery series string contains mismatched battery products; use matching batteries in series', 'BATTERY_STRING_MISMATCH', orderedIds[0], internalIds[0]);
    }
    if (seriesCount > 1 && product.batteryRatings?.seriesAllowed !== true) {
      warn('error', `"${product.name}" is not marked as series-capable`, 'BATTERY_SERIES_NOT_ALLOWED', orderedIds[0], internalIds[0]);
    }
    if (seriesCount > 1 && product.batteryRatings?.maxSeriesCount != null && seriesCount > product.batteryRatings.maxSeriesCount) {
      warn('error', `"${product.name}" allows up to ${product.batteryRatings.maxSeriesCount} batteries in series; this string has ${seriesCount}`, 'BATTERY_SERIES_COUNT_EXCEEDED', orderedIds[0], internalIds[0]);
    }

    const voltageV = orderedIds.reduce((sum, id) => sum + productVoltage(productByComponentId.get(id) ?? product), 0);
    const capacityAh = productCapacityAh(product);
    const capacityWh = capacityAh != null ? voltageV * capacityAh : orderedIds.reduce((sum, id) => sum + productCapacityWh(productByComponentId.get(id) ?? product), 0);
    const string: BatteryStringAnalysis = {
      id: `battery-string-${strings.length + 1}`,
      batteryComponentIds: orderedIds,
      productId: product.id,
      seriesCount,
      voltageV,
      capacityAh,
      capacityWh,
      maxChargeCurrentA: productChargeA(product),
      maxDischargeCurrentA: productDischargeA(product),
      internalConnectionIds: internalIds,
      positiveTerminalKeys: orderedIds.map((id) => terminalKey(id, 'dc_pos')),
      negativeTerminalKeys: orderedIds.map((id) => terminalKey(id, 'dc_neg')),
    };

    strings.push(string);
    for (const id of orderedIds) stringByBatteryId.set(id, string);
  }

  const packSets = new Map<string, Set<string>>();
  for (const string of strings) getOrCreateSet(packSets, string.id);
  const parallelConnectionIds: string[] = [];
  for (const link of parallelLinks) {
    const left = stringByBatteryId.get(link.from.component.id);
    const right = stringByBatteryId.get(link.to.component.id);
    if (!left || !right || left.id === right.id) {
      internalConnectionIds.add(link.connection.id);
      continue;
    }

    if (!sameStringSignature(left, right)) {
      warn('error', 'Parallel battery pack joins strings that do not match; parallel strings must use the same product and series count', 'BATTERY_PACK_STRING_MISMATCH', undefined, link.connection.id);
      continue;
    }

    union(packSets, left.id, right.id);
    parallelConnectionIds.push(link.connection.id);
    internalConnectionIds.add(link.connection.id);
  }

  const uniquePackSets = [...new Set([...packSets.values()])];
  const packs: BatteryPackAnalysis[] = [];
  const packByBatteryId = new Map<string, BatteryPackAnalysis>();
  const packByOutputConnectionId = new Map<string, BatteryPackAnalysis>();
  const stringById = new Map(strings.map((string) => [string.id, string]));

  for (const set of uniquePackSets) {
    const packStrings = [...set].map((id) => stringById.get(id)).filter((item): item is BatteryStringAnalysis => Boolean(item));
    if (packStrings.length === 0) continue;
    const first = packStrings[0];
    const batteryIds = packStrings.flatMap((string) => string.batteryComponentIds);
    const parallelCount = packStrings.length;
    const product = products.get(first.productId);

    if (parallelCount > 1 && product?.batteryRatings?.parallelAllowed === false) {
      warn('error', `"${product.name}" is not marked as parallel-capable`, 'BATTERY_PARALLEL_NOT_ALLOWED', batteryIds[0]);
    }
    if (parallelCount > 1 && product?.batteryRatings?.maxParallelStrings != null && parallelCount > product.batteryRatings.maxParallelStrings) {
      warn('error', `"${product.name}" allows up to ${product.batteryRatings.maxParallelStrings} parallel strings; this pack has ${parallelCount}`, 'BATTERY_PARALLEL_COUNT_EXCEEDED', batteryIds[0]);
    }

    const packInternalIds = new Set<string>(packStrings.flatMap((string) => string.internalConnectionIds));
    for (const link of parallelLinks) {
      const left = stringByBatteryId.get(link.from.component.id);
      const right = stringByBatteryId.get(link.to.component.id);
      if (left && right && set.has(left.id) && set.has(right.id)) packInternalIds.add(link.connection.id);
    }

    const outputConnectionIds = system.connections
      .filter((connection) => {
        const fromInPack = batteryIds.includes(connection.fromComponentId);
        const toInPack = batteryIds.includes(connection.toComponentId);
        return fromInPack !== toInPack;
      })
      .map((connection) => connection.id);

    const capacityAh = first.capacityAh != null
      ? packStrings.reduce((sum, string) => sum + (string.capacityAh ?? 0), 0)
      : undefined;
    const pack: BatteryPackAnalysis = {
      id: `battery-pack-${packs.length + 1}`,
      stringIds: packStrings.map((string) => string.id),
      batteryComponentIds: batteryIds,
      seriesCount: first.seriesCount,
      parallelCount,
      voltageV: first.voltageV,
      capacityAh,
      capacityWh: packStrings.reduce((sum, string) => sum + string.capacityWh, 0),
      maxChargeCurrentA: first.maxChargeCurrentA != null
        ? packStrings.reduce((sum, string) => sum + (string.maxChargeCurrentA ?? 0), 0)
        : undefined,
      maxDischargeCurrentA: first.maxDischargeCurrentA != null
        ? packStrings.reduce((sum, string) => sum + (string.maxDischargeCurrentA ?? 0), 0)
        : undefined,
      internalConnectionIds: [...packInternalIds],
      outputConnectionIds,
    };

    packs.push(pack);
    for (const id of batteryIds) packByBatteryId.set(id, pack);
    for (const id of outputConnectionIds) packByOutputConnectionId.set(id, pack);
  }

  for (const pack of packs) {
    if (!voltageInNominalBand(pack.voltageV, system.nominalVoltage)) {
      const band = nominalVoltageBand(system.nominalVoltage);
      warn(
        'error',
        `Battery pack ${pack.seriesCount}S${pack.parallelCount}P is ${pack.voltageV.toFixed(1)} V, outside the ${system.nominalVoltage} V system range (${band.minV}-${band.maxV} V)`,
        'BATTERY_PACK_VOLTAGE_MISMATCH',
        pack.batteryComponentIds[0]
      );
    }
  }

  for (const id of parallelConnectionIds) internalConnectionIds.add(id);

  return {
    strings,
    packs,
    stringByBatteryId,
    packByBatteryId,
    packByOutputConnectionId,
    internalConnectionIds,
    issues,
  };
}
