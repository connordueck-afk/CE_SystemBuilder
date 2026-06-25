import type { SystemDesign } from '../types/system';
import { DEFAULT_ASSUMPTIONS } from './electricalRules';

export interface SystemPreset {
  id: string;
  name: string;
  description: string;
  voltage: 12 | 24 | 48;
  tags: string[];
  system: SystemDesign;
}

// ----------------------------------------------------------
// Preset 1: Simple 12V Solar + Battery
// Van/RV weekend build — no inverter, DC loads only
// ----------------------------------------------------------
const SIMPLE_12V: SystemDesign = {
  id: 'preset-simple-12v',
  name: 'Simple 12V Solar Build',
  nominalVoltage: 12,
  assumptions: { ...DEFAULT_ASSUMPTIONS },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  components: [
    {
      id: 'p1-bat',
      productId: 'bat-vic-smart-12-200',
      label: 'Battery',
      quantity: 1,
      x: -100,
      y: 300,
    },
    {
      id: 'p1-fuse-bat',
      productId: 'fuse-anl-200a',
      label: 'Battery Fuse',
      quantity: 1,
      x: 10,
      y: 270,
    },
    {
      id: 'p1-bus-pos',
      productId: 'dist-generic-busbar-5pt',
      label: 'Positive Busbar',
      quantity: 1,
      x: 120,
      y: 200,
      busPolarity: 'positive',
    },
    {
      id: 'p1-bus-neg',
      productId: 'dist-generic-busbar-5pt',
      label: 'Negative Busbar',
      quantity: 1,
      x: 120,
      y: 380,
      busPolarity: 'negative',
    },
    {
      id: 'p1-solar',
      productId: 'solar-array-400w',
      label: 'Solar Panel',
      quantity: 1,
      x: -100,
      y: -60,
      solarSeriesCount: 1,
      solarParallelCount: 1,
    },
    {
      id: 'p1-mppt',
      productId: 'mppt-100-50',
      label: 'MPPT Charge Controller',
      quantity: 1,
      x: 300,
      y: -60,
    },
    {
      id: 'p1-fuse-mppt',
      productId: 'fuse-midi-60a',
      label: 'MPPT Fuse',
      quantity: 1,
      x: 230,
      y: 90,
    },
    {
      id: 'p1-dc-load',
      productId: 'acc-dc-load-generic',
      label: 'DC Loads',
      quantity: 1,
      x: 380,
      y: 280,
    },
  ],
  connections: [
    // Battery → ANL 200A fuse → positive busbar
    {
      id: 'p1-bat-to-fuse',
      fromComponentId: 'p1-bat',
      fromTerminalId: 'dc_pos',
      toComponentId: 'p1-fuse-bat',
      toTerminalId: 'in',
      cableLengthFt: 1,
    },
    {
      id: 'p1-fuse-to-bus',
      fromComponentId: 'p1-fuse-bat',
      fromTerminalId: 'out',
      toComponentId: 'p1-bus-pos',
      toTerminalId: 'terminal_1',
      cableLengthFt: 1,
    },
    {
      id: 'p1-bat-neg',
      fromComponentId: 'p1-bat',
      fromTerminalId: 'dc_neg',
      toComponentId: 'p1-bus-neg',
      toTerminalId: 'terminal_1',
      cableLengthFt: 2,
    },
    {
      id: 'p1-solar-pv-pos',
      fromComponentId: 'p1-solar',
      fromTerminalId: 'pv_pos',
      toComponentId: 'p1-mppt',
      toTerminalId: 'pv_pos',
      cableLengthFt: 10,
    },
    {
      id: 'p1-solar-pv-neg',
      fromComponentId: 'p1-solar',
      fromTerminalId: 'pv_neg',
      toComponentId: 'p1-mppt',
      toTerminalId: 'pv_neg',
      cableLengthFt: 10,
    },
    // MPPT → MIDI 60A fuse → positive busbar
    {
      id: 'p1-mppt-to-fuse',
      fromComponentId: 'p1-mppt',
      fromTerminalId: 'bat_pos',
      toComponentId: 'p1-fuse-mppt',
      toTerminalId: 'in',
      cableLengthFt: 2,
    },
    {
      id: 'p1-fuse-mppt-to-bus',
      fromComponentId: 'p1-fuse-mppt',
      fromTerminalId: 'out',
      toComponentId: 'p1-bus-pos',
      toTerminalId: 'terminal_2',
      cableLengthFt: 2,
    },
    {
      id: 'p1-mppt-bat-neg',
      fromComponentId: 'p1-mppt',
      fromTerminalId: 'bat_neg',
      toComponentId: 'p1-bus-neg',
      toTerminalId: 'terminal_2',
      cableLengthFt: 4,
    },
    {
      id: 'p1-bus-pos-load',
      fromComponentId: 'p1-bus-pos',
      fromTerminalId: 'terminal_3',
      toComponentId: 'p1-dc-load',
      toTerminalId: 'dc_pos',
      cableLengthFt: 5,
    },
    {
      id: 'p1-bus-neg-load',
      fromComponentId: 'p1-bus-neg',
      fromTerminalId: 'terminal_3',
      toComponentId: 'p1-dc-load',
      toTerminalId: 'dc_neg',
      cableLengthFt: 5,
    },
  ],
};

// ----------------------------------------------------------
// Preset 2: Full 12V Mobile Power
// Complete van/RV/boat build — solar, alternator DC-DC,
// inverter/charger, shore power, AC + DC loads
// ----------------------------------------------------------
const FULL_12V: SystemDesign = {
  id: 'preset-full-12v',
  name: 'Full 12V Mobile Power',
  nominalVoltage: 12,
  assumptions: { ...DEFAULT_ASSUMPTIONS },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  components: [
    {
      id: 'p2-bat-1',
      productId: 'bat-vic-smart-12-200',
      label: 'Battery 1',
      quantity: 1,
      x: -120,
      y: 360,
    },
    {
      id: 'p2-bat-2',
      productId: 'bat-vic-smart-12-200',
      label: 'Battery 2',
      quantity: 1,
      x: -120,
      y: 500,
    },
    {
      id: 'p2-fuse-bat',
      productId: 'fuse-anl-400a',
      label: 'Battery Bank Fuse',
      quantity: 1,
      x: 0,
      y: 360,
    },
    {
      id: 'p2-bus-pos',
      productId: 'dist-generic-busbar-5pt',
      label: 'Positive Busbar',
      quantity: 1,
      x: 140,
      y: 360,
      busPolarity: 'positive',
    },
    {
      id: 'p2-bus-neg',
      productId: 'dist-generic-busbar-5pt',
      label: 'Negative Busbar',
      quantity: 1,
      x: 140,
      y: 500,
      busPolarity: 'negative',
    },
    {
      id: 'p2-solar-1',
      productId: 'solar-array-400w',
      label: 'Solar Panel 1',
      quantity: 1,
      x: -140,
      y: -80,
      solarSeriesCount: 1,
      solarParallelCount: 1,
    },
    {
      id: 'p2-solar-2',
      productId: 'solar-array-400w',
      label: 'Solar Panel 2',
      quantity: 1,
      x: 60,
      y: -80,
      solarSeriesCount: 1,
      solarParallelCount: 1,
    },
    {
      id: 'p2-mppt',
      productId: 'mppt-100-50',
      label: 'MPPT Charge Controller',
      quantity: 1,
      x: 280,
      y: -20,
    },
    {
      id: 'p2-fuse-mppt',
      productId: 'fuse-midi-60a',
      label: 'MPPT Fuse',
      quantity: 1,
      x: 220,
      y: 160,
    },
    {
      id: 'p2-alternator',
      productId: 'generic-alternator-source',
      label: 'Alternator',
      quantity: 1,
      x: -120,
      y: 120,
    },
    {
      id: 'p2-dcdc',
      productId: 'orion-xs-12-12-50',
      label: 'DC-DC Charger',
      quantity: 1,
      x: 120,
      y: 120,
    },
    {
      id: 'p2-fuse-dcdc',
      productId: 'fuse-midi-60a',
      label: 'DC-DC Fuse',
      quantity: 1,
      x: 230,
      y: 240,
    },
    {
      id: 'p2-fuse-inv',
      productId: 'fuse-anl-325a',
      label: 'Inverter Fuse',
      quantity: 1,
      x: 300,
      y: 360,
    },
    {
      id: 'p2-inverter',
      productId: 'inv-vic-mp2-12-3000',
      label: 'Inverter/Charger',
      quantity: 1,
      x: 440,
      y: 360,
    },
    {
      id: 'p2-shore',
      productId: 'generic-grid-source',
      label: 'Shore Power',
      quantity: 1,
      x: 260,
      y: 620,
    },
    {
      id: 'p2-ac-load',
      productId: 'acc-ac-load-generic',
      label: 'AC Loads',
      quantity: 1,
      x: 660,
      y: 620,
    },
  ],
  connections: [
    // Daisy-chain parallel bank: Battery 2+ → Battery 1+ (short inter-pack lead)
    // then Battery 1+ → single ANL 400A bank fuse → positive busbar.
    // The engine exempts the inter-battery wire from per-cell fuse requirements and
    // correctly sizes the single bank fuse against the full combined bank current.
    { id: 'p2-bat2-to-bat1-pos', fromComponentId: 'p2-bat-2', fromTerminalId: 'dc_pos', toComponentId: 'p2-bat-1', toTerminalId: 'dc_pos', cableLengthFt: 1 },
    { id: 'p2-b1-to-fuse', fromComponentId: 'p2-bat-1', fromTerminalId: 'dc_pos', toComponentId: 'p2-fuse-bat', toTerminalId: 'in', cableLengthFt: 1 },
    { id: 'p2-fuse-to-bus', fromComponentId: 'p2-fuse-bat', fromTerminalId: 'out', toComponentId: 'p2-bus-pos', toTerminalId: 'terminal_1', cableLengthFt: 1 },
    { id: 'p2-b1-neg', fromComponentId: 'p2-bat-1', fromTerminalId: 'dc_neg', toComponentId: 'p2-bus-neg', toTerminalId: 'terminal_1', cableLengthFt: 2 },
    { id: 'p2-b2-neg', fromComponentId: 'p2-bat-2', fromTerminalId: 'dc_neg', toComponentId: 'p2-bus-neg', toTerminalId: 'terminal_2', cableLengthFt: 2 },
    // Solar panels in series
    { id: 'p2-solar-series', fromComponentId: 'p2-solar-1', fromTerminalId: 'pv_pos', toComponentId: 'p2-solar-2', toTerminalId: 'pv_neg', cableLengthFt: 2 },
    { id: 'p2-solar-pv-pos', fromComponentId: 'p2-solar-2', fromTerminalId: 'pv_pos', toComponentId: 'p2-mppt', toTerminalId: 'pv_pos', cableLengthFt: 12 },
    { id: 'p2-solar-pv-neg', fromComponentId: 'p2-solar-1', fromTerminalId: 'pv_neg', toComponentId: 'p2-mppt', toTerminalId: 'pv_neg', cableLengthFt: 12 },
    // MPPT → MIDI 60A fuse → positive busbar
    { id: 'p2-mppt-to-fuse', fromComponentId: 'p2-mppt', fromTerminalId: 'bat_pos', toComponentId: 'p2-fuse-mppt', toTerminalId: 'in', cableLengthFt: 2 },
    { id: 'p2-mppt-fuse-to-bus', fromComponentId: 'p2-fuse-mppt', fromTerminalId: 'out', toComponentId: 'p2-bus-pos', toTerminalId: 'terminal_3', cableLengthFt: 2 },
    { id: 'p2-mppt-neg', fromComponentId: 'p2-mppt', fromTerminalId: 'bat_neg', toComponentId: 'p2-bus-neg', toTerminalId: 'terminal_3', cableLengthFt: 4 },
    // Alternator → DC-DC charger
    { id: 'p2-alt-pos', fromComponentId: 'p2-alternator', fromTerminalId: 'dc_pos', toComponentId: 'p2-dcdc', toTerminalId: 'in_pos', cableLengthFt: 6 },
    { id: 'p2-alt-neg', fromComponentId: 'p2-alternator', fromTerminalId: 'dc_neg', toComponentId: 'p2-dcdc', toTerminalId: 'in_neg', cableLengthFt: 6 },
    // DC-DC charger → MIDI 60A fuse → positive busbar
    { id: 'p2-dcdc-to-fuse', fromComponentId: 'p2-dcdc', fromTerminalId: 'out_pos', toComponentId: 'p2-fuse-dcdc', toTerminalId: 'in', cableLengthFt: 2 },
    { id: 'p2-dcdc-fuse-to-bus', fromComponentId: 'p2-fuse-dcdc', fromTerminalId: 'out', toComponentId: 'p2-bus-pos', toTerminalId: 'terminal_4', cableLengthFt: 2 },
    { id: 'p2-dcdc-neg', fromComponentId: 'p2-dcdc', fromTerminalId: 'out_neg', toComponentId: 'p2-bus-neg', toTerminalId: 'terminal_4', cableLengthFt: 4 },
    // Positive busbar → ANL 325A fuse → inverter
    { id: 'p2-bus-to-fuse-inv', fromComponentId: 'p2-bus-pos', fromTerminalId: 'terminal_5', toComponentId: 'p2-fuse-inv', toTerminalId: 'in', cableLengthFt: 2 },
    { id: 'p2-fuse-inv-to-inv', fromComponentId: 'p2-fuse-inv', fromTerminalId: 'out', toComponentId: 'p2-inverter', toTerminalId: 'dc_pos', cableLengthFt: 3 },
    { id: 'p2-inv-neg', fromComponentId: 'p2-bus-neg', fromTerminalId: 'terminal_5', toComponentId: 'p2-inverter', toTerminalId: 'dc_neg', cableLengthFt: 5 },
    // Shore power and AC loads
    { id: 'p2-shore-l', fromComponentId: 'p2-shore', fromTerminalId: 'ac_l', toComponentId: 'p2-inverter', toTerminalId: 'ac_in_l', cableLengthFt: 8 },
    { id: 'p2-shore-n', fromComponentId: 'p2-shore', fromTerminalId: 'ac_n', toComponentId: 'p2-inverter', toTerminalId: 'ac_in_n', cableLengthFt: 8 },
    { id: 'p2-ac-load-l', fromComponentId: 'p2-inverter', fromTerminalId: 'ac_out_l', toComponentId: 'p2-ac-load', toTerminalId: 'ac_l', cableLengthFt: 12 },
    { id: 'p2-ac-load-n', fromComponentId: 'p2-inverter', fromTerminalId: 'ac_out_n', toComponentId: 'p2-ac-load', toTerminalId: 'ac_n', cableLengthFt: 12 },
  ],
};

// ----------------------------------------------------------
// Preset 3: 48V Off-Grid Cabin (Helios ESS)
// Fixed installation — 2× Discover Helios in parallel,
// high-power solar, grid-interactive inverter, generator backup
// ----------------------------------------------------------
const OFFGRID_48V: SystemDesign = {
  id: "sys-1782429874112-852",
  name: "48V Off-Grid Cabin",
  nominalVoltage: 48,
  assumptions: {
    inverterEfficiency: 0.92,
    defaultOemDiscountPercent: 30,
    defaultCableLengthFt: 6,
    maxVoltageDropPercent: 3,
    continuousLoadMultiplier: 1.25,
    batteryInterconnectMaxLengthFt: 3
  },
  createdAt: "2026-06-25T23:24:34.112Z",
  updatedAt: "2026-06-25T23:27:30.961Z",
  components: [
    {
      id: "p3-bat-1",
      productId: "discover-helios-ess-52-48-16000",
      label: "Helios ESS 1",
      quantity: 1,
      x: -320,
      y: 440
    },
    {
      id: "p3-bat-2",
      productId: "discover-helios-ess-52-48-16000",
      label: "Helios ESS 2",
      quantity: 1,
      x: -220,
      y: 440,
      configuredProtocols: {
        can_out: "VE.Can"
      }
    },
    {
      id: "p3-fuse-pack",
      productId: "fuse-anl-littelfuse-300a",
      label: "Pack Fuse",
      quantity: 1,
      x: -60,
      y: 360,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "p3-bus-pos",
      productId: "dist-generic-busbar-5pt",
      label: "Positive Busbar",
      quantity: 1,
      x: 80,
      y: 300,
      inferredElectricalType: "dc_pos",
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "p3-bus-neg",
      productId: "dist-generic-busbar-5pt",
      label: "Negative Busbar",
      quantity: 1,
      x: 280,
      y: 300,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "negative",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "p3-mppt",
      productId: "mppt-vic-150-100",
      label: "MPPT 150/100",
      quantity: 1,
      x: 300,
      y: -20
    },
    {
      id: "p3-fuse-mppt",
      productId: "fuse-midi-125a",
      label: "MPPT Fuse",
      quantity: 1,
      x: 280,
      y: 140,
      rotationDeg: 90,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "p3-fuse-inv",
      productId: "fuse-anl-150a",
      label: "Inverter Fuse",
      quantity: 1,
      x: 160,
      y: 420,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "p3-inverter",
      productId: "inv-vic-mp2-48-5000",
      label: "MultiPlus-II 48/5000",
      quantity: 1,
      x: 500,
      y: 340
    },
    {
      id: "p3-generator",
      productId: "generic-generator-source",
      label: "Generator",
      quantity: 1,
      x: 720,
      y: 460,
      rotationDeg: 180
    },
    {
      id: "p3-ac-load",
      productId: "acc-ac-load-generic",
      label: "AC Loads",
      quantity: 1,
      x: 800,
      y: 640
    },
    {
      id: "comp-1782430014160-1412",
      productId: "solar-array-400w",
      label: "Solar Array 400W",
      quantity: 1,
      x: 80,
      y: -100,
      includeInBom: true
    },
    {
      id: "comp-1782430016792-1497",
      productId: "solar-array-400w",
      label: "Solar Array 400W Copy",
      quantity: 1,
      x: -60,
      y: -100,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782430018784-1598",
      productId: "solar-array-400w",
      label: "Solar Array 400W Copy Copy",
      quantity: 1,
      x: -200,
      y: -100,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782430036032-1951",
      productId: "breaker-ac-din-1p-50a",
      label: "AC Breaker",
      quantity: 1,
      x: 500,
      y: 560,
      rotationDeg: 0,
      includeInBom: true
    }
  ],
  connections: [
    {
      id: "p3-b2-to-b1-pos",
      fromComponentId: "p3-bat-2",
      fromTerminalId: "dc_pos",
      toComponentId: "p3-bat-1",
      toTerminalId: "dc_pos",
      cableLengthFt: 1,
      busType: "dc_pos",
      calculatedCurrentA: 300,
      recommendedFuseA: 400,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.029,
      voltageDropPercent: 0.06,
      warnings: [],
      routePoints: [
        {
          x: -182,
          y: 350
        },
        {
          x: -282,
          y: 350
        }
      ],
      routeMode: "manual",
      manualCableAwg: "4/0"
    },
    {
      id: "p3-fuse-to-bus",
      fromComponentId: "p3-fuse-pack",
      fromTerminalId: "out",
      toComponentId: "p3-bus-pos",
      toTerminalId: "terminal_1",
      cableLengthFt: 2,
      busType: "dc_pos",
      calculatedCurrentA: 110,
      recommendedFuseA: 150,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.022,
      voltageDropPercent: 0.04,
      warnings: []
    },
    {
      id: "p3-b2-to-b1-neg",
      fromComponentId: "p3-bat-2",
      fromTerminalId: "dc_neg",
      toComponentId: "p3-bat-1",
      toTerminalId: "dc_neg",
      cableLengthFt: 1,
      busType: "dc_neg",
      calculatedCurrentA: 300,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.029,
      voltageDropPercent: 0.06,
      warnings: [],
      routePoints: [
        {
          x: -258,
          y: 350
        },
        {
          x: -370,
          y: 350
        },
        {
          x: -370,
          y: 385
        }
      ],
      routeMode: "manual"
    },
    {
      id: "p3-b1-neg",
      fromComponentId: "p3-bat-1",
      fromTerminalId: "dc_neg",
      toComponentId: "p3-bus-neg",
      toTerminalId: "terminal_1",
      cableLengthFt: 2,
      busType: "dc_neg",
      calculatedCurrentA: 300,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.059,
      voltageDropPercent: 0.11,
      warnings: [],
      routePoints: [
        {
          x: -370,
          y: 385
        },
        {
          x: -370,
          y: 560
        },
        {
          x: 228,
          y: 560
        }
      ],
      routeMode: "manual"
    },
    {
      id: "p3-mppt-to-fuse",
      fromComponentId: "p3-mppt",
      fromTerminalId: "bat_pos",
      toComponentId: "p3-fuse-mppt",
      toTerminalId: "in",
      cableLengthFt: 2,
      busType: "dc_pos",
      calculatedCurrentA: 30.208333333333332,
      recommendedFuseA: 40,
      recommendedCableAwg: "4",
      voltageDropV: 0.03,
      voltageDropPercent: 0.06,
      warnings: []
    },
    {
      id: "p3-mppt-fuse-to-bus",
      fromComponentId: "p3-fuse-mppt",
      fromTerminalId: "out",
      toComponentId: "p3-bus-pos",
      toTerminalId: "terminal_3",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 30.208333333333332,
      recommendedFuseA: 40,
      recommendedCableAwg: "4",
      voltageDropV: 0.045,
      voltageDropPercent: 0.09,
      warnings: [],
      routePoints: [
        {
          x: 280,
          y: 240
        },
        {
          x: 80,
          y: 240
        }
      ],
      routeMode: "manual"
    },
    {
      id: "p3-mppt-neg",
      fromComponentId: "p3-mppt",
      fromTerminalId: "bat_neg",
      toComponentId: "p3-bus-neg",
      toTerminalId: "terminal_3",
      cableLengthFt: 5,
      busType: "dc_neg",
      calculatedCurrentA: 30.208333333333332,
      recommendedCableAwg: "4",
      voltageDropV: 0.075,
      voltageDropPercent: 0.16,
      warnings: [],
      routePoints: [
        {
          x: 328,
          y: 260
        },
        {
          x: 280,
          y: 260
        }
      ],
      routeMode: "manual"
    },
    {
      id: "p3-bus-to-fuse-inv",
      fromComponentId: "p3-bus-pos",
      fromTerminalId: "terminal_4",
      toComponentId: "p3-fuse-inv",
      toTerminalId: "in",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 110,
      recommendedFuseA: 150,
      recommendedCableAwg: "2",
      voltageDropV: 0.104,
      voltageDropPercent: 0.22,
      warnings: []
    },
    {
      id: "p3-fuse-inv-to-inv",
      fromComponentId: "p3-fuse-inv",
      fromTerminalId: "out",
      toComponentId: "p3-inverter",
      toTerminalId: "dc_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 110,
      recommendedFuseA: 150,
      recommendedCableAwg: "2",
      voltageDropV: 0.104,
      voltageDropPercent: 0.22,
      warnings: []
    },
    {
      id: "p3-inv-neg",
      fromComponentId: "p3-bus-neg",
      fromTerminalId: "terminal_4",
      toComponentId: "p3-inverter",
      toTerminalId: "dc_neg",
      cableLengthFt: 6,
      busType: "dc_neg",
      calculatedCurrentA: 110,
      recommendedCableAwg: "2",
      voltageDropV: 0.207,
      voltageDropPercent: 0.43,
      warnings: []
    },
    {
      id: "p3-gen-l",
      fromComponentId: "p3-generator",
      fromTerminalId: "ac_l",
      toComponentId: "p3-inverter",
      toTerminalId: "ac_in_l",
      cableLengthFt: 10,
      busType: "ac_line",
      calculatedCurrentA: 25,
      recommendedFuseA: 35,
      recommendedCableAwg: "12",
      voltageDropV: 0.794,
      voltageDropPercent: 0.66,
      warnings: []
    },
    {
      id: "p3-gen-n",
      fromComponentId: "p3-generator",
      fromTerminalId: "ac_n",
      toComponentId: "p3-inverter",
      toTerminalId: "ac_in_n",
      cableLengthFt: 10,
      busType: "ac_neutral",
      calculatedCurrentA: 25,
      recommendedCableAwg: "14",
      voltageDropV: 1.262,
      voltageDropPercent: 1.05,
      warnings: []
    },
    {
      id: "p3-ac-n",
      fromComponentId: "p3-inverter",
      fromTerminalId: "ac_out_n",
      toComponentId: "p3-ac-load",
      toTerminalId: "ac_n",
      cableLengthFt: 15,
      busType: "ac_neutral",
      calculatedCurrentA: 8.333333333333334,
      recommendedCableAwg: "18",
      voltageDropV: 1.595,
      voltageDropPercent: 1.33,
      warnings: []
    },
    {
      id: "conn-1782429174545-5",
      fromComponentId: "p3-bat-2",
      fromTerminalId: "dc_pos",
      toComponentId: "p3-fuse-pack",
      toTerminalId: "in",
      cableLengthFt: 1,
      routePoints: [
        {
          x: -182,
          y: 360
        }
      ],
      routeMode: "manual",
      busType: "dc_pos",
      calculatedCurrentA: 110,
      recommendedFuseA: 150,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.011,
      voltageDropPercent: 0.02,
      warnings: []
    },
    {
      id: "conn-1782429290345-6",
      fromComponentId: "p3-bat-1",
      fromTerminalId: "port_lynk_2",
      toComponentId: "p3-bat-2",
      toTerminalId: "port_lynk_2",
      cableLengthFt: 6,
      wireKind: "communication",
      busType: "communication",
      calculatedCurrentA: 0,
      voltageDropV: 0,
      voltageDropPercent: 0,
      warnings: []
    },
    {
      id: "conn-1782429308609-13",
      fromComponentId: "p3-bat-2",
      fromTerminalId: "can_out",
      toComponentId: "p3-mppt",
      toTerminalId: "ve_can",
      cableLengthFt: 6,
      wireKind: "communication",
      routePoints: [
        {
          x: -220,
          y: 370
        },
        {
          x: -220,
          y: 200
        },
        {
          x: 220,
          y: 200
        },
        {
          x: 220,
          y: -76
        }
      ],
      routeMode: "manual",
      busType: "communication",
      calculatedCurrentA: 0,
      voltageDropV: 0,
      voltageDropPercent: 0,
      warnings: []
    },
    {
      id: "conn-1782430021177-1711",
      fromComponentId: "comp-1782430018784-1598",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782430016792-1497",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "unknown",
      calculatedCurrentA: 12,
      recommendedCableAwg: "18",
      voltageDropV: 0.919,
      voltageDropPercent: 2.7,
      warnings: []
    },
    {
      id: "conn-1782430022656-1716",
      fromComponentId: "comp-1782430016792-1497",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782430014160-1412",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "unknown",
      calculatedCurrentA: 12,
      recommendedCableAwg: "18",
      voltageDropV: 0.919,
      voltageDropPercent: 2.7,
      warnings: []
    },
    {
      id: "conn-1782430024040-1721",
      fromComponentId: "comp-1782430014160-1412",
      fromTerminalId: "pv_pos",
      toComponentId: "p3-mppt",
      toTerminalId: "pv_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 105,
          y: 40
        },
        {
          x: 291,
          y: 40
        }
      ],
      routeMode: "manual",
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 0.39,
      warnings: []
    },
    {
      id: "conn-1782430025752-1726",
      fromComponentId: "comp-1782430018784-1598",
      fromTerminalId: "pv_neg",
      toComponentId: "p3-mppt",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -225,
          y: 60
        },
        {
          x: 272,
          y: 60
        }
      ],
      routeMode: "manual",
      busType: "pv_neg",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 0.39,
      warnings: []
    },
    {
      id: "conn-1782430036032-1952",
      fromComponentId: "p3-inverter",
      fromTerminalId: "ac_out_l",
      toComponentId: "comp-1782430036032-1951",
      toTerminalId: "l1_in",
      cableLengthFt: 7.5,
      busType: "ac_line",
      calculatedCurrentA: 8.333333333333334,
      recommendedFuseA: 15,
      recommendedCableAwg: "10",
      voltageDropV: 0.125,
      voltageDropPercent: 0.1,
      warnings: []
    },
    {
      id: "conn-1782430036032-1953",
      fromComponentId: "comp-1782430036032-1951",
      fromTerminalId: "l1_out",
      toComponentId: "p3-ac-load",
      toTerminalId: "ac_l",
      cableLengthFt: 7.5,
      busType: "ac_line",
      calculatedCurrentA: 8.333333333333334,
      recommendedFuseA: 15,
      recommendedCableAwg: "10",
      voltageDropV: 0.125,
      voltageDropPercent: 0.1,
      warnings: []
    }
  ]
};

export const SYSTEM_PRESETS: SystemPreset[] = [
  {
    id: 'simple-12v',
    name: 'Simple 12V Solar',
    description: 'One battery, one solar panel, and DC loads. The ideal starting point for a weekend van build or small boat.',
    voltage: 12,
    tags: ['12V', 'Van/RV', 'Solar', 'DC Only'],
    system: SIMPLE_12V,
  },
  {
    id: 'full-12v',
    name: 'Full 12V Mobile',
    description: 'Two batteries, series solar strings, DC-DC alternator charging, inverter/charger, and shore power. A complete mobile power system.',
    voltage: 12,
    tags: ['12V', 'Van/RV', 'Solar', 'Inverter', 'Alternator'],
    system: FULL_12V,
  },
  {
    id: 'offgrid-48v',
    name: '48V Off-Grid Cabin',
    description: 'Two Discover Helios ESS batteries in parallel (32 kWh), a 1600W solar array (2S2P), a high-power MPPT, a 5kW inverter, and generator backup for a permanent installation.',
    voltage: 48,
    tags: ['48V', 'Cabin', 'Off-Grid', 'Solar', 'Generator', 'Helios'],
    system: OFFGRID_48V,
  },
];
