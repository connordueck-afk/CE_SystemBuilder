import type { ConnectionPolarity, Product, SystemConnection, SystemDesign } from '../types/system';
import { DEFAULT_ASSUMPTIONS } from '../data/electricalRules';
import { getEffectiveTerminal } from './effectiveTerminals';

export interface BatteryInterconnect {
  connectionId: string;
  polarity: ConnectionPolarity;
  batteryComponentIds: [string, string];
  cableLengthFt: number;
  maxLengthFt: number;
  isShortPackInterconnect: boolean;
  isSameProduct: boolean;
  isSameNominalVoltage: boolean;
}

function nominalVoltageKey(product: Product): string {
  return Array.isArray(product.nominalVoltage)
    ? product.nominalVoltage.join('/')
    : String(product.nominalVoltage ?? '');
}

function batteryInterconnectMaxLength(system: SystemDesign): number {
  return system.assumptions.batteryInterconnectMaxLengthFt ?? DEFAULT_ASSUMPTIONS.batteryInterconnectMaxLengthFt;
}

function getEndpoint(
  connection: SystemConnection,
  system: SystemDesign,
  products: Map<string, Product>,
  side: 'from' | 'to'
) {
  const componentId = side === 'from' ? connection.fromComponentId : connection.toComponentId;
  const terminalId = side === 'from' ? connection.fromTerminalId : connection.toTerminalId;
  const component = system.components.find((item) => item.id === componentId);
  const product = component ? products.get(component.productId) : undefined;
  const terminal = component && product ? getEffectiveTerminal(product, terminalId, component) : undefined;
  return component && product && terminal ? { component, product, terminal } : undefined;
}

export function getBatteryInterconnect(
  connection: SystemConnection,
  system: SystemDesign,
  products: Map<string, Product>
): BatteryInterconnect | undefined {
  const from = getEndpoint(connection, system, products, 'from');
  const to = getEndpoint(connection, system, products, 'to');
  if (!from || !to) return undefined;
  if (from.product.productType !== 'battery' || to.product.productType !== 'battery') return undefined;
  if (from.terminal.kind !== 'dc_power' || to.terminal.kind !== 'dc_power') return undefined;
  if (!from.terminal.polarity || from.terminal.polarity !== to.terminal.polarity) return undefined;

  const maxLengthFt = batteryInterconnectMaxLength(system);
  const isSameProduct = from.product.id === to.product.id;
  const isSameNominalVoltage = nominalVoltageKey(from.product) === nominalVoltageKey(to.product);

  return {
    connectionId: connection.id,
    polarity: from.terminal.polarity,
    batteryComponentIds: [from.component.id, to.component.id],
    cableLengthFt: connection.cableLengthFt,
    maxLengthFt,
    isShortPackInterconnect: isSameProduct && isSameNominalVoltage && connection.cableLengthFt <= maxLengthFt,
    isSameProduct,
    isSameNominalVoltage,
  };
}

export function buildBatteryInterconnectMap(
  system: SystemDesign,
  products: Map<string, Product>
): Map<string, BatteryInterconnect> {
  const interconnects = new Map<string, BatteryInterconnect>();
  for (const connection of system.connections) {
    const interconnect = getBatteryInterconnect(connection, system, products);
    if (interconnect) interconnects.set(connection.id, interconnect);
  }
  return interconnects;
}
