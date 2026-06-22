// ============================================================
// distribution.ts — DC distribution and busbar product definitions
// ============================================================
// All existing product IDs, pricing, terminal layouts, and
// busbar generation logic are preserved exactly.
// New fields (busbarRatings, dataQuality, productUrl) are additive.
// ============================================================

import type { Product } from '../../types/system';

// -----------------------------------------------------------
// Generic busbar terminal generator (unchanged logic)
// -----------------------------------------------------------

function busbarTerminals(points: number): Product['terminals'] {
  const width = Math.max(140, 28 + points * 18);
  const inset = 18;
  const usableWidth = width - inset * 2;
  const spacing = points > 1 ? usableWidth / (points - 1) : 0;

  return Array.from({ length: points }, (_, index) => {
    const label = index + 1;
    const x = points === 1 ? 0 : -usableWidth / 2 + spacing * index;

    const terminal: Product['terminals'][number] = {
      id: `terminal_${label}`,
      label: `T${label}`,
      electricalType: 'generic',
      kind: 'generic',
      role: 'bus',
      side: 'bottom',
      offsetX: x,
      offsetY: 30,
      // domain will be resolved at runtime via effectiveTerminals
      // (polarity is set by component.busPolarity assignment)
      notes: 'Bus connection point. Polarity determined by component busPolarity assignment.',
    };

    return terminal;
  });
}

// -----------------------------------------------------------
// Generic busbars (2, 4, 5, 6, 7, 8 point)
// -----------------------------------------------------------

const genericBusbars: Product[] = [2, 4, 5, 6, 7, 8].map((points) => {
  const basePrice = 29 + points * 8;
  const width = Math.max(140, 28 + points * 18);
  const maxCurrentA = points <= 4 ? 400 : 600;
  return {
    id: points === 4 ? 'dist-generic-busbar' : `dist-generic-busbar-${points}pt`,
    manufacturer: 'Generic',
    name: `Generic Busbar ${points}-point`,
    productType: 'busbar' as const,
    category: `${points} connection points`,
    nominalVoltage: [12, 24, 48] as Product['nominalVoltage'],
    maxCurrentA,
    msrpUsd: basePrice,
    oemPriceUsd: Math.round(basePrice * 0.7),
    description: `Single-conductor DC busbar with ${points} connection points. Set the bus assignment on the placed component.`,
    source: 'Estimate',
    dataQuality: 'placeholder' as const,
    width,
    height: 80,
    terminals: busbarTerminals(points),
    busbarRatings: {
      currentRatingA: maxCurrentA,
      connectionCount: points,
      // busDesignation is determined at runtime by component.busPolarity
    },
  };
});

// -----------------------------------------------------------
// Named distribution products
// -----------------------------------------------------------

export const distribution: Product[] = [
  // ----------------------------------------------------------
  // Victron Lynx Distributor
  // ----------------------------------------------------------
  {
    id: 'dist-vic-lynx-distributor',
    manufacturer: 'Victron',
    name: 'Lynx Distributor',
    productType: 'dc_distribution',
    category: 'Distribution',
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 1000,
    msrpUsd: 349,
    oemPriceUsd: 244,
    description: 'Victron Lynx Distributor - 4-way DC busbar with fuse holders',
    partNumber: 'LYN060102000',
    productUrl: 'https://www.cdnrg.com/products/velyn060102000',
    source: 'Victron 2024',
    dataQuality: 'partial',
    width: 160,
    height: 140,
    terminals: [
      {
        id: 'main_pos',
        label: 'Main+',
        electricalType: 'dc_pos',
        kind: 'dc_power',
        polarity: 'positive',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'left',
        offsetX: -80,
        offsetY: -45,
        domain: 'dc',
        notes: 'Main positive bus input from battery.',
      },
      {
        id: 'main_neg',
        label: 'Main-',
        electricalType: 'dc_neg',
        kind: 'dc_power',
        polarity: 'negative',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'left',
        offsetX: -80,
        offsetY: 45,
        domain: 'dc',
        notes: 'Main negative bus input from battery.',
      },
      {
        id: 'out_pos_1',
        label: 'Out1+',
        electricalType: 'dc_pos',
        kind: 'dc_power',
        polarity: 'positive',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'right',
        offsetX: 80,
        offsetY: -55,
        domain: 'dc',
        requiresOvercurrentProtection: true,
        notes: 'Output 1 positive. Includes built-in MEGA fuse holder.',
      },
      {
        id: 'out_neg_1',
        label: 'Out1-',
        electricalType: 'dc_neg',
        kind: 'dc_power',
        polarity: 'negative',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'right',
        offsetX: 80,
        offsetY: -37,
        domain: 'dc',
        notes: 'Output 1 negative.',
      },
      {
        id: 'out_pos_2',
        label: 'Out2+',
        electricalType: 'dc_pos',
        kind: 'dc_power',
        polarity: 'positive',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'right',
        offsetX: 80,
        offsetY: -12,
        domain: 'dc',
        requiresOvercurrentProtection: true,
        notes: 'Output 2 positive. Includes built-in MEGA fuse holder.',
      },
      {
        id: 'out_neg_2',
        label: 'Out2-',
        electricalType: 'dc_neg',
        kind: 'dc_power',
        polarity: 'negative',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'right',
        offsetX: 80,
        offsetY: 6,
        domain: 'dc',
        notes: 'Output 2 negative.',
      },
      {
        id: 'out_pos_3',
        label: 'Out3+',
        electricalType: 'dc_pos',
        kind: 'dc_power',
        polarity: 'positive',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'right',
        offsetX: 80,
        offsetY: 31,
        domain: 'dc',
        requiresOvercurrentProtection: true,
        notes: 'Output 3 positive. Includes built-in MEGA fuse holder.',
      },
      {
        id: 'out_neg_3',
        label: 'Out3-',
        electricalType: 'dc_neg',
        kind: 'dc_power',
        polarity: 'negative',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'right',
        offsetX: 80,
        offsetY: 49,
        domain: 'dc',
        notes: 'Output 3 negative.',
      },
      {
        id: 'out_pos_4',
        label: 'Out4+',
        electricalType: 'dc_pos',
        kind: 'dc_power',
        polarity: 'positive',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'bottom',
        offsetX: -18,
        offsetY: 70,
        domain: 'dc',
        requiresOvercurrentProtection: true,
        notes: 'Output 4 positive. Includes built-in MEGA fuse holder.',
      },
      {
        id: 'out_neg_4',
        label: 'Out4-',
        electricalType: 'dc_neg',
        kind: 'dc_power',
        polarity: 'negative',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'bottom',
        offsetX: 18,
        offsetY: 70,
        domain: 'dc',
        notes: 'Output 4 negative.',
      },
    ],
    busbarRatings: {
      voltageRatingV: 58,
      currentRatingA: 1000,
      connectionCount: 4,
      busDesignation: 'combined',
    },
    distributionTopology: {
      buses: [
        { id: 'positive_bus', label: 'Positive Bus', busType: 'dc_pos', terminalIds: ['main_pos'], maxCurrentA: 1000 },
        {
          id: 'negative_bus',
          label: 'Negative Bus',
          busType: 'dc_neg',
          terminalIds: ['main_neg', 'out_neg_1', 'out_neg_2', 'out_neg_3', 'out_neg_4'],
          maxCurrentA: 1000,
        },
      ],
      fuseSlots: [1, 2, 3, 4].map((slot) => ({
        id: `slot_${slot}`,
        label: `Fuse ${slot}`,
        upstreamBusId: 'positive_bus',
        downstreamTerminalId: `out_pos_${slot}`,
        pairedReturnTerminalId: `out_neg_${slot}`,
        fuseStyle: 'MEGA',
        protectionType: 'fuse' as const,
      })),
    },
  },

  // ----------------------------------------------------------
  // Victron Lynx Power In
  // ----------------------------------------------------------
  {
    id: 'dist-vic-lynx-power-in',
    manufacturer: 'Victron',
    name: 'Lynx Power In',
    productType: 'dc_distribution',
    category: 'Distribution',
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 1000,
    msrpUsd: 249,
    oemPriceUsd: 174,
    description: 'Victron Lynx Power In - DC busbar input module',
    partNumber: 'LYN040102000',
    productUrl: 'https://www.victronenergy.com/dc-distribution-systems/lynx-power-in',
    source: 'Victron 2024',
    dataQuality: 'partial',
    width: 140,
    height: 100,
    terminals: [
      {
        id: 'main_pos',
        label: 'Main+',
        electricalType: 'dc_pos',
        kind: 'dc_power',
        polarity: 'positive',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'left',
        offsetX: -70,
        offsetY: -15,
        domain: 'dc',
        notes: 'Main positive bus input.',
      },
      {
        id: 'main_neg',
        label: 'Main-',
        electricalType: 'dc_neg',
        kind: 'dc_power',
        polarity: 'negative',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'left',
        offsetX: -70,
        offsetY: 15,
        domain: 'dc',
        notes: 'Main negative bus input.',
      },
      {
        id: 'out_pos_1',
        label: 'Out1+',
        electricalType: 'dc_pos',
        kind: 'dc_power',
        polarity: 'positive',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'right',
        offsetX: 70,
        offsetY: -20,
        domain: 'dc',
        notes: 'Output 1 positive.',
      },
      {
        id: 'out_neg_1',
        label: 'Out1-',
        electricalType: 'dc_neg',
        kind: 'dc_power',
        polarity: 'negative',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'right',
        offsetX: 70,
        offsetY: 0,
        domain: 'dc',
        notes: 'Output 1 negative.',
      },
      {
        id: 'out_pos_2',
        label: 'Out2+',
        electricalType: 'dc_pos',
        kind: 'dc_power',
        polarity: 'positive',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'right',
        offsetX: 70,
        offsetY: 10,
        domain: 'dc',
        notes: 'Output 2 positive.',
      },
      {
        id: 'out_neg_2',
        label: 'Out2-',
        electricalType: 'dc_neg',
        kind: 'dc_power',
        polarity: 'negative',
        role: 'bus',
        voltageClass: 'dc_low_voltage',
        side: 'right',
        offsetX: 70,
        offsetY: 30,
        domain: 'dc',
        notes: 'Output 2 negative.',
      },
    ],
    busbarRatings: {
      voltageRatingV: 58,
      currentRatingA: 1000,
      connectionCount: 4,
      busDesignation: 'combined',
    },
  },

  // Generic busbars spread in at the end (same as before)
  ...genericBusbars,

  // ==========================================================
  // Lynx Smart BMS — battery management and DC distribution
  // ==========================================================

  {
    id: 'lynx-smart-bms',
    manufacturer: 'Victron',
    name: 'Lynx Smart BMS 500',
    productType: 'dc_distribution',
    category: 'Distribution',
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 500,
    msrpUsd: 799,
    description: 'Victron Lynx Smart BMS 500A — battery management system for Victron Lithium batteries. VE.Can / Bluetooth.',
    partNumber: 'LYN034160200',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 140,
    height: 100,
    terminals: [
      { id: 'bat_pos', label: 'Bat+', electricalType: 'dc_pos', kind: 'dc_power', polarity: 'positive', role: 'bus', voltageClass: 'dc_low_voltage', side: 'left',  offsetX: -70, offsetY: -15 },
      { id: 'bat_neg', label: 'Bat-', electricalType: 'dc_neg', kind: 'dc_power', polarity: 'negative', role: 'bus', voltageClass: 'dc_low_voltage', side: 'left',  offsetX: -70, offsetY: 15  },
      { id: 'load_pos', label: 'Load+', electricalType: 'dc_pos', kind: 'dc_power', polarity: 'positive', role: 'bus', voltageClass: 'dc_low_voltage', side: 'right', offsetX: 70,  offsetY: -15 },
      { id: 'load_neg', label: 'Load-', electricalType: 'dc_neg', kind: 'dc_power', polarity: 'negative', role: 'bus', voltageClass: 'dc_low_voltage', side: 'right', offsetX: 70,  offsetY: 15  },
    ],
    busbarRatings: { voltageRatingV: 58, currentRatingA: 500, busDesignation: 'combined' },
  },
  {
    id: 'lynx-smart-bms-ng-500',
    manufacturer: 'Victron',
    name: 'Lynx Smart BMS NG 500',
    productType: 'dc_distribution',
    category: 'Distribution',
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 500,
    msrpUsd: 950,
    description: 'Victron Lynx Smart BMS NG 500A — next-generation BMS for Victron Lithium NG batteries. VE.Can / Bluetooth.',
    partNumber: 'Lynx Smart BMS NG 500',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.',
    width: 140,
    height: 100,
    terminals: [
      { id: 'bat_pos', label: 'Bat+', electricalType: 'dc_pos', kind: 'dc_power', polarity: 'positive', role: 'bus', voltageClass: 'dc_low_voltage', side: 'left',  offsetX: -70, offsetY: -15 },
      { id: 'bat_neg', label: 'Bat-', electricalType: 'dc_neg', kind: 'dc_power', polarity: 'negative', role: 'bus', voltageClass: 'dc_low_voltage', side: 'left',  offsetX: -70, offsetY: 15  },
      { id: 'load_pos', label: 'Load+', electricalType: 'dc_pos', kind: 'dc_power', polarity: 'positive', role: 'bus', voltageClass: 'dc_low_voltage', side: 'right', offsetX: 70,  offsetY: -15 },
      { id: 'load_neg', label: 'Load-', electricalType: 'dc_neg', kind: 'dc_power', polarity: 'negative', role: 'bus', voltageClass: 'dc_low_voltage', side: 'right', offsetX: 70,  offsetY: 15  },
    ],
    busbarRatings: { voltageRatingV: 58, currentRatingA: 500, busDesignation: 'combined' },
  },
  {
    id: 'lynx-smart-bms-ng-1000',
    manufacturer: 'Victron',
    name: 'Lynx Smart BMS NG 1000',
    productType: 'dc_distribution',
    category: 'Distribution',
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 1000,
    msrpUsd: 1300,
    description: 'Victron Lynx Smart BMS NG 1000A — next-generation BMS for large Victron Lithium NG battery banks. VE.Can / Bluetooth.',
    partNumber: 'Lynx Smart BMS NG 1000',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.',
    width: 140,
    height: 100,
    terminals: [
      { id: 'bat_pos', label: 'Bat+', electricalType: 'dc_pos', kind: 'dc_power', polarity: 'positive', role: 'bus', voltageClass: 'dc_low_voltage', side: 'left',  offsetX: -70, offsetY: -15 },
      { id: 'bat_neg', label: 'Bat-', electricalType: 'dc_neg', kind: 'dc_power', polarity: 'negative', role: 'bus', voltageClass: 'dc_low_voltage', side: 'left',  offsetX: -70, offsetY: 15  },
      { id: 'load_pos', label: 'Load+', electricalType: 'dc_pos', kind: 'dc_power', polarity: 'positive', role: 'bus', voltageClass: 'dc_low_voltage', side: 'right', offsetX: 70,  offsetY: -15 },
      { id: 'load_neg', label: 'Load-', electricalType: 'dc_neg', kind: 'dc_power', polarity: 'negative', role: 'bus', voltageClass: 'dc_low_voltage', side: 'right', offsetX: 70,  offsetY: 15  },
    ],
    busbarRatings: { voltageRatingV: 58, currentRatingA: 1000, busDesignation: 'combined' },
  },

  // ==========================================================
  // VE.Bus BMS NG — for Victron Lithium NG batteries
  // ==========================================================

  {
    id: 've-bus-bms-ng',
    manufacturer: 'Victron',
    name: 'VE.Bus BMS NG',
    productType: 'dc_distribution',
    category: 'Distribution',
    nominalVoltage: [12, 24, 48],
    msrpUsd: 260,
    description: 'Victron VE.Bus BMS NG — battery management system for Victron Lithium NG batteries. VE.Bus / Bluetooth.',
    partNumber: 'VE.Bus BMS NG',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.',
    width: 80,
    height: 60,
    terminals: [
      { id: 'bat_pos', label: 'Bat+', electricalType: 'dc_pos', kind: 'dc_power', polarity: 'positive', role: 'bus', voltageClass: 'dc_low_voltage', side: 'left',  offsetX: -40, offsetY: 0 },
      { id: 'signal', label: 'VE.Bus', electricalType: 'signal', kind: 'signal', role: 'control', voltageClass: 'signal_low_voltage', side: 'right', offsetX: 40, offsetY: 0 },
    ],
  },

  // ==========================================================
  // Lynx Shunt VE.Can — precision current measurement
  // ==========================================================

  {
    id: 'lynx-shunt-ve-can',
    manufacturer: 'Victron',
    name: 'Lynx Shunt VE.Can',
    productType: 'dc_distribution',
    category: 'Distribution',
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 1000,
    msrpUsd: 420,
    description: 'Victron Lynx Shunt VE.Can — precision 1000A current measurement module for the Lynx system. VE.Can communication.',
    partNumber: 'LYN040102100',
    productUrl: 'https://www.cdnrg.com/products/velyn040102100',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 140,
    height: 100,
    terminals: [
      { id: 'main_pos', label: 'Main+', electricalType: 'dc_pos', kind: 'dc_power', polarity: 'positive', role: 'bus', voltageClass: 'dc_low_voltage', side: 'left',  offsetX: -70, offsetY: -15 },
      { id: 'main_neg', label: 'Main-', electricalType: 'dc_neg', kind: 'dc_power', polarity: 'negative', role: 'bus', voltageClass: 'dc_low_voltage', side: 'left',  offsetX: -70, offsetY: 15  },
      { id: 'out_pos',  label: 'Out+',  electricalType: 'dc_pos', kind: 'dc_power', polarity: 'positive', role: 'bus', voltageClass: 'dc_low_voltage', side: 'right', offsetX: 70,  offsetY: -15 },
      { id: 'out_neg',  label: 'Out-',  electricalType: 'dc_neg', kind: 'dc_power', polarity: 'negative', role: 'bus', voltageClass: 'dc_low_voltage', side: 'right', offsetX: 70,  offsetY: 15  },
    ],
    busbarRatings: { voltageRatingV: 58, currentRatingA: 1000, busDesignation: 'combined' },
  },

  // ==========================================================
  // Lynx Class-T Power In — with Class-T fuse protection
  // ==========================================================

  {
    id: 'lynx-class-t-power-in',
    manufacturer: 'Victron',
    name: 'Lynx Class-T Power In',
    productType: 'dc_distribution',
    category: 'Distribution',
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 1000,
    msrpUsd: 172,
    description: 'Victron Lynx Class-T Power In — DC busbar input module with integrated Class-T fuse holder.',
    partNumber: 'LYN020102010',
    productUrl: 'https://www.victronenergy.com/dc-distribution-systems/lynx-class-t-power-in',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 140,
    height: 100,
    terminals: [
      { id: 'main_pos', label: 'Main+', electricalType: 'dc_pos', kind: 'dc_power', polarity: 'positive', role: 'bus', voltageClass: 'dc_low_voltage', side: 'left',  offsetX: -70, offsetY: -15 },
      { id: 'main_neg', label: 'Main-', electricalType: 'dc_neg', kind: 'dc_power', polarity: 'negative', role: 'bus', voltageClass: 'dc_low_voltage', side: 'left',  offsetX: -70, offsetY: 15  },
      { id: 'out_pos',  label: 'Out+',  electricalType: 'dc_pos', kind: 'dc_power', polarity: 'positive', role: 'bus', voltageClass: 'dc_low_voltage', side: 'right', offsetX: 70,  offsetY: -15 },
      { id: 'out_neg',  label: 'Out-',  electricalType: 'dc_neg', kind: 'dc_power', polarity: 'negative', role: 'bus', voltageClass: 'dc_low_voltage', side: 'right', offsetX: 70,  offsetY: 15  },
    ],
    busbarRatings: { voltageRatingV: 58, currentRatingA: 1000, busDesignation: 'combined' },
    distributionTopology: {
      buses: [
        { id: 'positive_bus', label: 'Positive Bus', busType: 'dc_pos', terminalIds: ['main_pos'], maxCurrentA: 1000 },
        { id: 'negative_bus', label: 'Negative Bus', busType: 'dc_neg', terminalIds: ['main_neg', 'out_neg'], maxCurrentA: 1000 },
      ],
      fuseSlots: [
        {
          id: 'slot_1',
          label: 'Class-T Fuse',
          upstreamBusId: 'positive_bus',
          downstreamTerminalId: 'out_pos',
          pairedReturnTerminalId: 'out_neg',
          fuseStyle: 'Class T',
          protectionType: 'fuse',
        },
      ],
    },
  },
];
