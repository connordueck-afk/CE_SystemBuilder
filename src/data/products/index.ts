// ============================================================
// src/data/products/index.ts — Catalog entry point
// ============================================================
// Products are one file per product under catalog/<category>/.
// import.meta.glob discovers them automatically — drop a file
// in the right subdirectory and it appears in the catalog.
//
// Usage:
//   import { ALL_PRODUCTS, getProduct } from '../data/products';
//   import { getProductsByCategory } from '../data/products/helpers/catalogUtils';
// ============================================================

import type { Product } from '../../types/system';

// Auto-discover all per-product files
const modules = import.meta.glob<{ default: Product }>(
  './catalog/**/*.ts',
  { eager: true }
);

// --- Schema definitions ---
export * from './categories';
export * from './productTypes';
export * from './productSchemas';

// --- Helpers ---
export * from './helpers/catalogUtils';
export * from './helpers/validation';

// --- Cable assemblies (separate type, not Product[]) ---
export * from './cableAssemblies';

/**
 * Expand variant-based products into individual Product entries.
 * Products without variants pass through unchanged.
 * The base product (with variants) is NOT itself added to the catalog.
 */
function expandVariants(rawProducts: Product[]): Product[] {
  const expanded: Product[] = [];
  for (const product of rawProducts) {
    if (!product.variants?.length) {
      expanded.push(product);
      continue;
    }
    for (const variant of product.variants) {
      // Derive battery voltage array from variant's nominalVoltage if provided
      const batteryVoltagesV = variant.nominalVoltage != null
        ? (Array.isArray(variant.nominalVoltage) ? variant.nominalVoltage : [variant.nominalVoltage])
        : undefined;

      // Update terminal-level maxCurrentA and maxPowerW to match the variant
      const terminals = product.terminals.map(t => ({
        ...t,
        ...(t.maxCurrentA != null ? { maxCurrentA: variant.currentRatingA } : {}),
        ...(t.maxPowerW != null && variant.continuousPowerW != null
          ? { maxPowerW: variant.continuousPowerW }
          : {}),
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
        // Sync protectionRatings.currentRatingA for fuses/breakers
        ...(product.protectionRatings != null ? {
          protectionRatings: { ...product.protectionRatings, currentRatingA: variant.currentRatingA },
        } : {}),
        // Sync mpptRatings for MPPT products — derives all fields from variant
        ...(product.mpptRatings != null ? {
          mpptRatings: {
            ...product.mpptRatings,
            ...(variant.maxPvVoltageV != null ? { maxPvVoltageV: variant.maxPvVoltageV } : {}),
            maxPvCurrentA: variant.currentRatingA,
            maxOutputCurrentA: variant.currentRatingA,
            ...(variant.continuousPowerW != null ? { maxPvPowerW: variant.continuousPowerW } : {}),
            ...(batteryVoltagesV != null ? { batteryVoltagesV } : {}),
          },
        } : {}),
        variants: undefined,
      });
    }
  }
  return expanded;
}

/**
 * The complete product catalog.
 * This is the authoritative list of all available products.
 */
export const ALL_PRODUCTS: Product[] = expandVariants(
  Object.values(modules).map(m => m.default)
);

/**
 * Fast product lookup by ID.
 * Built once at module load time.
 */
export const PRODUCT_MAP: Map<string, Product> = new Map(
  ALL_PRODUCTS.map(p => [p.id, p])
);

/**
 * Look up a product by its ID.
 * Returns undefined if the product is not found.
 */
export function getProduct(id: string): Product | undefined {
  return PRODUCT_MAP.get(id);
}
