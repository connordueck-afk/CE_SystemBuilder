// ============================================================
// acChargers.ts — AC-powered battery charger product definitions
// ============================================================
// Shore power / AC chargers (not inverter/chargers).
// These connect to AC mains on the input and charge a DC
// battery bank on the output.
// ============================================================

import type { Product } from '../../types/system';

// DC output terminals get maxCurrentA for terminal-first wire/fuse sizing.
// AC input terminals stay without maxCurrentA; the productType switch derives
// AC input current from the charger output power, which is correct.
function acChargerTerminals(outputCurrentA: number): Product['terminals'] {
  return [
    {
      id: 'ac_l',
      label: 'AC L',
      electricalType: 'ac',
      kind: 'ac_power',
      polarity: 'line',
      role: 'sink',
      direction: 'input',
      voltageClass: 'ac_120v',
      side: 'left',
      offsetX: -40,
      offsetY: -10,
      domain: 'ac',
      notes: 'AC input line conductor.',
    },
    {
      id: 'ac_n',
      label: 'AC N',
      electricalType: 'ac',
      kind: 'ac_power',
      polarity: 'neutral',
      role: 'sink',
      direction: 'input',
      voltageClass: 'ac_120v',
      side: 'left',
      offsetX: -40,
      offsetY: 10,
      domain: 'ac',
      notes: 'AC input neutral conductor.',
    },
    {
      id: 'dc_pos',
      label: 'DC+',
      electricalType: 'dc_pos',
      kind: 'dc_power',
      polarity: 'positive',
      role: 'source',
      direction: 'output',
      voltageClass: 'dc_low_voltage',
      side: 'right',
      offsetX: 40,
      offsetY: -10,
      domain: 'dc',
      requiresOvercurrentProtection: true,
      maxCurrentA: outputCurrentA,
      notes: 'DC output positive. Fuse required on positive conductor.',
    },
    {
      id: 'dc_neg',
      label: 'DC-',
      electricalType: 'dc_neg',
      kind: 'dc_power',
      polarity: 'negative',
      role: 'source',
      direction: 'output',
      voltageClass: 'dc_low_voltage',
      side: 'right',
      offsetX: 40,
      offsetY: 10,
      domain: 'dc',
      maxCurrentA: outputCurrentA,
      notes: 'DC output negative.',
    },
  ];
}

export const acChargers: Product[] = [
  // ==========================================================
  // Blue Smart IP22 — portable / bench chargers (120V)
  // ==========================================================

  {
    id: 'blue-smart-ip22-15',
    manufacturer: 'Victron',
    name: 'Blue Smart IP22 Charger 12/15',
    productType: 'shore_charger',
    category: 'Charging',
    nominalVoltage: 12,
    maxCurrentA: 15,
    msrpUsd: 155,
    description: 'Victron Blue Smart IP22 Charger 12V/15A — Bluetooth, 120VAC input',
    partNumber: 'BPC121542002',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 80,
    height: 60,
    terminals: acChargerTerminals(15),
  },
  {
    id: 'blue-smart-ip22-30',
    manufacturer: 'Victron',
    name: 'Blue Smart IP22 Charger 12/30',
    productType: 'shore_charger',
    category: 'Charging',
    nominalVoltage: 12,
    maxCurrentA: 30,
    msrpUsd: 202,
    description: 'Victron Blue Smart IP22 Charger 12V/30A — Bluetooth, 120VAC input',
    partNumber: 'BPC123047002',
    productUrl: 'https://www.cdnrg.com/products/vebpc123047102',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 80,
    height: 60,
    terminals: acChargerTerminals(30),
  },
  {
    id: 'blue-smart-ip22-24-16',
    manufacturer: 'Victron',
    name: 'Blue Smart IP22 Charger 24/16',
    productType: 'shore_charger',
    category: 'Charging',
    nominalVoltage: 24,
    maxCurrentA: 16,
    msrpUsd: 255,
    description: 'Victron Blue Smart IP22 Charger 24V/16A — Bluetooth, 120VAC input',
    partNumber: 'BPC241642002',
    productUrl: 'https://www.cdnrg.com/products/vebpc241647102',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 80,
    height: 60,
    terminals: acChargerTerminals(16),
  },

  // ==========================================================
  // Blue Smart IP65 — weatherproof chargers
  // ==========================================================

  {
    id: 'blue-smart-ip65-12-15',
    manufacturer: 'Victron',
    name: 'Blue Smart IP65 Charger 12/15',
    productType: 'shore_charger',
    category: 'Charging',
    nominalVoltage: 12,
    maxCurrentA: 15,
    msrpUsd: 176,
    description: 'Victron Blue Smart IP65 Charger 12V/15A — Bluetooth, IP65 weatherproof, 120VAC input',
    partNumber: 'BPC121531104R',
    productUrl: 'https://www.cdnrg.com/products/vebpc121531104r',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 80,
    height: 60,
    terminals: acChargerTerminals(15),
  },

  // ==========================================================
  // Skylla-IP65 — heavy-duty industrial charger
  // ==========================================================

  {
    id: 'skylla-ip65-24-70',
    manufacturer: 'Victron',
    name: 'Skylla-IP65 24/70 Charger',
    productType: 'shore_charger',
    category: 'Charging',
    nominalVoltage: 24,
    maxCurrentA: 70,
    continuousPowerW: 1680,
    msrpUsd: 1350,
    description: 'Victron Skylla-IP65 24V/70A — industrial AC charger with CAN-bus, IP65, 120/240VAC input',
    partNumber: 'SKI024070000',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 80,
    height: 60,
    terminals: acChargerTerminals(70),
  },
];
