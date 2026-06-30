// ============================================================
// src/data/products.ts — Top-level product catalog re-export
// ============================================================
// This file is the import target for all existing application
// code (App.tsx, bomCalculations.ts, etc.).
//
// It re-exports everything from the new catalog index so that
// all existing imports continue to work without any changes.
//
// The canonical catalog source is: src/data/products/index.ts
// ============================================================

export {
  ALL_PRODUCTS,
  PRODUCT_MAP,
  getProduct,
} from './products/index';

import type { Product, ProductType } from '../types/system';
import { ALL_PRODUCTS } from './products/index';

// -----------------------------------------------------------
// Backward-compatible exports
// These constants existed in the old products.ts and are
// preserved here for any code that imports from this file.
// -----------------------------------------------------------

/**
 * Human-readable labels for product types.
 * Kept as a flat Record for backward compatibility.
 * For new code prefer getProductTypeLabel() from products/productTypes.ts.
 */
export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  battery:          'Battery',
  inverter_charger: 'Inverter / Charger',
  mppt:             'MPPT Charge Controller',
  solar_array:      'Solar Panel',
  custom_solar_array: 'Custom Solar Array',
  solar_combiner:   'Solar Combiner',
  dc_distribution:  'DC Distribution',
  busbar:           'Busbar',
  dc_dc_charger:    'DC-DC Charger',
  shore_charger:    'Shore Charger',
  ac_distribution:  'AC Distribution',
  dc_load:          'DC Load',
  ac_load:          'AC Load',
  fuse:             'Fuse',
  breaker:          'Breaker',
  cable:            'Cable',
  monitor:          'Monitor / Control',
  accessory:        'Accessory',
  // New types added in catalog refactor
  pvCombinerBox:    'PV Combiner Box',
  transferSwitch:   'Transfer Switch',
  dcDisconnect:     'DC Disconnect',
  acDisconnect:     'AC Disconnect',
  relay:            'Relay',
  contactor:        'Contactor',
  converter:        'Converter',
  batteryMonitor:   'Battery Monitor',
  shorePowerInlet:  'Shore Power Inlet',
};

/** Sorted list of unique manufacturer names in the catalog. */
export const ALL_MANUFACTURERS: string[] = [
  ...new Set(ALL_PRODUCTS.map((p: Product) => p.manufacturer)),
].sort();

/** Sorted list of unique product type IDs in the catalog. */
export const ALL_PRODUCT_TYPES: ProductType[] = [
  ...new Set(ALL_PRODUCTS.map((p: Product) => p.productType)),
].sort() as ProductType[];
