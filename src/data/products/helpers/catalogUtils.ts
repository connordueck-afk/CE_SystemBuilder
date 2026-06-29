// ============================================================
// catalogUtils.ts — Compatibility adapters and catalog utilities
// ============================================================
// These helpers provide a stable API for reading product data
// regardless of whether a product uses old flat fields or new
// structured rating fields.
//
// Use these helpers instead of accessing product fields directly
// wherever the UI or calculations need product metadata.
//
// This avoids scattering compatibility logic throughout the UI.
// ============================================================

import type {
  Product,
  ProductType,
  TerminalDefinition,
  NominalVoltage,
  ProductCategory,
} from '../../../types/system';
import { getProductTypeDefinition } from '../productTypes';

// -----------------------------------------------------------
// Identity helpers
// -----------------------------------------------------------

/** Returns the display name for a product. */
export function getProductDisplayName(product: Product): string {
  return product.name;
}

/** Returns the manufacturer name. */
export function getProductManufacturer(product: Product): string {
  return product.manufacturer;
}

/** Returns the product type. */
export function getProductType(product: Product): ProductType {
  return product.productType;
}

/**
 * Returns the product's category for UI grouping.
 * Falls back to the product type's default category if no category is set.
 */
export function getProductCategory(product: Product): ProductCategory {
  if (product.category) return product.category;
  const typeDef = getProductTypeDefinition(product.productType);
  return typeDef?.defaultCategory ?? 'Accessories';
}

// -----------------------------------------------------------
// Pricing helpers
// -----------------------------------------------------------

/**
 * Returns the MSRP for a product in USD.
 * Resolves from msrpUsd (flat field) or pricing.msrp.
 * Returns null if no price is available.
 */
export function getProductMsrpUsd(product: Product): number | null {
  if (product.msrpUsd != null) return product.msrpUsd;
  if (product.pricing?.msrp != null) {
    // If pricing is in a non-USD currency, return as-is with a note.
    // Full currency conversion is out of scope here.
    return product.pricing.msrp;
  }
  return null;
}

/**
 * Returns the OEM/dealer price for a product in USD.
 * Returns null if no price is available.
 */
export function getProductOemPriceUsd(product: Product): number | null {
  return product.oemPriceUsd ?? null;
}

/**
 * Returns the effective unit price for BOM calculations.
 * Prefers msrpUsd; falls back to pricing.msrp.
 */
export function getProductPrice(product: Product): number | null {
  return getProductMsrpUsd(product);
}

// -----------------------------------------------------------
// Electrical helpers
// -----------------------------------------------------------

/**
 * Returns the nominal voltage(s) the product supports.
 * Always returns an array (even for single-voltage products).
 */
export function getProductVoltages(product: Product): NominalVoltage[] {
  if (product.nominalVoltage == null) return [];
  return Array.isArray(product.nominalVoltage) ? product.nominalVoltage : [product.nominalVoltage];
}

/**
 * Returns true if the product is compatible with the given system voltage.
 * Products with no nominalVoltage are considered voltage-agnostic (compatible).
 */
export function isVoltageCompatible(product: Product, systemVoltage: NominalVoltage): boolean {
  const voltages = getProductVoltages(product);
  if (voltages.length === 0) return true;
  return voltages.includes(systemVoltage);
}

/**
 * Returns the maximum continuous current rating for a product.
 * Resolves from:
 *   1. maxCurrentA (flat field — used by calculations today)
 *   2. Type-specific ratings where applicable
 * Returns null if unknown.
 */
export function getProductMaxCurrentA(product: Product): number | null {
  if (product.maxCurrentA != null) return product.maxCurrentA;
  if (product.mpptRatings?.maxOutputCurrentA != null) return product.mpptRatings.maxOutputCurrentA;
  if (product.batteryRatings?.maxDischargeCurrentA != null) return product.batteryRatings.maxDischargeCurrentA;
  if (product.protectionRatings?.currentRatingA != null) return product.protectionRatings.currentRatingA;
  if (product.busbarRatings?.currentRatingA != null) return product.busbarRatings.currentRatingA;
  if (product.dcDcChargerRatings?.outputCurrentA != null) return product.dcDcChargerRatings.outputCurrentA;
  return null;
}

/**
 * Returns the continuous power rating for a product (W).
 * Resolves from continuousPowerW or type-specific ratings.
 */
export function getProductContinuousPowerW(product: Product): number | null {
  if (product.continuousPowerW != null) return product.continuousPowerW;
  if (product.inverterChargerRatings?.continuousInverterW != null) {
    return product.inverterChargerRatings.continuousInverterW;
  }
  if (product.mpptRatings?.maxPvPowerW != null) return product.mpptRatings.maxPvPowerW;
  if (product.mpptRatings?.maxPvPowerByVoltageW != null) {
    // No voltage context here; report the highest-voltage rating as representative.
    const vals = Object.values(product.mpptRatings.maxPvPowerByVoltageW).filter((v): v is number => v != null);
    if (vals.length) return Math.max(...vals);
  }
  if (product.solarPanelRatings?.powerW != null) return product.solarPanelRatings.powerW;
  if (product.loadRatings?.powerW != null) return product.loadRatings.powerW;
  if (product.dcDcChargerRatings?.outputPowerW != null) return product.dcDcChargerRatings.outputPowerW;
  return null;
}

/**
 * Returns the energy capacity of a battery product (Wh).
 * Returns null for non-battery products.
 */
export function getProductCapacityWh(product: Product): number | null {
  if (product.capacityWh != null) return product.capacityWh;
  if (product.batteryRatings?.capacityWh != null) return product.batteryRatings.capacityWh;
  return null;
}

// -----------------------------------------------------------
// Terminal helpers
// -----------------------------------------------------------

/**
 * Returns all terminal definitions for a product.
 * For generic busbars, the caller should use getEffectiveTerminals()
 * from effectiveTerminals.ts (which applies polarity assignment).
 */
export function getProductTerminals(product: Product): TerminalDefinition[] {
  return product.terminals;
}

/**
 * Returns a single terminal by ID, or undefined if not found.
 */
export function getProductTerminal(product: Product, terminalId: string): TerminalDefinition | undefined {
  return product.terminals.find((t) => t.id === terminalId);
}

// -----------------------------------------------------------
// Catalog query helpers
// -----------------------------------------------------------

/**
 * Returns all products in the catalog that match a given category.
 * Matches on product.category and falls back to default category for the type.
 */
export function getProductsByCategory(
  products: Product[],
  category: ProductCategory
): Product[] {
  return products.filter((p) => getProductCategory(p) === category);
}

/**
 * Returns all products in the catalog that match a given product type.
 */
export function getProductsByType(
  products: Product[],
  type: ProductType
): Product[] {
  return products.filter((p) => p.productType === type);
}

/**
 * Returns all products from a given manufacturer.
 */
export function getProductsByManufacturer(
  products: Product[],
  manufacturer: string
): Product[] {
  return products.filter((p) => p.manufacturer === manufacturer);
}

/**
 * Returns all products compatible with a given system voltage.
 */
export function getProductsByVoltage(
  products: Product[],
  voltage: NominalVoltage
): Product[] {
  return products.filter((p) => isVoltageCompatible(p, voltage));
}

/**
 * Returns unique manufacturers from a product list, sorted alphabetically.
 */
export function getManufacturers(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.manufacturer))].sort();
}

/**
 * Returns unique product types from a product list, sorted alphabetically.
 */
export function getProductTypes(products: Product[]): ProductType[] {
  return [...new Set(products.map((p) => p.productType))].sort() as ProductType[];
}

/**
 * Returns the BOM section string for a product.
 * Delegates to the product type registry; falls back to 'Accessories'.
 */
export function getBomSection(product: Product): string {
  const typeDef = getProductTypeDefinition(product.productType);
  return typeDef?.bomSection ?? 'Accessories';
}
