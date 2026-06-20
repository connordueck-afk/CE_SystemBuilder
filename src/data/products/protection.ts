// ============================================================
// protection.ts — Fuse and circuit breaker product definitions
// ============================================================
// All existing product IDs, pricing, terminal layouts, and
// catalog generation logic are preserved exactly.
// New fields (protectionRatings, dataQuality) are additive.
// ============================================================

import type { Product } from '../../types/system';

// -----------------------------------------------------------
// Shared terminals for all fuse / breaker products
// Pass-through: current flows in through 'in', out through 'out'.
// -----------------------------------------------------------

const fuseTerminals: Product['terminals'] = [
  {
    id: 'in',
    label: 'In',
    electricalType: 'dc_pos',
    kind: 'dc_power',
    polarity: 'positive',
    role: 'pass_through',
    direction: 'input',
    voltageClass: 'dc_low_voltage',
    side: 'left',
    offsetX: -30,
    offsetY: 0,
    domain: 'dc',
    notes: 'Source-side positive terminal.',
  },
  {
    id: 'out',
    label: 'Out',
    electricalType: 'dc_pos',
    kind: 'dc_power',
    polarity: 'positive',
    role: 'pass_through',
    direction: 'output',
    voltageClass: 'dc_low_voltage',
    side: 'right',
    offsetX: 30,
    offsetY: 0,
    domain: 'dc',
    notes: 'Load-side positive terminal.',
  },
];

// -----------------------------------------------------------
// Fuse catalog — ratings and pricing (same logic as before)
// -----------------------------------------------------------

const fuseCatalog = [
  {
    type: 'MIDI',
    ratings: [30, 40, 50, 60, 70, 80, 100, 125, 150, 175, 200],
    msrpBase: 10,
    source: 'Catalog scrape: MIDI/AMI fuse ranges',
  },
  {
    type: 'MEGA',
    ratings: [60, 80, 100, 125, 150, 175, 200, 225, 250, 300, 400, 500],
    msrpBase: 12,
    source: 'Catalog scrape: MEGA fuse ranges',
  },
  {
    type: 'ANL',
    ratings: [35, 40, 50, 60, 80, 100, 130, 150, 175, 200, 225, 250, 300, 325, 350, 400, 500, 600, 750],
    msrpBase: 16,
    source: 'Catalog scrape: ANL fuse ranges',
  },
  {
    type: 'Class T',
    ratings: [110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600],
    msrpBase: 38,
    source: 'Catalog scrape: Class T fuse ranges',
  },
  {
    type: 'MRBF',
    ratings: [30, 40, 50, 60, 75, 80, 100, 125, 150, 175, 200, 225, 250, 300],
    msrpBase: 18,
    source: 'Catalog scrape: MRBF terminal fuse ranges',
  },
] as const;

function fuseId(type: string, rating: number): string {
  return `fuse-${type.toLowerCase().replace(/\s+/g, '-')}-${rating}a`;
}

function fusePrice(type: string, rating: number, base: number): number {
  const multiplier = type === 'Class T' ? 0.055 : rating >= 400 ? 0.05 : 0.025;
  return Math.round(base + rating * multiplier);
}

// Interrupt rating estimates by fuse type
function fuseInterruptRating(type: string): number | undefined {
  switch (type) {
    case 'Class T': return 20000;
    case 'ANL':     return 6000;
    case 'MEGA':    return 2000;
    case 'MIDI':    return 2000;
    case 'MRBF':    return 2000;
    default:        return undefined;
  }
}

function fuseImageUrl(type: string): string {
  return `/product-images/fuse-${type.toLowerCase().replace(/\s+/g, '-')}.svg`;
}

const fuses: Product[] = fuseCatalog.flatMap(({ type, ratings, msrpBase, source }) =>
  ratings.map((rating) => {
    const msrp = fusePrice(type, rating, msrpBase);
    return {
      id: fuseId(type, rating),
      manufacturer: 'Generic',
      name: `${type} Fuse ${rating}A`,
      productType: 'fuse' as const,
      category: type,
      maxCurrentA: rating,
      msrpUsd: msrp,
      oemPriceUsd: Math.round(msrp * 0.7),
      description: `${type} fuse, ${rating}A DC protection`,
      source,
      dataQuality: 'placeholder' as const,
      imageUrl: fuseImageUrl(type),
      width: 60,
      height: 30,
      terminals: fuseTerminals,
      protectionRatings: {
        currentRatingA: rating,
        voltageRatingV: 58,
        interruptRatingA: fuseInterruptRating(type),
        acDcCompatibility: 'dc' as const,
        fuseStyle: type,
        protectionType: 'fuse' as const,
      },
    };
  })
);

// -----------------------------------------------------------
// Circuit breakers
// -----------------------------------------------------------

const breakerTerminals: Product['terminals'] = fuseTerminals;

export const protection: Product[] = [
  ...fuses,

  // ----------------------------------------------------------
  // Blue Sea 60A DC Circuit Breaker
  // ----------------------------------------------------------
  {
    id: 'breaker-dc-60a',
    manufacturer: 'Blue Sea',
    name: 'Circuit Breaker 60A DC',
    productType: 'breaker',
    category: 'Protection',
    maxCurrentA: 60,
    msrpUsd: 45,
    oemPriceUsd: 32,
    description: 'Blue Sea 60A DC circuit breaker - branch protection',
    productUrl: 'https://www.bluesea.com/products/breakers',
    source: 'Blue Sea 2024',
    dataQuality: 'partial',
    width: 60,
    height: 30,
    terminals: breakerTerminals,
    protectionRatings: {
      currentRatingA: 60,
      voltageRatingV: 48,
      acDcCompatibility: 'dc',
      protectionType: 'breaker',
    },
  },

  // ----------------------------------------------------------
  // Blue Sea 100A DC Circuit Breaker
  // ----------------------------------------------------------
  {
    id: 'breaker-dc-100a',
    manufacturer: 'Blue Sea',
    name: 'Circuit Breaker 100A DC',
    productType: 'breaker',
    category: 'Protection',
    maxCurrentA: 100,
    msrpUsd: 59,
    oemPriceUsd: 41,
    description: 'Blue Sea 100A DC circuit breaker',
    productUrl: 'https://www.bluesea.com/products/breakers',
    source: 'Blue Sea 2024',
    dataQuality: 'partial',
    width: 60,
    height: 30,
    terminals: breakerTerminals,
    protectionRatings: {
      currentRatingA: 100,
      voltageRatingV: 48,
      acDcCompatibility: 'dc',
      protectionType: 'breaker',
    },
  },

  // ==========================================================
  // Smart BatteryProtect — low-power load disconnect
  // ==========================================================

  {
    id: 'batteryprotect-65',
    manufacturer: 'Victron Energy',
    name: 'Smart BatteryProtect 12/24V 65A',
    productType: 'breaker',
    category: 'Protection',
    nominalVoltage: [12, 24],
    maxCurrentA: 65,
    msrpUsd: 66,
    description: 'Victron Smart BatteryProtect 65A — low-voltage load disconnect with Bluetooth. Protects battery from deep discharge.',
    partNumber: 'BPR065012000',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 60,
    height: 30,
    terminals: fuseTerminals,
    protectionRatings: {
      currentRatingA: 65,
      voltageRatingV: 34,
      acDcCompatibility: 'dc',
      protectionType: 'breaker',
    },
  },
  {
    id: 'batteryprotect-100',
    manufacturer: 'Victron Energy',
    name: 'Smart BatteryProtect 12/24V 100A',
    productType: 'breaker',
    category: 'Protection',
    nominalVoltage: [12, 24],
    maxCurrentA: 100,
    msrpUsd: 87,
    description: 'Victron Smart BatteryProtect 100A — low-voltage load disconnect with Bluetooth.',
    partNumber: 'BPR100012000',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 60,
    height: 30,
    terminals: fuseTerminals,
    protectionRatings: {
      currentRatingA: 100,
      voltageRatingV: 34,
      acDcCompatibility: 'dc',
      protectionType: 'breaker',
    },
  },
  {
    id: 'batteryprotect-220',
    manufacturer: 'Victron Energy',
    name: 'Smart BatteryProtect 12/24V 220A',
    productType: 'breaker',
    category: 'Protection',
    nominalVoltage: [12, 24],
    maxCurrentA: 220,
    msrpUsd: 130,
    description: 'Victron Smart BatteryProtect 220A — low-voltage load disconnect with Bluetooth.',
    partNumber: 'BPR220012000',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 60,
    height: 30,
    terminals: fuseTerminals,
    protectionRatings: {
      currentRatingA: 220,
      voltageRatingV: 34,
      acDcCompatibility: 'dc',
      protectionType: 'breaker',
    },
  },

  // ==========================================================
  // Transfer switches and isolation transformers
  // ==========================================================

  {
    id: 'filax-2',
    manufacturer: 'Victron Energy',
    name: 'Filax 2 Transfer Switch',
    productType: 'transferSwitch',
    category: 'Protection',
    msrpUsd: 316,
    description: 'Victron Filax 2 — ultra-fast (<20ms) automatic transfer switch for shore power / generator changeover.',
    partNumber: 'FIL000020000',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 80,
    height: 60,
    terminals: [
      { id: 'ac_in_1_l',  label: 'In1 L',  electricalType: 'ac', kind: 'ac_power', polarity: 'line',    role: 'sink',   voltageClass: 'ac_120v', side: 'left',  offsetX: -40, offsetY: -20, domain: 'ac' },
      { id: 'ac_in_1_n',  label: 'In1 N',  electricalType: 'ac', kind: 'ac_power', polarity: 'neutral', role: 'sink',   voltageClass: 'ac_120v', side: 'left',  offsetX: -40, offsetY: 0,   domain: 'ac' },
      { id: 'ac_in_2_l',  label: 'In2 L',  electricalType: 'ac', kind: 'ac_power', polarity: 'line',    role: 'sink',   voltageClass: 'ac_120v', side: 'left',  offsetX: -40, offsetY: 20,  domain: 'ac' },
      { id: 'ac_out_l',   label: 'Out L',  electricalType: 'ac', kind: 'ac_power', polarity: 'line',    role: 'source', voltageClass: 'ac_120v', side: 'right', offsetX: 40,  offsetY: -10, domain: 'ac' },
      { id: 'ac_out_n',   label: 'Out N',  electricalType: 'ac', kind: 'ac_power', polarity: 'neutral', role: 'source', voltageClass: 'ac_120v', side: 'right', offsetX: 40,  offsetY: 10,  domain: 'ac' },
    ],
  },
  {
    id: 've-transfer-switch-5kva',
    manufacturer: 'Victron Energy',
    name: 'VE Transfer Switch 5 kVA',
    productType: 'transferSwitch',
    category: 'Protection',
    continuousPowerW: 5000,
    msrpUsd: 378,
    description: 'Victron VE Transfer Switch 5 kVA — for use with MultiPlus/Quattro systems to add a second AC input.',
    partNumber: 'VTS000005000',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 80,
    height: 60,
    terminals: [
      { id: 'ac_in_l',  label: 'In L',  electricalType: 'ac', kind: 'ac_power', polarity: 'line',    role: 'sink',   voltageClass: 'ac_120v', side: 'left',  offsetX: -40, offsetY: -10, domain: 'ac' },
      { id: 'ac_in_n',  label: 'In N',  electricalType: 'ac', kind: 'ac_power', polarity: 'neutral', role: 'sink',   voltageClass: 'ac_120v', side: 'left',  offsetX: -40, offsetY: 10,  domain: 'ac' },
      { id: 'ac_out_l', label: 'Out L', electricalType: 'ac', kind: 'ac_power', polarity: 'line',    role: 'source', voltageClass: 'ac_120v', side: 'right', offsetX: 40,  offsetY: -10, domain: 'ac' },
      { id: 'ac_out_n', label: 'Out N', electricalType: 'ac', kind: 'ac_power', polarity: 'neutral', role: 'source', voltageClass: 'ac_120v', side: 'right', offsetX: 40,  offsetY: 10,  domain: 'ac' },
    ],
  },
  {
    id: 'isolation-transformer-3600',
    manufacturer: 'Victron Energy',
    name: 'Isolation Transformer 3600W',
    productType: 'transferSwitch',
    category: 'Protection',
    continuousPowerW: 3600,
    msrpUsd: 731,
    description: 'Victron Isolation Transformer 3600W — galvanic isolation for shore power, eliminates stray currents.',
    partNumber: 'ITR000003600',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 80,
    height: 60,
    terminals: [
      { id: 'ac_in_l',  label: 'In L',  electricalType: 'ac', kind: 'ac_power', polarity: 'line',    role: 'sink',   voltageClass: 'ac_120v', side: 'left',  offsetX: -40, offsetY: -10, domain: 'ac' },
      { id: 'ac_in_n',  label: 'In N',  electricalType: 'ac', kind: 'ac_power', polarity: 'neutral', role: 'sink',   voltageClass: 'ac_120v', side: 'left',  offsetX: -40, offsetY: 10,  domain: 'ac' },
      { id: 'ac_out_l', label: 'Out L', electricalType: 'ac', kind: 'ac_power', polarity: 'line',    role: 'source', voltageClass: 'ac_120v', side: 'right', offsetX: 40,  offsetY: -10, domain: 'ac' },
      { id: 'ac_out_n', label: 'Out N', electricalType: 'ac', kind: 'ac_power', polarity: 'neutral', role: 'source', voltageClass: 'ac_120v', side: 'right', offsetX: 40,  offsetY: 10,  domain: 'ac' },
    ],
  },
];
