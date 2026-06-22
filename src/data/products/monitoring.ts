// ============================================================
// monitoring.ts — Battery monitors and system controllers
// ============================================================
// Includes: SmartShunt, BMV (new entries), Cerbo GX (new entries),
// Ekrano GX, GlobalLink 520, GX Touch displays.
//
// The existing BMV-712 (mon-vic-bmv-712) and Cerbo GX
// (mon-vic-cerbo-gx) are in accessories.ts for backward
// compatibility. New models are added here.
// ============================================================

import type { Product } from '../../types/system';

const shuntTerminals: Product['terminals'] = [
  {
    id: 'shunt_pos',
    label: 'Shunt+',
    electricalType: 'dc_pos',
    kind: 'dc_power',
    polarity: 'positive',
    role: 'sense',
    voltageClass: 'dc_low_voltage',
    side: 'left',
    offsetX: -42,
    offsetY: 13,
    domain: 'dc',
    notes: 'Battery negative sense terminal (current shunt measures flow across this terminal).',
  },
  {
    id: 'shunt_neg',
    label: 'Shunt-',
    electricalType: 'dc_neg',
    kind: 'dc_power',
    polarity: 'negative',
    role: 'sense',
    voltageClass: 'dc_low_voltage',
    side: 'right',
    offsetX: 42,
    offsetY: 13,
    domain: 'dc',
    notes: 'Battery negative bus side of shunt.',
  },
];

const signalTerminal: Product['terminals'] = [
  {
    id: 'signal',
    label: 'Signal',
    electricalType: 'signal',
    kind: 'signal',
    role: 'control',
    voltageClass: 'signal_low_voltage',
    side: 'left',
    offsetX: -40,
    offsetY: 0,
    domain: 'communication',
    notes: 'VE.Bus / VE.Can / VE.Direct system communications.',
  },
];

export const monitoring: Product[] = [
  // ==========================================================
  // SmartShunt — hall-effect battery monitors
  // ==========================================================

  {
    id: 'smartshunt-500',
    manufacturer: 'Victron',
    name: 'SmartShunt 500A/50mV',
    productType: 'monitor',
    category: 'Monitoring',
    msrpUsd: 123,
    description: 'Victron SmartShunt 500A — Bluetooth battery monitor with integrated 500A/50mV shunt',
    partNumber: 'SHU050150050',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 100,
    height: 50,
    terminals: shuntTerminals,
  },
  {
    id: 'smartshunt-1000',
    manufacturer: 'Victron',
    name: 'SmartShunt 1000A/50mV',
    productType: 'monitor',
    category: 'Monitoring',
    msrpUsd: 203,
    description: 'Victron SmartShunt 1000A — Bluetooth battery monitor with integrated 1000A/50mV shunt',
    partNumber: 'SHU050210050',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 100,
    height: 50,
    terminals: shuntTerminals,
  },
  {
    id: 'smartshunt-2000',
    manufacturer: 'Victron',
    name: 'SmartShunt 2000A/50mV',
    productType: 'monitor',
    category: 'Monitoring',
    msrpUsd: 276,
    description: 'Victron SmartShunt 2000A — Bluetooth battery monitor with integrated 2000A/50mV shunt',
    partNumber: 'SHU050220050',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 100,
    height: 50,
    terminals: shuntTerminals,
  },

  // ==========================================================
  // GX System Controllers
  // ==========================================================

  {
    id: 'ekrano-gx',
    manufacturer: 'Victron',
    name: 'Ekrano GX',
    productType: 'monitor',
    category: 'Monitoring',
    msrpUsd: 690,
    description: 'Victron Ekrano GX — combined system controller and 7-inch touchscreen display. VE.Bus / VE.Direct / VE.Can / Ethernet.',
    partNumber: 'BPP900480100',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 80,
    height: 60,
    terminals: signalTerminal,
  },
  {
    id: 'globallink-520',
    manufacturer: 'Victron',
    name: 'GlobalLink 520 Cellular Gateway',
    productType: 'monitor',
    category: 'Monitoring',
    msrpUsd: 265,
    description: 'Victron GlobalLink 520 — LTE-M cellular gateway for remote VRM monitoring via VE.Direct',
    partNumber: 'ASS030543020',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs.',
    width: 80,
    height: 60,
    terminals: signalTerminal,
  },

  // ==========================================================
  // GX Touch Displays (accessories to GX controllers)
  // ==========================================================

  {
    id: 'gx-touch-50',
    manufacturer: 'Victron',
    name: 'GX Touch 50 Display',
    productType: 'accessory',
    category: 'Monitoring',
    msrpUsd: 269,
    description: 'Victron GX Touch 50 — 5-inch touchscreen display for Cerbo GX (HDMI/USB connection)',
    partNumber: 'BPP900455050',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs. Requires Cerbo GX.',
    width: 80,
    height: 60,
    terminals: signalTerminal,
  },
  {
    id: 'gx-touch-70',
    manufacturer: 'Victron',
    name: 'GX Touch 70 Display',
    productType: 'accessory',
    category: 'Monitoring',
    msrpUsd: 397,
    description: 'Victron GX Touch 70 — 7-inch touchscreen display for Cerbo GX (HDMI/USB connection)',
    partNumber: 'BPP900455070',
    source: 'Victron 2025',
    dataQuality: 'partial',
    notes: 'Placeholder pricing/specs. Requires Cerbo GX.',
    width: 80,
    height: 60,
    terminals: signalTerminal,
  },
];
