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
    label: 'A',
    electricalType: 'dc_pos',
    kind: 'dc_power',
    polarity: 'positive',
    role: 'pass_through',
    direction: 'bidirectional',
    voltageClass: 'dc_low_voltage',
    side: 'left',
    offsetX: -40,
    offsetY: 0,
    domain: 'dc',
  },
  {
    id: 'out',
    label: 'B',
    electricalType: 'dc_pos',
    kind: 'dc_power',
    polarity: 'positive',
    role: 'pass_through',
    direction: 'bidirectional',
    voltageClass: 'dc_low_voltage',
    side: 'right',
    offsetX: 40,
    offsetY: 0,
    domain: 'dc',
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
      width: 80,
      height: 34,
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
// Circuit breaker catalog — types and ratings
// -----------------------------------------------------------

const breakerTerminals: Product['terminals'] = fuseTerminals;

const breakerCatalog = [
  {
    type: 'DC Breaker',
    ratings: [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100, 125, 150, 175, 200, 250, 300],
    msrpBase: 20,
    voltageRatingV: 48,
    source: 'Catalog estimate: DC circuit breakers',
  },
  {
    type: 'Smart BatteryProtect',
    ratings: [65, 100, 220],
    msrpBase: 60,
    voltageRatingV: 34,
    source: 'Victron 2025',
  },
] as const;

function breakerId(type: string, rating: number): string {
  return `breaker-${type.toLowerCase().replace(/\s+/g, '-')}-${rating}a`;
}

function breakerPrice(type: string, rating: number, base: number): number {
  const multiplier = type === 'Smart BatteryProtect' ? 0.3 : 0.25;
  return Math.round(base + rating * multiplier);
}

function breakerImageUrl(type: string): string {
  if (type === 'DC Breaker') return '/product-images/breaker-dc-breaker.svg';
  return '/product-images/generic-breaker.svg';
}

const breakers: Product[] = breakerCatalog.flatMap(({ type, ratings, msrpBase, voltageRatingV, source }) =>
  ratings.map((rating) => {
    const msrp = breakerPrice(type, rating, msrpBase);
    return {
      id: breakerId(type, rating),
      manufacturer: 'Generic',
      name: `${type} ${rating}A`,
      productType: 'breaker' as const,
      category: type,
      maxCurrentA: rating,
      msrpUsd: msrp,
      oemPriceUsd: Math.round(msrp * 0.7),
      description: `${type} ${rating}A DC protection`,
      source,
      dataQuality: 'placeholder' as const,
      imageUrl: breakerImageUrl(type),
      width: 80,
      height: 34,
      terminals: breakerTerminals,
      protectionRatings: {
        currentRatingA: rating,
        voltageRatingV,
        acDcCompatibility: 'dc' as const,
        breakerStyle: type,
        protectionType: 'breaker' as const,
      },
    };
  })
);

// -----------------------------------------------------------
// AC DIN rail miniature breakers
// -----------------------------------------------------------

type AcBreakerPoleCount = 1 | 2 | 3;

const acBreakerRatings = [6, 10, 15, 16, 20, 25, 30, 32, 40, 50, 63] as const;

const acBreakerCatalog: Array<{
  poles: AcBreakerPoleCount;
  type: string;
  msrpBase: number;
  voltageRatingV: number;
  imageUrl: string;
  width: number;
  height: number;
}> = [
  {
    poles: 1,
    type: 'AC DIN 1P',
    msrpBase: 12,
    voltageRatingV: 277,
    imageUrl: '/product-images/breaker-ac-din-1p.svg',
    width: 48,
    height: 120,
  },
  {
    poles: 2,
    type: 'AC DIN 2P',
    msrpBase: 24,
    voltageRatingV: 480,
    imageUrl: '/product-images/breaker-ac-din-2p.svg',
    width: 84,
    height: 120,
  },
  {
    poles: 3,
    type: 'AC DIN 3P',
    msrpBase: 36,
    voltageRatingV: 480,
    imageUrl: '/product-images/breaker-ac-din-3p.svg',
    width: 120,
    height: 120,
  },
];

const acBreakerSvgGeometry: Record<AcBreakerPoleCount, {
  viewBoxWidth: number;
  viewBoxHeight: number;
  topScrewY: number;
  bottomScrewY: number;
  screwCentersX: number[];
}> = {
  1: { viewBoxWidth: 160, viewBoxHeight: 360, topScrewY: 55, bottomScrewY: 306, screwCentersX: [80] },
  2: { viewBoxWidth: 260, viewBoxHeight: 360, topScrewY: 55, bottomScrewY: 306, screwCentersX: [91, 169] },
  3: { viewBoxWidth: 360, viewBoxHeight: 360, topScrewY: 58, bottomScrewY: 296, screwCentersX: [98, 180, 262] },
};

function svgPointToProductOffset(
  svgX: number,
  svgY: number,
  geometry: { viewBoxWidth: number; viewBoxHeight: number },
  width: number,
  height: number
): { offsetX: number; offsetY: number } {
  return {
    offsetX: (svgX / geometry.viewBoxWidth - 0.5) * width,
    offsetY: (svgY / geometry.viewBoxHeight - 0.5) * height,
  };
}

function acBreakerTerminals(poles: AcBreakerPoleCount, rating: number, width: number, height: number): Product['terminals'] {
  const geometry = acBreakerSvgGeometry[poles];
  const phases = poles as 1 | 2 | 3;

  return Array.from({ length: poles }, (_, index) => {
    const poleNumber = index + 1;
    const x = geometry.screwCentersX[index];
    const topOffset = svgPointToProductOffset(x, geometry.topScrewY, geometry, width, height);
    const bottomOffset = svgPointToProductOffset(x, geometry.bottomScrewY, geometry, width, height);
    const common = {
      electricalType: 'ac' as const,
      kind: 'ac_power' as const,
      polarity: 'line' as const,
      role: 'pass_through' as const,
      voltageClass: 'ac_120v' as const,
      domain: 'ac' as const,
      phases,
      conductorCount: poles,
      maxCurrentA: rating,
      connector: { kind: 'screw_terminal' as const },
    };

    return [
      {
        id: `l${poleNumber}_in`,
        label: poles === 1 ? 'Line In' : `L${poleNumber} In`,
        ...common,
        direction: 'input' as const,
        side: 'top' as const,
        offsetX: topOffset.offsetX,
        offsetY: topOffset.offsetY,
        notes: `Line-side AC pole ${poleNumber} terminal.`,
      },
      {
        id: `l${poleNumber}_out`,
        label: poles === 1 ? 'Line Out' : `L${poleNumber} Out`,
        ...common,
        direction: 'output' as const,
        side: 'bottom' as const,
        offsetX: bottomOffset.offsetX,
        offsetY: bottomOffset.offsetY,
        notes: `Load-side AC pole ${poleNumber} terminal.`,
      },
    ];
  }).flat();
}

function acBreakerPrice(poles: AcBreakerPoleCount, rating: number, base: number): number {
  return Math.round(base + rating * (0.25 + poles * 0.08));
}

const acBreakers: Product[] = acBreakerCatalog.flatMap(({ poles, type, msrpBase, voltageRatingV, imageUrl, width, height }) =>
  acBreakerRatings.map((rating) => {
    const msrp = acBreakerPrice(poles, rating, msrpBase);
    return {
      id: breakerId(type, rating),
      manufacturer: 'Generic',
      name: `AC DIN Breaker ${poles}P ${rating}A`,
      productType: 'breaker' as const,
      category: type,
      maxCurrentA: rating,
      msrpUsd: msrp,
      oemPriceUsd: Math.round(msrp * 0.7),
      description: `Generic ${poles}-pole AC DIN rail miniature circuit breaker, ${rating}A.`,
      source: 'Catalog estimate: AC DIN rail breakers',
      dataQuality: 'placeholder' as const,
      imageUrl,
      width,
      height,
      terminals: acBreakerTerminals(poles, rating, width, height),
      protectionRatings: {
        currentRatingA: rating,
        voltageRatingV,
        interruptRatingA: 6000,
        acDcCompatibility: 'ac' as const,
        breakerStyle: type,
        protectionType: 'breaker' as const,
      },
    };
  })
);

export const protection: Product[] = [
  ...fuses,
  ...breakers,
  ...acBreakers,

  // ==========================================================
  // Transfer switches and isolation transformers
  // ==========================================================

  {
    id: 'filax-2',
    manufacturer: 'Victron',
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
    manufacturer: 'Victron',
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
    manufacturer: 'Victron',
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
