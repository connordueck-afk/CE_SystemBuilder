import type { NominalVoltage, Product } from '../../../types/system';

/** Match a catalog filter against any DC/PV/AC interface on the product. */
export function productMatchesVoltageFilter(product: Product, voltageV: NominalVoltage): boolean {
  const powerPorts = (product.ports ?? []).filter(
    (port) => port.kind === 'dc' || port.kind === 'pv' || port.kind === 'ac'
  );
  if (powerPorts.some((port) => {
    if (port.nominalVoltageV != null && Math.abs(port.nominalVoltageV - voltageV) < 0.01) return true;
    if (port.voltageMinV != null && voltageV < port.voltageMinV) return false;
    if (port.voltageMaxV != null && voltageV > port.voltageMaxV) return false;
    return port.voltageMinV != null || port.voltageMaxV != null;
  })) return true;

  const declared = product.nominalVoltage == null
    ? []
    : Array.isArray(product.nominalVoltage) ? product.nominalVoltage : [product.nominalVoltage];
  return declared.length === 0 || declared.includes(voltageV);
}
