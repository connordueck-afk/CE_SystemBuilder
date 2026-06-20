// ============================================================
// src/data/products/index.ts — Catalog entry point
// ============================================================
// This file is the single entry point for the product catalog.
// Import from here in application code and utilities.
//
// Usage:
//   import { ALL_PRODUCTS, getProduct } from '../data/products';
//   import { getProductsByCategory } from '../data/products/helpers/catalogUtils';
// ============================================================

// --- Product data files ---
export { batteries } from './batteries';
export { mppts } from './mppts';
export { inverterChargers } from './inverterChargers';
export { dcDcChargers } from './dcDcChargers';
export { acChargers } from './acChargers';
export { solarArrays } from './solar';
export { distribution } from './distribution';
export { protection } from './protection';
export { monitoring } from './monitoring';
export { accessories } from './accessories';

// --- Schema definitions ---
export * from './categories';
export * from './productTypes';
export * from './productSchemas';

// --- Helpers ---
export * from './helpers/catalogUtils';
export * from './helpers/validation';

// --- Assembled catalog ---
import { batteries } from './batteries';
import { mppts } from './mppts';
import { inverterChargers } from './inverterChargers';
import { dcDcChargers } from './dcDcChargers';
import { acChargers } from './acChargers';
import { solarArrays } from './solar';
import { distribution } from './distribution';
import { protection } from './protection';
import { monitoring } from './monitoring';
import { accessories } from './accessories';
import type { Product } from '../../types/system';

/**
 * The complete product catalog.
 * This is the authoritative list of all available products.
 */
export const ALL_PRODUCTS: Product[] = [
  ...batteries,
  ...inverterChargers,
  ...mppts,
  ...dcDcChargers,
  ...acChargers,
  ...solarArrays,
  ...distribution,
  ...protection,
  ...monitoring,
  ...accessories,
];

/**
 * Fast product lookup by ID.
 * Built once at module load time.
 */
export const PRODUCT_MAP: Map<string, Product> = new Map(
  ALL_PRODUCTS.map((p) => [p.id, p])
);

/**
 * Look up a product by its ID.
 * Returns undefined if the product is not found.
 */
export function getProduct(id: string): Product | undefined {
  return PRODUCT_MAP.get(id);
}
