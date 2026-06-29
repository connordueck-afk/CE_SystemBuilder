import type { Product, SystemComponent, TerminalDefinition } from '../types/system';
import { terminalKind, terminalRole } from './portSpecs';

export function isDcBusProduct(product: Product): boolean {
  if (product.productType === 'busbar' || product.productType === 'dc_distribution') return true;
  return product.terminals.some((terminal) =>
    terminalKind(product, terminal) === 'dc_power' &&
    terminalRole(product, terminal) === 'bus'
  );
}

export function isDcBusTerminal(product: Product, terminal: TerminalDefinition): boolean {
  return isDcBusProduct(product) && terminalKind(product, terminal) === 'dc_power';
}

export function getDcBusNominalVoltage(component: SystemComponent, product: Product): number | undefined {
  if (!isDcBusProduct(product)) return undefined;
  if (component.dcNominalVoltage != null && component.dcNominalVoltage > 0) return component.dcNominalVoltage;
  if (component.instanceVoltageV != null && component.instanceVoltageV > 0) return component.instanceVoltageV;
  return undefined;
}

export function formatDcVoltage(voltage: number | undefined): string {
  return voltage != null ? `${voltage} VDC` : 'Unassigned';
}
