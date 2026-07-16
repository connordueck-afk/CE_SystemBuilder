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

export function breakerRatingProfiles(product: Product): BreakerRatingProfile[] {
  if (product.productType !== 'breaker') return [];
  return product.breakerDefinition?.ratingProfiles ?? [];
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
  return undefined;
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

export function breakerPoles(product: Product): BreakerPoleDefinition[] {
  return product.breakerDefinition?.poles ?? [];
}

export function breakerPoleCount(product: Product): number {
  return product.breakerDefinition?.poleCount ?? Math.max(1, breakerPoles(product).length);
}

export function effectiveBreakerDefinition(product: Product): BreakerDefinition | undefined {
  if (product.productType !== 'breaker') return undefined;
  return product.breakerDefinition;
}
