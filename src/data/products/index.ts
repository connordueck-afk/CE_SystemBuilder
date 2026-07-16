// Product catalog entry point. Active products live under catalog/<category>/
// and are discovered automatically; inactive products are never loaded.

import type { Product } from '../../types/system';

const modules = import.meta.glob<{ default: Product }>('./catalog/**/*.ts', { eager: true });

export * from './categories';
export * from './productTypes';
export * from './helpers/catalogUtils';
export * from './helpers/validation';
export * from './cableAssemblies';

/** Expand commercial variants while keeping all electrical ratings synchronized. */
function expandVariants(rawProducts: Product[]): Product[] {
  const expanded: Product[] = [];
  for (const product of rawProducts) {
    if (!product.variants?.length) {
      expanded.push(product);
      continue;
    }

    for (const variant of product.variants) {
      const batteryVoltagesV = variant.nominalVoltage == null
        ? undefined
        : Array.isArray(variant.nominalVoltage) ? variant.nominalVoltage : [variant.nominalVoltage];
      const terminals = product.terminals.map((terminal) => ({
        ...terminal,
        ...(product.protectionRatings != null || terminal.maxCurrentA != null
          ? { maxCurrentA: variant.currentRatingA }
          : {}),
      }));
      const ports = product.ports?.map((port) => ({
        ...port,
        ...(product.protectionRatings != null ? { maxCurrentA: variant.currentRatingA } : {}),
        ...(port.maxPowerW != null && variant.continuousPowerW != null
          ? { maxPowerW: variant.continuousPowerW }
          : {}),
      }));
      const terminalGroups = product.terminalGroups?.map((group) => ({
        ...group,
        ...(product.protectionRatings != null ? { maxCurrentA: variant.currentRatingA } : {}),
      }));

      expanded.push({
        ...product,
        id: variant.id,
        name: variant.name ?? `${product.name} ${variant.currentRatingA}A`,
        maxCurrentA: variant.currentRatingA,
        ...(variant.maxPvVoltageV != null ? { maxPvVoltageV: variant.maxPvVoltageV } : {}),
        ...(variant.continuousPowerW != null ? { continuousPowerW: variant.continuousPowerW } : {}),
        ...(variant.nominalVoltage != null ? { nominalVoltage: variant.nominalVoltage } : {}),
        ...(variant.imageUrl != null ? { imageUrl: variant.imageUrl } : {}),
        ...(variant.productUrl != null ? { productUrl: variant.productUrl } : {}),
        msrpUsd: variant.msrpUsd ?? product.msrpUsd,
        oemPriceUsd: variant.oemPriceUsd ?? product.oemPriceUsd,
        ...(variant.partNumber != null ? { partNumber: variant.partNumber } : {}),
        terminals,
        ...(ports != null ? { ports } : {}),
        ...(terminalGroups != null ? { terminalGroups } : {}),
        ...(product.protectionRatings != null
          ? { protectionRatings: { ...product.protectionRatings, currentRatingA: variant.currentRatingA } }
          : {}),
        ...(product.mpptRatings != null
          ? {
              mpptRatings: {
                ...product.mpptRatings,
                ...(variant.maxPvVoltageV != null ? { maxPvVoltageV: variant.maxPvVoltageV } : {}),
                maxPvCurrentA: variant.currentRatingA,
                maxOutputCurrentA: variant.currentRatingA,
                ...(variant.continuousPowerW != null ? { maxPvPowerW: variant.continuousPowerW } : {}),
                ...(batteryVoltagesV != null ? { batteryVoltagesV } : {}),
              },
            }
          : {}),
        variants: undefined,
      });
    }
  }
  return expanded;
}

export const ALL_PRODUCTS: Product[] = expandVariants(Object.values(modules).map((module) => module.default));
export const PRODUCT_MAP: Map<string, Product> = new Map(ALL_PRODUCTS.map((product) => [product.id, product]));

export function getProduct(id: string): Product | undefined {
  return PRODUCT_MAP.get(id);
}
