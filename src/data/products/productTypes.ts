// ============================================================
// productTypes.ts — Product type registry
// ============================================================
// Product types define functional electrical behavior.
// The system uses product type (not category) to determine:
//   - which terminals to expect
//   - how to route current
//   - which BOM section to assign
//   - which electrical rules to apply
//
// Adding a new product type:
//   1. Add the string literal to the ProductType union in types/system.ts
//   2. Add a ProductTypeDefinition entry here
//   3. Create product definitions in the appropriate file under products/
// ============================================================

import type { ProductType, ProductCategory } from '../../types/system';

export interface ProductTypeDefinition {
  id: ProductType;
  label: string;
  description: string;
  /** Default part library category for this type. */
  defaultCategory: ProductCategory;
  /** BOM section this type belongs to. */
  bomSection: string;
  /**
   * Whether components of this type are expected to have electrical terminals.
   * Used by validation to warn about terminal-less products.
   */
  requiresTerminals: boolean;
  /**
   * Pass-through types conduct current from one terminal to another
   * (fuses, breakers, busbars). Current propagation logic uses this.
   */
  isPassThrough?: boolean;
}

export const PRODUCT_TYPE_DEFINITIONS: ProductTypeDefinition[] = [
  // --- Energy Storage ---
  {
    id: 'battery',
    label: 'Battery',
    description: 'Electrochemical energy storage device.',
    defaultCategory: 'Batteries',
    bomSection: 'Energy Storage',
    requiresTerminals: true,
  },

  // --- Charging ---
  {
    id: 'mppt',
    label: 'MPPT Charge Controller',
    description: 'Solar charge controller using maximum power point tracking.',
    defaultCategory: 'Charging',
    bomSection: 'Charging Sources',
    requiresTerminals: true,
  },
  {
    id: 'dc_dc_charger',
    label: 'DC-DC Charger',
    description: 'Isolated or non-isolated DC-DC converter used for charging from alternator or another battery.',
    defaultCategory: 'Charging',
    bomSection: 'Charging Sources',
    requiresTerminals: true,
  },
  {
    id: 'shore_charger',
    label: 'Shore Power Charger',
    description: 'AC-powered battery charger connected to shore power.',
    defaultCategory: 'Charging',
    bomSection: 'Charging Sources',
    requiresTerminals: true,
  },

  // --- Power Conversion ---
  {
    id: 'inverter_charger',
    label: 'Inverter / Charger',
    description: 'Combined DC-to-AC inverter and AC-to-DC battery charger.',
    defaultCategory: 'Inverters',
    bomSection: 'Power Conversion',
    requiresTerminals: true,
  },
  {
    id: 'converter',
    label: 'Converter',
    description: 'AC-to-DC power converter (non-charger).',
    defaultCategory: 'Inverters',
    bomSection: 'Power Conversion',
    requiresTerminals: true,
  },

  // --- Solar ---
  {
    id: 'solar_array',
    label: 'Solar Panel',
    description: 'One physical photovoltaic module generating DC power.',
    defaultCategory: 'Solar',
    bomSection: 'Charging Sources',
    requiresTerminals: true,
  },
  {
    id: 'custom_solar_array',
    label: 'Custom Solar Array',
    description: 'Explicit aggregate PV source with user-entered array ratings.',
    defaultCategory: 'Solar',
    bomSection: 'Charging Sources',
    requiresTerminals: true,
  },
  {
    id: 'solar_combiner',
    label: 'Solar Combiner Box',
    description: 'PV string combiner box combining multiple solar strings into one output.',
    defaultCategory: 'Solar',
    bomSection: 'Charging Sources',
    requiresTerminals: true,
    isPassThrough: true,
  },
  {
    id: 'pvCombinerBox',
    label: 'PV Combiner Box',
    description: 'PV combiner box (alias for solar_combiner; preferred new type name).',
    defaultCategory: 'Solar',
    bomSection: 'Charging Sources',
    requiresTerminals: true,
    isPassThrough: true,
  },

  // --- Distribution ---
  {
    id: 'dc_distribution',
    label: 'DC Distribution',
    description: 'DC power distribution panel or Lynx-style distribution module.',
    defaultCategory: 'Distribution',
    bomSection: 'DC Distribution',
    requiresTerminals: true,
    isPassThrough: true,
  },
  {
    id: 'busbar',
    label: 'Busbar',
    description: 'Single-polarity DC busbar for connecting multiple conductors.',
    defaultCategory: 'Distribution',
    bomSection: 'DC Distribution',
    requiresTerminals: true,
    isPassThrough: true,
  },
  {
    id: 'ac_distribution',
    label: 'AC Distribution Panel',
    description: 'AC branch circuit distribution panel.',
    defaultCategory: 'AC Equipment',
    bomSection: 'AC Distribution',
    requiresTerminals: true,
    isPassThrough: true,
  },

  // --- Protection ---
  {
    id: 'fuse',
    label: 'Fuse',
    description: 'Single-use overcurrent protection device.',
    defaultCategory: 'Protection',
    bomSection: 'Protection',
    requiresTerminals: true,
    isPassThrough: true,
  },
  {
    id: 'breaker',
    label: 'Circuit Breaker',
    description: 'Resettable overcurrent protection device.',
    defaultCategory: 'Protection',
    bomSection: 'Protection',
    requiresTerminals: true,
    isPassThrough: true,
  },
  {
    id: 'dcDisconnect',
    label: 'DC Disconnect',
    description: 'Manual or automatic DC disconnect switch.',
    defaultCategory: 'Protection',
    bomSection: 'Protection',
    requiresTerminals: true,
    isPassThrough: true,
  },
  {
    id: 'acDisconnect',
    label: 'AC Disconnect',
    description: 'Manual or automatic AC disconnect switch.',
    defaultCategory: 'Protection',
    bomSection: 'Protection',
    requiresTerminals: true,
    isPassThrough: true,
  },
  {
    id: 'relay',
    label: 'Relay',
    description: 'Electrically controlled switch.',
    defaultCategory: 'Protection',
    bomSection: 'Protection',
    requiresTerminals: true,
    isPassThrough: true,
  },
  {
    id: 'contactor',
    label: 'Contactor',
    description: 'Heavy-duty electrically controlled switch for high-current circuits.',
    defaultCategory: 'Protection',
    bomSection: 'Protection',
    requiresTerminals: true,
    isPassThrough: true,
  },

  // --- AC Equipment ---
  {
    id: 'shorePowerInlet',
    label: 'Shore Power Inlet',
    description: 'AC shore power inlet connector.',
    defaultCategory: 'AC Equipment',
    bomSection: 'AC Distribution',
    requiresTerminals: true,
  },
  {
    id: 'transferSwitch',
    label: 'Transfer Switch',
    description: 'Automatic or manual transfer switch between power sources.',
    defaultCategory: 'AC Equipment',
    bomSection: 'AC Distribution',
    requiresTerminals: true,
    isPassThrough: true,
  },

  // --- Loads ---
  {
    id: 'dc_load',
    label: 'DC Load',
    description: 'Generic or specific DC consuming device.',
    defaultCategory: 'Loads',
    bomSection: 'Accessories',
    requiresTerminals: true,
  },
  {
    id: 'ac_load',
    label: 'AC Load',
    description: 'Generic or specific AC consuming device.',
    defaultCategory: 'Loads',
    bomSection: 'Accessories',
    requiresTerminals: true,
  },

  // --- Monitoring ---
  {
    id: 'monitor',
    label: 'Monitor / Control',
    description: 'Battery monitor, system monitor, or control hub.',
    defaultCategory: 'Monitoring',
    bomSection: 'Monitoring & Control',
    requiresTerminals: false,
  },
  {
    id: 'batteryMonitor',
    label: 'Battery Monitor',
    description: 'Dedicated battery state-of-charge monitor (preferred new type name).',
    defaultCategory: 'Monitoring',
    bomSection: 'Monitoring & Control',
    requiresTerminals: false,
  },
  {
    id: 'commAccessory',
    label: 'Communication Accessory',
    description: 'Communication accessory such as a passive cable, coupler, splitter, or terminator.',
    defaultCategory: 'Communication',
    bomSection: 'Monitoring & Control',
    requiresTerminals: true,
    isPassThrough: true,
  },
  {
    id: 'commGateway',
    label: 'Communication Gateway',
    description: 'Active communication interface or protocol gateway.',
    defaultCategory: 'Communication',
    bomSection: 'Monitoring & Control',
    requiresTerminals: true,
  },

  // --- System Reference Points ---
  {
    id: 'connection_point',
    label: 'Connection Point',
    description: 'Virtual system reference / bonding point such as AC earth or DC chassis ground.',
    defaultCategory: 'Connection Points',
    bomSection: 'Accessories',
    requiresTerminals: true,
  },

  // --- Cables ---
  {
    id: 'cable',
    label: 'Cable',
    description: 'Power or signal cable assembly.',
    defaultCategory: 'Cables',
    bomSection: 'Cabling',
    requiresTerminals: false,
  },

  // --- Accessories ---
  {
    id: 'accessory',
    label: 'Accessory',
    description: 'Miscellaneous accessory or component that does not fit another type.',
    defaultCategory: 'Accessories',
    bomSection: 'Accessories',
    requiresTerminals: false,
  },
];

/** Map of product type ID to definition for fast lookup. */
export const PRODUCT_TYPE_MAP: Map<ProductType, ProductTypeDefinition> = new Map(
  PRODUCT_TYPE_DEFINITIONS.map((d) => [d.id, d])
);

/** Look up a product type definition by ID. */
export function getProductTypeDefinition(id: ProductType): ProductTypeDefinition | undefined {
  return PRODUCT_TYPE_MAP.get(id);
}

/**
 * Human-readable label for a product type.
 * Falls back to the raw ID if no definition is registered.
 */
export function getProductTypeLabel(id: ProductType): string {
  return PRODUCT_TYPE_MAP.get(id)?.label ?? id;
}

/**
 * Whether this product type is a pass-through (fuse, busbar, combiner, etc.).
 * Pass-through products conduct but do not source or consume power.
 */
export function isPassThroughType(id: ProductType): boolean {
  return PRODUCT_TYPE_MAP.get(id)?.isPassThrough ?? false;
}

/**
 * Set of pass-through product type IDs (for use in Set lookups in hot paths).
 * Kept in sync with PRODUCT_TYPE_DEFINITIONS automatically.
 */
export const PASS_THROUGH_PRODUCT_TYPES: Set<ProductType> = new Set(
  PRODUCT_TYPE_DEFINITIONS.filter((d) => d.isPassThrough).map((d) => d.id)
);
