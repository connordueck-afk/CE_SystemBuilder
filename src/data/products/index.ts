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
 * The complete product catalog.
 * This is the authoritative list of all available products.
 */
export const ALL_PRODUCTS: Product[] = Object.values(modules).map(m => m.default);

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
