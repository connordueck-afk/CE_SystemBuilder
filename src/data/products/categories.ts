// ============================================================
// categories.ts — Product category definitions
// ============================================================
// Categories are used for UI organization and part library grouping.
// They do NOT drive electrical behavior — product type does that.
// Add new categories here as needed; no other file requires changes.
// ============================================================

import type { ProductCategory } from '../../types/system';

export interface CategoryDefinition {
  id: ProductCategory;
  label: string;
  description: string;
  /** Suggested display order in the part library. */
  sortOrder: number;
  /** Icon name or identifier for the part library UI. */
  icon?: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'Batteries',
    label: 'Batteries',
    description: 'Energy storage: lithium, AGM, gel, and other battery types.',
    sortOrder: 1,
  },
  {
    id: 'Solar',
    label: 'Solar',
    description: 'Solar panels, arrays, and PV combiner boxes.',
    sortOrder: 2,
  },
  {
    id: 'Charging',
    label: 'Charging',
    description: 'MPPT charge controllers, DC-DC chargers, and shore power chargers.',
    sortOrder: 3,
  },
  {
    id: 'Inverters',
    label: 'Inverters',
    description: 'Inverters and inverter/charger combo units.',
    sortOrder: 4,
  },
  {
    id: 'Distribution',
    label: 'Distribution',
    description: 'DC and AC distribution panels, busbars, and combiners.',
    sortOrder: 5,
  },
  {
    id: 'Protection',
    label: 'Protection',
    description: 'Fuses, circuit breakers, disconnects, and overcurrent protection.',
    sortOrder: 6,
  },
  {
    id: 'AC Equipment',
    label: 'AC Equipment',
    description: 'Shore power inlets, transfer switches, and AC distribution panels.',
    sortOrder: 7,
  },
  {
    id: 'Loads',
    label: 'Loads',
    description: 'DC loads, AC loads, and other consuming devices.',
    sortOrder: 8,
  },
  {
    id: 'Monitoring',
    label: 'Monitoring',
    description: 'Battery monitors, system monitors, and control hubs.',
    sortOrder: 9,
  },
  {
    id: 'Cables',
    label: 'Cables',
    description: 'Power cables, signal cables, and cable assemblies.',
    sortOrder: 10,
  },
  {
    id: 'Accessories',
    label: 'Accessories',
    description: 'Miscellaneous accessories, adapters, and generic placeholders.',
    sortOrder: 11,
  },
];

/** Look up a category definition by its ID. */
export function getCategoryDefinition(id: ProductCategory): CategoryDefinition | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

/** All category IDs in display order. */
export const CATEGORY_IDS: ProductCategory[] = CATEGORIES
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((c) => c.id);
