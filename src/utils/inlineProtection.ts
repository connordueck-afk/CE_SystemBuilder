import type { ConnectionPointKind, ConnectionPolarity, Product, SystemComponent } from '../types/system';
import { getEffectiveTerminals } from './effectiveTerminals';
import type { BusType } from './electricalNetlist';
import { breakerMediumForBusType, breakerRatingProfiles } from './breakerSemantics';

export interface InlineProtectionTerminals {
  inId: string;
  outId: string;
}

function targetForBusType(busType: BusType): { kind: ConnectionPointKind; polarity: ConnectionPolarity } | null {
  if (busType === 'dc_pos') return { kind: 'dc_power', polarity: 'positive' };
  if (busType === 'dc_neg') return { kind: 'dc_power', polarity: 'negative' };
  if (busType === 'pv_pos') return { kind: 'pv_power', polarity: 'positive' };
  if (busType === 'pv_neg') return { kind: 'pv_power', polarity: 'negative' };
  if (busType === 'ac_line') return { kind: 'ac_power', polarity: 'line' };
  if (busType === 'ac_line2') return { kind: 'ac_power', polarity: 'line2' };
  if (busType === 'ac_line3') return { kind: 'ac_power', polarity: 'line3' };
  return null;
}

function isInputTerminalId(id: string): boolean {
  return id === 'in' || id.endsWith('_in') || id.startsWith('in_');
}

function isOutputTerminalId(id: string): boolean {
  return id === 'out' || id.endsWith('_out') || id.startsWith('out_');
}

export function inlineProtectionTerminalIds(
  product: Product,
  busType: BusType
): InlineProtectionTerminals | null {
  const target = targetForBusType(busType);
  if (!target) return null;

  const medium = breakerMediumForBusType(busType);
  const profiles = product.productType === 'breaker' && medium
    ? breakerRatingProfiles(product).filter((profile) => profile.medium === medium)
    : [];
  const configuredComponent: SystemComponent | undefined = profiles.length === 1
    ? { id: '__inline__', productId: product.id, quantity: 1, x: 0, y: 0, breakerConfigurationId: profiles[0].id }
    : undefined;
  const matchingTerminals = getEffectiveTerminals(product, configuredComponent)
    .filter((terminal) => terminal.kind === target.kind && terminal.polarity === target.polarity);
  if (matchingTerminals.length < 2) return null;

  const input = matchingTerminals.find((terminal) => terminal.direction === 'input') ??
    matchingTerminals.find((terminal) => isInputTerminalId(terminal.id));
  const output = matchingTerminals.find((terminal) => terminal.direction === 'output') ??
    matchingTerminals.find((terminal) => isOutputTerminalId(terminal.id));

  return input && output ? { inId: input.id, outId: output.id } : null;
}
