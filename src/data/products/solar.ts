// ============================================================
// solar.ts — Solar array and combiner product definitions
// ============================================================
// All existing product IDs, pricing, terminal layouts, and
// combiner generation logic are preserved exactly.
// New fields (solarPanelRatings, solarCombinerRatings,
// dataQuality) are additive.
// ============================================================

import type { Product } from '../../types/system';

// -----------------------------------------------------------
// Solar combiner terminal generator (unchanged logic)
// -----------------------------------------------------------

function solarCombinerTerminals(strings: number): Product['terminals'] {
  const spacing = strings > 1 ? 60 / (strings - 1) : 0;
  const inputs = Array.from({ length: strings }, (_, index) => {
    const y = strings === 1 ? 0 : -30 + spacing * index;
    const label = index + 1;
    return [
      {
        id: `string_${label}_pos`,
        label: `S${label}+`,
        electricalType: 'pv_pos' as const,
        kind: 'pv_power' as const,
        polarity: 'positive' as const,
        role: 'bus' as const,
        voltageClass: 'pv_high_voltage' as const,
        side: 'left' as const,
        offsetX: -70,
        offsetY: y - 4,
        domain: 'pv' as const,
        notes: `String ${label} positive input.`,
      },
      {
        id: `string_${label}_neg`,
        label: `S${label}-`,
        electricalType: 'pv_neg' as const,
        kind: 'pv_power' as const,
        polarity: 'negative' as const,
        role: 'bus' as const,
        voltageClass: 'pv_high_voltage' as const,
        side: 'left' as const,
        offsetX: -70,
        offsetY: y + 4,
        domain: 'pv' as const,
        notes: `String ${label} negative input.`,
      },
    ];
  }).flat();

  return [
    ...inputs,
    {
      id: 'out_pos',
      label: 'Out+',
      electricalType: 'pv_pos',
      kind: 'pv_power',
      polarity: 'positive',
      role: 'bus',
      voltageClass: 'pv_high_voltage',
      side: 'right',
      offsetX: 70,
      offsetY: -10,
      domain: 'pv' as const,
      notes: 'Combined PV positive output to MPPT.',
    },
    {
      id: 'out_neg',
      label: 'Out-',
      electricalType: 'pv_neg',
      kind: 'pv_power',
      polarity: 'negative',
      role: 'bus',
      voltageClass: 'pv_high_voltage',
      side: 'right',
      offsetX: 70,
      offsetY: 10,
      domain: 'pv' as const,
      notes: 'Combined PV negative output to MPPT.',
    },
  ];
}

function solarBranchConnectorSize(branches: number): { width: number; height: number } {
  if (branches === 2) return { width: 70, height: 100 };
  if (branches === 3) return { width: 52, height: 144 };
  return { width: 120, height: 76 };
}

function solarBranchConnectorTerminals(branches: number, width: number, height: number): Product['terminals'] {
  const usableHeight = height * 0.62;
  const spacing = branches > 1 ? usableHeight / (branches - 1) : 0;

  const inputs = Array.from({ length: branches }, (_, index) => {
    const label = index + 1;
    const y = branches === 1 ? 0 : -usableHeight / 2 + spacing * index;
    return {
      id: `in_${label}`,
      label: `In ${label}+`,
      electricalType: 'pv_pos' as const,
      kind: 'pv_power' as const,
      polarity: 'positive' as const,
      role: 'bus' as const,
      voltageClass: 'pv_high_voltage' as const,
      side: 'left' as const,
      offsetX: -width / 2,
      offsetY: y,
      domain: 'pv' as const,
      notes: `PV branch input ${label}. Polarity is selected on the component.`,
    };
  });

  return [
    ...inputs,
    {
      id: 'out',
      label: 'Out+',
      electricalType: 'pv_pos',
      kind: 'pv_power',
      polarity: 'positive',
      role: 'bus',
      voltageClass: 'pv_high_voltage',
      side: 'right',
      offsetX: width / 2,
      offsetY: 0,
      domain: 'pv' as const,
      notes: 'Combined PV branch output. Polarity is selected on the component.',
    },
  ];
}

// -----------------------------------------------------------
// Generic solar combiner boxes
// -----------------------------------------------------------

const solarCombinerBoxes: Product[] = [2, 3, 4, 6].map((strings) => ({
  id: `solar-combiner-${strings}-string`,
  manufacturer: 'Generic',
  name: `Solar Combiner ${strings}-string`,
  productType: 'solar_combiner' as const,
  category: `${strings} strings`,
  maxPvVoltageV: 150,
  maxPvCurrentA: strings * 15,
  msrpUsd: 65 + strings * 28,
  oemPriceUsd: Math.round((65 + strings * 28) * 0.7),
  description: `PV combiner box for ${strings} solar strings with combined positive and negative outputs`,
  source: 'Estimate',
  dataQuality: 'placeholder' as const,
  width: 140,
  height: 100,
  terminals: solarCombinerTerminals(strings),
  solarCombinerRatings: {
    stringCount: strings,
    inputCount: strings * 2,
    outputCount: 2,
    maxVoltageV: 150,
    maxCurrentA: strings * 15,
    includedProtection: 'None (add fuses per string as needed)',
  },
}));

const solarBranchConnectors: Product[] = [2, 3, 4].map((branches) => {
  const { width, height } = solarBranchConnectorSize(branches);
  return {
    id: `solar-branch-${branches}-1`,
    manufacturer: 'Generic',
    name: `${branches}-1 PV Branch Connector`,
    productType: 'solar_combiner' as const,
    category: 'Connectors',
    imageUrl: `/product-images/pv-branch-${branches}-1.svg`,
    maxPvVoltageV: 1000,
    maxPvCurrentA: branches * 15,
    msrpUsd: 18 + branches * 6,
    oemPriceUsd: Math.round((18 + branches * 6) * 0.7),
    description: `${branches}-to-1 PV branch connector for combining ${branches} same-polarity solar conductors. Select PV+ or PV- on the placed component.`,
    source: 'Estimate',
    dataQuality: 'placeholder' as const,
    width,
    height,
    terminals: solarBranchConnectorTerminals(branches, width, height),
    solarCombinerRatings: {
      stringCount: branches,
      inputCount: branches,
      outputCount: 1,
      maxVoltageV: 1000,
      maxCurrentA: branches * 15,
      includedProtection: 'None (branch connector only)',
    },
  };
});

// -----------------------------------------------------------
// Solar arrays and panels
// -----------------------------------------------------------

// Shared output terminal layout for generic array placeholders
const arrayTerminals: Product['terminals'] = [
  {
    id: 'pv_pos',
    label: 'PV+',
    electricalType: 'pv_pos',
    kind: 'pv_power',
    polarity: 'positive',
    role: 'source',
    voltageClass: 'pv_high_voltage',
    side: 'bottom',
    offsetX: 25,
    offsetY: 40,
    domain: 'pv' as const,
    connector: { kind: 'mc4_male' },
    notes: 'PV array positive output.',
  },
  {
    id: 'pv_neg',
    label: 'PV-',
    electricalType: 'pv_neg',
    kind: 'pv_power',
    polarity: 'negative',
    role: 'source',
    voltageClass: 'pv_high_voltage',
    side: 'bottom',
    offsetX: -25,
    offsetY: 40,
    domain: 'pv' as const,
    connector: { kind: 'mc4_female' },
    notes: 'PV array negative output.',
  },
];

export const solarArrays: Product[] = [
  // ----------------------------------------------------------
  // Generic Solar Array 400W
  // ----------------------------------------------------------
  {
    id: 'solar-array-400w',
    manufacturer: 'Generic',
    name: 'Solar Array 400W',
    productType: 'solar_array',
    category: 'Solar',
    continuousPowerW: 400,
    maxPvVoltageV: 40,
    maxPvCurrentA: 10,
    msrpUsd: 320,
    oemPriceUsd: 224,
    description: '400W solar array placeholder (1x 400W panel)',
    source: 'Estimate',
    dataQuality: 'placeholder',
    width: 120,
    height: 80,
    terminals: arrayTerminals,
    solarPanelRatings: {
      vocV: 40,
      vmpV: 34,
      iscA: 12,
      impA: 10,
      powerW: 400,
    },
  },

  // ----------------------------------------------------------
  // Generic Solar Array 800W
  // ----------------------------------------------------------
  {
    id: 'solar-array-800w',
    manufacturer: 'Generic',
    name: 'Solar Array 800W',
    productType: 'solar_array',
    category: 'Solar',
    continuousPowerW: 800,
    maxPvVoltageV: 80,
    maxPvCurrentA: 10,
    msrpUsd: 640,
    oemPriceUsd: 448,
    description: '800W solar array placeholder (2x 400W panels)',
    source: 'Estimate',
    dataQuality: 'placeholder',
    width: 120,
    height: 80,
    terminals: arrayTerminals,
    solarPanelRatings: {
      vocV: 80,
      vmpV: 68,
      iscA: 12,
      impA: 10,
      powerW: 800,
    },
  },

  // ----------------------------------------------------------
  // Generic Solar Array 2000W
  // ----------------------------------------------------------
  {
    id: 'solar-array-2000w',
    manufacturer: 'Generic',
    name: 'Solar Array 2000W',
    productType: 'solar_array',
    category: 'Solar',
    continuousPowerW: 2000,
    maxPvVoltageV: 200,
    maxPvCurrentA: 10,
    msrpUsd: 1600,
    oemPriceUsd: 1120,
    description: '2000W solar array placeholder (5x 400W panels)',
    source: 'Estimate',
    dataQuality: 'placeholder',
    width: 120,
    height: 80,
    terminals: arrayTerminals,
    solarPanelRatings: {
      vocV: 200,
      vmpV: 170,
      iscA: 12,
      impA: 10,
      powerW: 2000,
    },
  },

  // Combiner boxes
  ...solarCombinerBoxes,
  ...solarBranchConnectors,
];
