import type {
  BreakerDefinition,
  BreakerMedium,
  BreakerPoleDefinition,
  BreakerRatingProfile,
  Product,
  SystemComponent,
} from '../types/system';
import type { BusType } from './electricalNetlist';

export function breakerMediumForBusType(busType: BusType): BreakerMedium | undefined {
  if (busType === 'ac_line' || busType === 'ac_line2' || busType === 'ac_line3') return 'ac';
  if (busType === 'dc_pos' || busType === 'dc_neg') return 'dc';
  if (busType === 'pv_pos' || busType === 'pv_neg') return 'pv';
  return undefined;
}

function legacyBreakerProfile(product: Product): BreakerRatingProfile | undefined {
  if (product.productType !== 'breaker') return undefined;
  const ratings = product.protectionRatings;
  const maxVoltageV = ratings?.voltageRatingV ?? product.ports?.[0]?.voltageMaxV;
  if (!maxVoltageV) return undefined;
  const medium: BreakerMedium = ratings?.acDcCompatibility === 'ac'
    ? 'ac'
    : product.ports?.[0]?.kind === 'pv'
      ? 'pv'
      : 'dc';
  return {
    id: `legacy-${medium}`,
    label: `${medium.toUpperCase()} ${maxVoltageV}V`,
    medium,
    maxVoltageV,
    interruptRatingA: ratings?.interruptRatingA,
    polesRequired: 1,
    wiring: 'independent_conductors',
  };
}

export function breakerRatingProfiles(product: Product): BreakerRatingProfile[] {
  if (product.productType !== 'breaker') return [];
  if (product.breakerDefinition?.ratingProfiles.length) return product.breakerDefinition.ratingProfiles;
  const legacy = legacyBreakerProfile(product);
  return legacy ? [legacy] : [];
}

export function breakerSupportsMedium(product: Product, medium: BreakerMedium): boolean {
  return breakerRatingProfiles(product).some((profile) => profile.medium === medium);
}

export function breakerCompatibility(product: Product): 'ac' | 'dc' | 'both' | undefined {
  if (product.productType !== 'breaker') return undefined;
  const profiles = breakerRatingProfiles(product);
  const hasAc = profiles.some((profile) => profile.medium === 'ac');
  const hasDc = profiles.some((profile) => profile.medium === 'dc' || profile.medium === 'pv');
  if (hasAc && hasDc) return 'both';
  if (hasAc) return 'ac';
  if (hasDc) return 'dc';
  return product.protectionRatings?.acDcCompatibility;
}

export function selectedBreakerProfile(
  product: Product,
  component?: SystemComponent,
  medium?: BreakerMedium
): BreakerRatingProfile | undefined {
  const profiles = breakerRatingProfiles(product);
  const selectedId = component?.breakerConfigurationId;
  if (selectedId) return profiles.find((profile) => profile.id === selectedId);
  const matching = medium ? profiles.filter((profile) => profile.medium === medium) : profiles;
  return matching.length === 1 ? matching[0] : undefined;
}

function terminalGroupIds(product: Product): Set<string> {
  return new Set((product.terminalGroups ?? []).map((group) => group.id));
}

export function legacyBreakerPoles(product: Product): BreakerPoleDefinition[] {
  const groups = terminalGroupIds(product);
  const poles: BreakerPoleDefinition[] = [];
  for (const terminal of product.terminals) {
    const match = terminal.id.match(/^(.*?)(?:_)?in$/i);
    if (!match) continue;
    const prefix = match[1].replace(/_$/, '');
    const outputCandidates = prefix ? [`${prefix}_out`, `${prefix}out`] : ['out'];
    const output = outputCandidates.find((id) => groups.has(id));
    const inputGroupId = terminal.terminalGroupId;
    if (!inputGroupId || !output) continue;
    poles.push({ id: prefix || 'pole1', inputTerminalGroupId: inputGroupId, outputTerminalGroupId: output });
  }
  return poles;
}

export function breakerPoles(product: Product): BreakerPoleDefinition[] {
  return product.breakerDefinition?.poles.length ? product.breakerDefinition.poles : legacyBreakerPoles(product);
}

export function breakerPoleCount(product: Product): number {
  return product.breakerDefinition?.poleCount ?? Math.max(1, breakerPoles(product).length);
}

export function effectiveBreakerDefinition(product: Product): BreakerDefinition | undefined {
  if (product.productType !== 'breaker') return undefined;
  if (product.breakerDefinition) return product.breakerDefinition;
  const poles = breakerPoles(product);
  const ratingProfiles = breakerRatingProfiles(product);
  if (!poles.length || !ratingProfiles.length) return undefined;
  const poleCount = Math.min(3, Math.max(1, poles.length)) as 1 | 2 | 3;
  return { poleCount, tripLinkage: poleCount > 1 ? 'common' : 'independent', poles, ratingProfiles };
}
