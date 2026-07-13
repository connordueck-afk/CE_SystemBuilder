import type { SystemDesign } from '../types/system';
import { DEFAULT_SYSTEM } from './defaultSystem';

export interface SystemPreset {
  id: string;
  name: string;
  description: string;
  voltage: 12 | 24 | 48;
  tags: string[];
  system: SystemDesign;
}

// ----------------------------------------------------------
// Default-system slots used by the reset/new-system menu and the dev-only
// "Set Default" writer.
// ----------------------------------------------------------
const SIMPLE_12V: SystemDesign = {
  id: "sys-1783612996217-79",
  name: "12V Bare DC",
  nominalVoltage: 12,
  assumptions: {
    inverterEfficiency: 0.92,
    defaultOemDiscountPercent: 30,
    defaultCableLengthFt: 6,
    maxVoltageDropPercent: 3,
    continuousLoadMultiplier: 1.25,
    batteryInterconnectMaxLengthFt: 3
  },
  createdAt: "2026-07-09T16:03:16.217Z",
  updatedAt: "2026-07-09T22:38:02.860Z",
  components: [
    {
      id: "rv12-bat-1",
      productId: "discover-aes-lithium-12-200",
      label: "House Battery",
      quantity: 1,
      x: -240,
      y: 160,
      includeInBom: true
    },
    {
      id: "rv12-lynx",
      productId: "dist-vic-lynx-distributor",
      label: "Lynx Distributor",
      quantity: 1,
      x: -40,
      y: -20,
      includeInBom: true,
      dcNominalVoltage: 12,
      instanceVoltageV: 12,
      inferredConnectionKind: "dc_power",
      inferredVoltageClass: "dc_low_voltage",
      fuseSlots: {
        slot_1: {
          installed: true,
          ratingA: 30,
          fuseProductId: "fuse-mega-littelfuse-32v-30a"
        },
        slot_2: {
          installed: true,
          ratingA: 80,
          fuseProductId: "fuse-mega-littelfuse-32v-80a"
        },
        slot_3: {
          installed: true,
          ratingA: 40,
          fuseProductId: "fuse-mega-littelfuse-32v-40a"
        },
        slot_4: {
          installed: false
        }
      }
    },
    {
      id: "rv12-alternator",
      productId: "generic-alternator-source",
      label: "Vehicle Alternator",
      quantity: 1,
      x: -440,
      y: -80,
      includeInBom: true,
      instanceVoltageV: 12,
      instanceMaxCurrentA: 30
    },
    {
      id: "rv12-dcdc-in-fuse",
      productId: "holder-midi-1pos-inline",
      label: "Alternator Input Fuse",
      quantity: 1,
      x: -300,
      y: -120,
      includeInBom: true,
      fuseSlots: {
        slot_1: {
          installed: true,
          ratingA: 40
        }
      }
    },
    {
      id: "rv12-dcdc",
      productId: "acc-vic-dc-dc-orion-12-12-30",
      label: "Orion-Tr Smart 12/12-30A",
      quantity: 1,
      x: -40,
      y: -160,
      includeInBom: true
    },
    {
      id: "rv12-mppt",
      productId: "mppt-vic-150-60",
      label: "SmartSolar MPPT 150/60",
      quantity: 1,
      x: 100,
      y: -380,
      includeInBom: true
    },
    {
      id: "rv12-pv-1",
      productId: "solar-array-400w",
      label: "Solar Panel 1",
      quantity: 1,
      x: -220,
      y: -380,
      includeInBom: true
    },
    {
      id: "rv12-pv-2",
      productId: "solar-array-400w",
      label: "Solar Panel 2",
      quantity: 1,
      x: -60,
      y: -380,
      includeInBom: true
    },
    {
      id: "rv12-dc-load",
      productId: "acc-dc-load-generic",
      label: "12V DC Loads",
      quantity: 1,
      x: 260,
      y: 120,
      includeInBom: true,
      instanceVoltageV: 12,
      instanceMaxCurrentA: 20
    }
  ],
  connections: [
    {
      id: "rv12-alt-to-input-fuse",
      fromComponentId: "rv12-alternator",
      fromTerminalId: "dc_pos",
      toComponentId: "rv12-dcdc-in-fuse",
      toTerminalId: "in_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 30,
      recommendedFuseA: 40,
      recommendedCableAwg: "12",
      voltageDropV: 0.286,
      voltageDropPercent: 2.38,
      warnings: [],
      errors: []
    },
    {
      id: "rv12-input-fuse-to-dcdc",
      fromComponentId: "rv12-dcdc-in-fuse",
      fromTerminalId: "out_pos",
      toComponentId: "rv12-dcdc",
      toTerminalId: "in_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 30,
      recommendedFuseA: 40,
      recommendedCableAwg: "12",
      voltageDropV: 0.286,
      voltageDropPercent: 2.38,
      warnings: [],
      errors: []
    },
    {
      id: "rv12-alt-neg-to-dcdc",
      fromComponentId: "rv12-alternator",
      fromTerminalId: "dc_neg",
      toComponentId: "rv12-dcdc",
      toTerminalId: "in_neg",
      cableLengthFt: 6,
      busType: "dc_neg",
      calculatedCurrentA: 30,
      recommendedCableAwg: "10",
      voltageDropV: 0.36,
      voltageDropPercent: 3,
      warnings: [],
      routePoints: [
        {
          x: -45,
          y: -70
        }
      ],
      routeMode: "manual",
      errors: []
    },
    {
      id: "rv12-pv-series",
      fromComponentId: "rv12-pv-1",
      fromTerminalId: "pv_pos",
      toComponentId: "rv12-pv-2",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "unknown",
      calculatedCurrentA: 12,
      recommendedCableAwg: "18",
      voltageDropV: 0.919,
      voltageDropPercent: 2.7,
      warnings: [],
      errors: []
    },
    {
      id: "rv12-pv-neg-to-mppt",
      fromComponentId: "rv12-pv-1",
      fromTerminalId: "pv_neg",
      toComponentId: "rv12-mppt",
      toTerminalId: "pv_neg",
      cableLengthFt: 12,
      busType: "pv_neg",
      calculatedCurrentA: 12,
      recommendedCableAwg: "14",
      voltageDropV: 0.727,
      voltageDropPercent: 2.14,
      warnings: [],
      routePoints: [
        {
          x: -245,
          y: -290
        },
        {
          x: 72,
          y: -290
        }
      ],
      routeMode: "manual",
      errors: []
    },
    {
      id: "rv12-pv-pos-to-mppt",
      fromComponentId: "rv12-pv-2",
      fromTerminalId: "pv_pos",
      toComponentId: "rv12-mppt",
      toTerminalId: "pv_pos",
      cableLengthFt: 12,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "14",
      voltageDropV: 0.727,
      voltageDropPercent: 2.14,
      warnings: [],
      routePoints: [
        {
          x: -35,
          y: -280
        },
        {
          x: 91,
          y: -280
        }
      ],
      routeMode: "manual",
      errors: [],
      recommendedFuseA: 20
    },
    {
      id: "conn-1783539219742-1",
      fromComponentId: "rv12-dcdc",
      fromTerminalId: "out_neg",
      toComponentId: "rv12-lynx",
      toTerminalId: "out_neg_3",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -24,
          y: -110
        },
        {
          x: 60,
          y: -110
        },
        {
          x: 60,
          y: 50
        },
        {
          x: -6,
          y: 50
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 30,
      recommendedCableAwg: "10",
      voltageDropV: 0.36,
      voltageDropPercent: 3,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783539221718-2",
      fromComponentId: "rv12-dcdc",
      fromTerminalId: "out_pos",
      toComponentId: "rv12-lynx",
      toTerminalId: "out_pos_3",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -35,
          y: -100
        },
        {
          x: 70,
          y: -100
        },
        {
          x: 70,
          y: 60
        },
        {
          x: -16,
          y: 60
        }
      ],
      routeMode: "manual",
      busType: "dc_pos",
      calculatedCurrentA: 30,
      recommendedFuseA: 40,
      recommendedCableAwg: "10",
      voltageDropV: 0.36,
      voltageDropPercent: 3,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783539238957-3",
      fromComponentId: "rv12-mppt",
      fromTerminalId: "bat_neg",
      toComponentId: "rv12-lynx",
      toTerminalId: "out_neg_2",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 128,
          y: 90
        },
        {
          x: -39,
          y: 90
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 60,
      recommendedCableAwg: "6",
      voltageDropV: 0.284,
      voltageDropPercent: 2.37,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783539240902-4",
      fromComponentId: "rv12-lynx",
      fromTerminalId: "out_pos_2",
      toComponentId: "rv12-mppt",
      toTerminalId: "bat_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -49,
          y: 80
        },
        {
          x: 209,
          y: 80
        }
      ],
      routeMode: "manual",
      busType: "dc_pos",
      calculatedCurrentA: 60,
      recommendedFuseA: 75,
      recommendedCableAwg: "6",
      voltageDropV: 0.284,
      voltageDropPercent: 2.37,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783539247566-5",
      fromComponentId: "rv12-lynx",
      fromTerminalId: "out_neg_1",
      toComponentId: "rv12-dc-load",
      toTerminalId: "dc_neg",
      cableLengthFt: 6,
      busType: "dc_neg",
      calculatedCurrentA: 20,
      recommendedCableAwg: "10",
      voltageDropV: 0.24,
      voltageDropPercent: 2,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783539249493-6",
      fromComponentId: "rv12-lynx",
      fromTerminalId: "out_pos_1",
      toComponentId: "rv12-dc-load",
      toTerminalId: "dc_pos",
      cableLengthFt: 6,
      busType: "dc_pos",
      calculatedCurrentA: 20,
      recommendedFuseA: 25,
      recommendedCableAwg: "10",
      voltageDropV: 0.24,
      voltageDropPercent: 2,
      warnings: [],
      errors: []
    },
    {
      id: "rv12-bat-1-to-lynx-neg",
      fromComponentId: "rv12-bat-1",
      fromTerminalId: "dc_neg",
      toComponentId: "rv12-lynx",
      toTerminalId: "main_neg",
      cableLengthFt: 6,
      busType: "dc_neg",
      calculatedCurrentA: 90,
      recommendedCableAwg: "4",
      voltageDropV: 0.269,
      voltageDropPercent: 2.1,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783636682856-7",
      fromComponentId: "rv12-bat-1",
      fromTerminalId: "dc_pos",
      toComponentId: "rv12-lynx",
      toTerminalId: "main_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -196,
          y: -45
        }
      ],
      routeMode: "auto",
      busType: "dc_pos",
      calculatedCurrentA: 90,
      recommendedFuseA: 125,
      recommendedCableAwg: "4",
      voltageDropV: 0.269,
      voltageDropPercent: 2.1,
      warnings: [],
      errors: []
    }
  ],
  annotations: []
};

const MEDIUM_24V: SystemDesign = {
  id: 'preset-24v-medium-rv',
  name: '24V Medium RV',
  nominalVoltage: 24,
  assumptions: { ...DEFAULT_SYSTEM.assumptions },
  createdAt: '2026-07-06T00:00:00.000Z',
  updatedAt: '2026-07-06T00:00:00.000Z',
  components: [
    { id: "rv24-bat-1", productId: "discover-aes-lithium-24-100", label: "House Battery 1", quantity: 1, x: -420, y: 120, includeInBom: true },
    { id: "rv24-bat-2", productId: "discover-aes-lithium-24-100", label: "House Battery 2", quantity: 1, x: -420, y: 280, includeInBom: true },
    { id: "rv24-pack-fuse", productId: "holder-class-t-1pos", label: "Main Battery Fuse", quantity: 1, x: -220, y: 120, includeInBom: true, fuseSlots: { slot_1: { installed: true, ratingA: 175 } } },
    { id: "rv24-pos-bus", productId: "dist-generic-busbar-5pt", label: "Positive Busbar", quantity: 1, x: 0, y: 120, includeInBom: true, busPolarity: "positive", inferredConnectionKind: "dc_power", inferredPolarity: "positive", inferredVoltageClass: "dc_low_voltage" },
    { id: "rv24-neg-bus", productId: "dist-generic-busbar-5pt", label: "Negative Busbar", quantity: 1, x: 0, y: 280, includeInBom: true, busPolarity: "negative", inferredConnectionKind: "dc_power", inferredPolarity: "negative", inferredVoltageClass: "dc_low_voltage" },
    { id: "rv24-inv-fuse", productId: "holder-class-t-1pos", label: "Inverter Fuse", quantity: 1, x: 220, y: 80, includeInBom: true, fuseSlots: { slot_1: { installed: true, ratingA: 175 } } },
    { id: "rv24-inverter", productId: "inv-vic-mp2-24-3000", label: "MultiPlus-II 24/3000", quantity: 1, x: 480, y: 120, includeInBom: true },
    { id: "rv24-ac-source", productId: "generic-generator-source", label: "Shore / Generator", quantity: 1, x: 240, y: 430, includeInBom: true, instanceVoltageV: 120, instanceMaxCurrentA: 30 },
    { id: "rv24-ac-load", productId: "acc-ac-load-generic", label: "AC Loads", quantity: 1, x: 720, y: 430, includeInBom: true, instanceVoltageV: 120, instanceMaxCurrentA: 20 },
    { id: "rv24-mppt", productId: "mppt-vic-150-60", label: "SmartSolar MPPT 150/60", quantity: 1, x: 240, y: -300, includeInBom: true },
    { id: "rv24-pv-1", productId: "solar-array-400w", label: "Solar Panel 1", quantity: 1, x: -520, y: -480, includeInBom: true },
    { id: "rv24-pv-2", productId: "solar-array-400w", label: "Solar Panel 2", quantity: 1, x: -360, y: -480, includeInBom: true },
    { id: "rv24-pv-3", productId: "solar-array-400w", label: "Solar Panel 3", quantity: 1, x: -520, y: -340, includeInBom: true },
    { id: "rv24-pv-4", productId: "solar-array-400w", label: "Solar Panel 4", quantity: 1, x: -360, y: -340, includeInBom: true },
    { id: "rv24-combiner", productId: "solar-combiner-2-string", label: "PV Combiner", quantity: 1, x: -80, y: -400, includeInBom: true },
    { id: "rv24-mppt-fuse", productId: "holder-midi-1pos-inline", label: "MPPT Fuse", quantity: 1, x: 40, y: -120, includeInBom: true, fuseSlots: { slot_1: { installed: true, ratingA: 80 } } },
    { id: "rv24-alternator", productId: "generic-alternator-source", label: "Vehicle Alternator", quantity: 1, x: -420, y: -80, includeInBom: true, instanceVoltageV: 12, instanceMaxCurrentA: 30 },
    { id: "rv24-dcdc-in-fuse", productId: "holder-midi-1pos-inline", label: "Alternator Input Fuse", quantity: 1, x: -240, y: -80, includeInBom: true, fuseSlots: { slot_1: { installed: true, ratingA: 30 } } },
    { id: "rv24-dcdc", productId: "orion-tr-smart-12-24-15-non-isolated", label: "Orion-Tr Smart 12/24-15A", quantity: 1, x: -40, y: -80, includeInBom: true },
    { id: "rv24-dcdc-out-fuse", productId: "holder-midi-1pos-inline", label: "DC-DC Output Fuse", quantity: 1, x: 160, y: -80, includeInBom: true, fuseSlots: { slot_1: { installed: true, ratingA: 30 } } },
    { id: "rv24-converter", productId: "orion-tr-24-12-30-converter", label: "24V to 12V Converter", quantity: 1, x: 260, y: 280, includeInBom: true },
    { id: "rv24-converter-input-fuse", productId: "holder-midi-1pos-inline", label: "Converter Input Fuse", quantity: 1, x: 120, y: 240, includeInBom: true, fuseSlots: { slot_1: { installed: true, ratingA: 20 } } },
    { id: "rv24-converter-fuse", productId: "holder-midi-1pos-inline", label: "12V Load Fuse", quantity: 1, x: 500, y: 280, includeInBom: true, fuseSlots: { slot_1: { installed: true, ratingA: 40 } } },
    { id: "rv24-dc-load", productId: "acc-dc-load-generic", label: "12V DC Loads", quantity: 1, x: 720, y: 280, includeInBom: true, instanceVoltageV: 12, instanceMaxCurrentA: 20 }
  ],
  connections: [
    { id: "rv24-bat-pos-link", fromComponentId: "rv24-bat-2", fromTerminalId: "dc_pos", toComponentId: "rv24-bat-1", toTerminalId: "dc_pos", cableLengthFt: 2 },
    { id: "rv24-bat-neg-link", fromComponentId: "rv24-bat-2", fromTerminalId: "dc_neg", toComponentId: "rv24-bat-1", toTerminalId: "dc_neg", cableLengthFt: 2 },
    { id: "rv24-bat-to-pack-fuse", fromComponentId: "rv24-bat-1", fromTerminalId: "dc_pos", toComponentId: "rv24-pack-fuse", toTerminalId: "in_pos", cableLengthFt: 2 },
    { id: "rv24-pack-fuse-to-pos-bus", fromComponentId: "rv24-pack-fuse", fromTerminalId: "out_pos", toComponentId: "rv24-pos-bus", toTerminalId: "terminal_1", cableLengthFt: 2 },
    { id: "rv24-bat-to-neg-bus", fromComponentId: "rv24-bat-1", fromTerminalId: "dc_neg", toComponentId: "rv24-neg-bus", toTerminalId: "terminal_1", cableLengthFt: 2 },
    { id: "rv24-pos-bus-to-inv-fuse", fromComponentId: "rv24-pos-bus", fromTerminalId: "terminal_2", toComponentId: "rv24-inv-fuse", toTerminalId: "in_pos", cableLengthFt: 3 },
    { id: "rv24-inv-fuse-to-inverter", fromComponentId: "rv24-inv-fuse", fromTerminalId: "out_pos", toComponentId: "rv24-inverter", toTerminalId: "dc_pos", cableLengthFt: 3 },
    { id: "rv24-inverter-neg", fromComponentId: "rv24-neg-bus", fromTerminalId: "terminal_2", toComponentId: "rv24-inverter", toTerminalId: "dc_neg", cableLengthFt: 6 },
    { id: "rv24-pv-s1-series", fromComponentId: "rv24-pv-1", fromTerminalId: "pv_pos", toComponentId: "rv24-pv-2", toTerminalId: "pv_neg", cableLengthFt: 6 },
    { id: "rv24-pv-s2-series", fromComponentId: "rv24-pv-3", fromTerminalId: "pv_pos", toComponentId: "rv24-pv-4", toTerminalId: "pv_neg", cableLengthFt: 6 },
    { id: "rv24-pv-s1-neg", fromComponentId: "rv24-pv-1", fromTerminalId: "pv_neg", toComponentId: "rv24-combiner", toTerminalId: "string_1_neg", cableLengthFt: 8 },
    { id: "rv24-pv-s1-pos", fromComponentId: "rv24-pv-2", fromTerminalId: "pv_pos", toComponentId: "rv24-combiner", toTerminalId: "string_1_pos", cableLengthFt: 8 },
    { id: "rv24-pv-s2-neg", fromComponentId: "rv24-pv-3", fromTerminalId: "pv_neg", toComponentId: "rv24-combiner", toTerminalId: "string_2_neg", cableLengthFt: 8 },
    { id: "rv24-pv-s2-pos", fromComponentId: "rv24-pv-4", fromTerminalId: "pv_pos", toComponentId: "rv24-combiner", toTerminalId: "string_2_pos", cableLengthFt: 8 },
    { id: "rv24-combiner-to-mppt-pos", fromComponentId: "rv24-combiner", fromTerminalId: "out_pos", toComponentId: "rv24-mppt", toTerminalId: "pv_pos", cableLengthFt: 12 },
    { id: "rv24-combiner-to-mppt-neg", fromComponentId: "rv24-combiner", fromTerminalId: "out_neg", toComponentId: "rv24-mppt", toTerminalId: "pv_neg", cableLengthFt: 12 },
    { id: "rv24-mppt-to-fuse", fromComponentId: "rv24-mppt", fromTerminalId: "bat_pos", toComponentId: "rv24-mppt-fuse", toTerminalId: "in_pos", cableLengthFt: 3 },
    { id: "rv24-mppt-fuse-to-bus", fromComponentId: "rv24-mppt-fuse", fromTerminalId: "out_pos", toComponentId: "rv24-pos-bus", toTerminalId: "terminal_3", cableLengthFt: 3 },
    { id: "rv24-mppt-neg", fromComponentId: "rv24-mppt", fromTerminalId: "bat_neg", toComponentId: "rv24-neg-bus", toTerminalId: "terminal_3", cableLengthFt: 4 },
    { id: "rv24-alt-to-input-fuse", fromComponentId: "rv24-alternator", fromTerminalId: "dc_pos", toComponentId: "rv24-dcdc-in-fuse", toTerminalId: "in_pos", cableLengthFt: 3 },
    { id: "rv24-input-fuse-to-dcdc", fromComponentId: "rv24-dcdc-in-fuse", fromTerminalId: "out_pos", toComponentId: "rv24-dcdc", toTerminalId: "in_pos", cableLengthFt: 3 },
    { id: "rv24-alt-neg-to-dcdc", fromComponentId: "rv24-alternator", fromTerminalId: "dc_neg", toComponentId: "rv24-dcdc", toTerminalId: "in_neg", cableLengthFt: 6 },
    { id: "rv24-dcdc-to-output-fuse", fromComponentId: "rv24-dcdc", fromTerminalId: "out_pos", toComponentId: "rv24-dcdc-out-fuse", toTerminalId: "in_pos", cableLengthFt: 3 },
    { id: "rv24-output-fuse-to-bus", fromComponentId: "rv24-dcdc-out-fuse", fromTerminalId: "out_pos", toComponentId: "rv24-pos-bus", toTerminalId: "terminal_4", cableLengthFt: 3 },
    { id: "rv24-dcdc-neg", fromComponentId: "rv24-dcdc", fromTerminalId: "out_neg", toComponentId: "rv24-neg-bus", toTerminalId: "terminal_4", cableLengthFt: 4 },
    { id: "rv24-pos-bus-to-converter", fromComponentId: "rv24-pos-bus", fromTerminalId: "terminal_5", toComponentId: "rv24-converter-input-fuse", toTerminalId: "in_pos", cableLengthFt: 2 },
    { id: "rv24-converter-input-fuse-to-converter", fromComponentId: "rv24-converter-input-fuse", fromTerminalId: "out_pos", toComponentId: "rv24-converter", toTerminalId: "in_pos", cableLengthFt: 2 },
    { id: "rv24-converter-neg", fromComponentId: "rv24-neg-bus", fromTerminalId: "terminal_5", toComponentId: "rv24-converter", toTerminalId: "in_neg", cableLengthFt: 4 },
    { id: "rv24-converter-to-load-fuse", fromComponentId: "rv24-converter", fromTerminalId: "out_pos", toComponentId: "rv24-converter-fuse", toTerminalId: "in_pos", cableLengthFt: 3 },
    { id: "rv24-load-fuse-to-load", fromComponentId: "rv24-converter-fuse", fromTerminalId: "out_pos", toComponentId: "rv24-dc-load", toTerminalId: "dc_pos", cableLengthFt: 4 },
    { id: "rv24-load-neg", fromComponentId: "rv24-converter", fromTerminalId: "out_neg", toComponentId: "rv24-dc-load", toTerminalId: "dc_neg", cableLengthFt: 4 },
    { id: "rv24-ac-source-l", fromComponentId: "rv24-ac-source", fromTerminalId: "ac_l", toComponentId: "rv24-inverter", toTerminalId: "ac_in_l", cableLengthFt: 10 },
    { id: "rv24-ac-source-n", fromComponentId: "rv24-ac-source", fromTerminalId: "ac_n", toComponentId: "rv24-inverter", toTerminalId: "ac_in_n", cableLengthFt: 10 },
    { id: "rv24-ac-load-l", fromComponentId: "rv24-inverter", fromTerminalId: "ac_out_l", toComponentId: "rv24-ac-load", toTerminalId: "ac_l", cableLengthFt: 15 },
    { id: "rv24-ac-load-n", fromComponentId: "rv24-inverter", fromTerminalId: "ac_out_n", toComponentId: "rv24-ac-load", toTerminalId: "ac_n", cableLengthFt: 15 }
  ],
  annotations: [],
};

const OFFGRID_48V: SystemDesign = {
  id: "sys-1783976129919-27",
  name: "48V Stationary",
  nominalVoltage: 48,
  assumptions: {
    inverterEfficiency: 0.92,
    defaultOemDiscountPercent: 30,
    defaultCableLengthFt: 6,
    maxVoltageDropPercent: 3,
    continuousLoadMultiplier: 1.25,
    batteryInterconnectMaxLengthFt: 3
  },
  createdAt: "2026-07-13T20:55:29.919Z",
  updatedAt: "2026-07-13T20:55:41.420Z",
  components: [
    {
      id: "comp-1782867357091-6",
      productId: "discover-helios-ess-52-48-16000",
      label: "HELIOS ESS 52-48-16000",
      quantity: 1,
      x: 40,
      y: -400,
      includeInBom: true,
      imageScale: 1.5,
      configuredProtocols: {
        can_out: "Pylon LV"
      }
    },
    {
      id: "comp-1782867372239-9",
      productId: "discover-helios-ess-52-48-16000",
      label: "HELIOS ESS 52-48-16000 Copy",
      quantity: 1,
      x: 200,
      y: -400,
      includeInBom: true,
      imageScale: 1.5,
      configuredProtocols: {
        can_out: "Pylon LV"
      },
      locked: false
    },
    {
      id: "comp-1782867373333-10",
      productId: "discover-helios-ess-52-48-16000",
      label: "HELIOS ESS 52-48-16000 Copy Copy",
      quantity: 1,
      x: 360,
      y: -400,
      includeInBom: true,
      imageScale: 1.5,
      configuredProtocols: {
        can_out: "Pylon LV"
      },
      locked: false
    },
    {
      id: "comp-1782867470682-15",
      productId: "megarevo-12kw-hybrid-inverter",
      label: "Megarevo 12kW Hybrid Inverter",
      quantity: 1,
      x: 200,
      y: -1080,
      includeInBom: true,
      imageScale: 1.4240385536726292
    },
    {
      id: "comp-1782867508123-18",
      productId: "holder-class-t-1pos",
      label: "Battery Fuse",
      quantity: 1,
      x: 260,
      y: -580,
      rotationDeg: 180,
      includeInBom: true,
      fuseSlots: {
        slot_1: {
          installed: true,
          ratingA: 350
        }
      },
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782867565808-42",
      productId: "solar-array-400w",
      label: "PV String 1 Panel 1",
      quantity: 1,
      x: 440,
      y: -1440,
      includeInBom: true
    },
    {
      id: "comp-1782867576760-61",
      productId: "solar-array-400w",
      label: "PV String 1 Panel 2",
      quantity: 1,
      x: 580,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867578965-74",
      productId: "solar-array-400w",
      label: "PV String 1 Panel 3",
      quantity: 1,
      x: 720,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867580526-87",
      productId: "solar-array-400w",
      label: "PV String 1 Panel 4",
      quantity: 1,
      x: 860,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867581782-100",
      productId: "solar-array-400w",
      label: "PV String 1 Panel 5",
      quantity: 1,
      x: 1000,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867583785-113",
      productId: "solar-array-400w",
      label: "PV String 1 Panel 6",
      quantity: 1,
      x: 1140,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867633532-193",
      productId: "solar-array-400w",
      label: "PV String 1 Panel 7",
      quantity: 1,
      x: 1280,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867634822-204",
      productId: "solar-array-400w",
      label: "PV String 1 Panel 8",
      quantity: 1,
      x: 1420,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-262",
      productId: "solar-array-400w",
      label: "PV String 2 Panel 1",
      quantity: 1,
      x: 440,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-263",
      productId: "solar-array-400w",
      label: "PV String 2 Panel 2",
      quantity: 1,
      x: 580,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-264",
      productId: "solar-array-400w",
      label: "PV String 2 Panel 3",
      quantity: 1,
      x: 720,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-265",
      productId: "solar-array-400w",
      label: "PV String 2 Panel 4",
      quantity: 1,
      x: 860,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-266",
      productId: "solar-array-400w",
      label: "PV String 2 Panel 5",
      quantity: 1,
      x: 1000,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-267",
      productId: "solar-array-400w",
      label: "PV String 2 Panel 6",
      quantity: 1,
      x: 1140,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-268",
      productId: "solar-array-400w",
      label: "PV String 2 Panel 7",
      quantity: 1,
      x: 1280,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-269",
      productId: "solar-array-400w",
      label: "PV String 2 Panel 8",
      quantity: 1,
      x: 1420,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867847805-433",
      productId: "breaker-ac-din-2p-50a",
      label: "AC Breaker",
      quantity: 1,
      x: 620,
      y: -680,
      includeInBom: true
    },
    {
      id: "comp-1782867851040-440",
      productId: "breaker-ac-din-2p-50a",
      label: "AC Breaker Copy",
      quantity: 1,
      x: 700,
      y: -680,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867852273-453",
      productId: "breaker-ac-din-2p-40a",
      label: "AC Breaker Copy Copy",
      quantity: 1,
      x: 780,
      y: -680,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867869646-470",
      productId: "generic-grid-source-240v",
      label: "Grid",
      quantity: 1,
      x: 980,
      y: -400,
      includeInBom: true,
      instanceVoltageV: 240,
      instanceMaxCurrentA: 40,
      rotationDeg: 180,
      availableFaultCurrentA: 5000
    },
    {
      id: "comp-1782867874813-497",
      productId: "generic-grid-source-240v",
      label: "Generator",
      quantity: 1,
      x: 980,
      y: -500,
      includeInBom: true,
      instanceVoltageV: 240,
      instanceMaxCurrentA: 40,
      rotationDeg: 180,
      locked: false,
      availableFaultCurrentA: 5000
    },
    {
      id: "comp-1782867890071-533",
      productId: "acc-ac-load-split-phase-240v",
      label: "AC Loads",
      quantity: 1,
      x: 980,
      y: -600,
      includeInBom: true,
      instanceVoltageV: 240,
      instanceMaxCurrentA: 30
    }
  ],
  connections: [
    {
      id: "conn-1782867378284-11",
      fromComponentId: "comp-1782867372239-9",
      fromTerminalId: "dc_neg_1",
      toComponentId: "comp-1782867373333-10",
      toTerminalId: "dc_neg_1",
      cableLengthFt: 2,
      busType: "dc_neg",
      calculatedCurrentA: 166.66666666666666,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.033,
      voltageDropPercent: 0.07,
      warnings: [],
      routePoints: [
        {
          x: 130,
          y: -493
        },
        {
          x: 130,
          y: -520
        },
        {
          x: 290,
          y: -520
        },
        {
          x: 290,
          y: -493
        }
      ],
      routeMode: "manual",
      errors: []
    },
    {
      id: "conn-1782867380620-12",
      fromComponentId: "comp-1782867372239-9",
      fromTerminalId: "dc_neg_2",
      toComponentId: "comp-1782867357091-6",
      toTerminalId: "dc_neg_1",
      cableLengthFt: 2,
      routePoints: [
        {
          x: 130,
          y: -482.5
        },
        {
          x: 130,
          y: -520
        },
        {
          x: -30,
          y: -520
        },
        {
          x: -30,
          y: -493
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 83.33333333333333,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.016,
      voltageDropPercent: 0.03,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867449410-13",
      fromComponentId: "comp-1782867357091-6",
      fromTerminalId: "dc_pos_1",
      toComponentId: "comp-1782867372239-9",
      toTerminalId: "dc_pos_2",
      cableLengthFt: 2,
      routePoints: [
        {
          x: 110,
          y: -493
        },
        {
          x: 110,
          y: -530
        },
        {
          x: 270,
          y: -530
        },
        {
          x: 270,
          y: -482.5
        }
      ],
      routeMode: "manual",
      busType: "dc_pos",
      calculatedCurrentA: 83.33333333333333,
      recommendedFuseA: 100,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.016,
      voltageDropPercent: 0.03,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867450835-14",
      fromComponentId: "comp-1782867372239-9",
      fromTerminalId: "dc_pos_1",
      toComponentId: "comp-1782867373333-10",
      toTerminalId: "dc_pos_2",
      cableLengthFt: 2,
      routePoints: [
        {
          x: 270,
          y: -493
        },
        {
          x: 270,
          y: -530
        },
        {
          x: 417,
          y: -530
        }
      ],
      routeMode: "manual",
      busType: "dc_pos",
      calculatedCurrentA: 166.66666666666666,
      recommendedFuseA: 200,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.033,
      voltageDropPercent: 0.07,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867485840-16",
      fromComponentId: "comp-1782867357091-6",
      fromTerminalId: "dc_neg_2",
      toComponentId: "comp-1782867470682-15",
      toTerminalId: "dc_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -30,
          y: -482.5
        },
        {
          x: -30,
          y: -560
        },
        {
          x: 115.98172533331487,
          y: -560
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 250,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.147,
      voltageDropPercent: 0.31,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867508124-19",
      fromComponentId: "comp-1782867373333-10",
      fromTerminalId: "dc_pos_1",
      toComponentId: "comp-1782867508123-18",
      toTerminalId: "in_pos",
      cableLengthFt: 3,
      routePoints: [
        {
          x: 417,
          y: -580
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 250,
      recommendedFuseA: 300,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.074,
      voltageDropPercent: 0.15,
      warnings: [],
      routeMode: "manual",
      errors: []
    },
    {
      id: "conn-1782867508124-20",
      fromComponentId: "comp-1782867508123-18",
      fromTerminalId: "out_pos",
      toComponentId: "comp-1782867470682-15",
      toTerminalId: "dc_pos",
      cableLengthFt: 3,
      routePoints: [
        {
          x: 133.0701879773864,
          y: -580
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 250,
      recommendedFuseA: 300,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.074,
      voltageDropPercent: 0.15,
      warnings: [],
      routeMode: "manual",
      errors: []
    },
    {
      id: "conn-1782867543784-21",
      fromComponentId: "comp-1782867357091-6",
      fromTerminalId: "port_lynk_2",
      toComponentId: "comp-1782867372239-9",
      toTerminalId: "port_lynk_1",
      cableLengthFt: 6,
      wireKind: "communication",
      busType: "communication",
      calculatedCurrentA: 0,
      voltageDropV: 0,
      voltageDropPercent: 0,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867544854-25",
      fromComponentId: "comp-1782867372239-9",
      fromTerminalId: "port_lynk_2",
      toComponentId: "comp-1782867373333-10",
      toTerminalId: "port_lynk_1",
      cableLengthFt: 6,
      wireKind: "communication",
      busType: "communication",
      calculatedCurrentA: 0,
      voltageDropV: 0,
      voltageDropPercent: 0,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867550632-29",
      fromComponentId: "comp-1782867373333-10",
      fromTerminalId: "can_out",
      toComponentId: "comp-1782867470682-15",
      toTerminalId: "comm",
      cableLengthFt: 6,
      wireKind: "communication",
      routePoints: [
        {
          x: 364.5,
          y: -610
        },
        {
          x: 228.4807710734526,
          y: -610
        }
      ],
      routeMode: "manual",
      busType: "communication",
      calculatedCurrentA: 0,
      voltageDropV: 0,
      voltageDropPercent: 0,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867587110-126",
      fromComponentId: "comp-1782867565808-42",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867576760-61",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867588024-133",
      fromComponentId: "comp-1782867576760-61",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867578965-74",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867589005-140",
      fromComponentId: "comp-1782867578965-74",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867580526-87",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867589947-147",
      fromComponentId: "comp-1782867580526-87",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867581782-100",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867590878-154",
      fromComponentId: "comp-1782867581782-100",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867583785-113",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867594293-161",
      fromComponentId: "comp-1782867565808-42",
      fromTerminalId: "pv_neg",
      toComponentId: "comp-1782867470682-15",
      toTerminalId: "pv2_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 415,
          y: -1370
        },
        {
          x: 340,
          y: -1370
        },
        {
          x: 340,
          y: -1050
        },
        {
          x: 312.4990457401377,
          y: -1050
        }
      ],
      routeMode: "manual",
      busType: "pv_neg",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867639237-223",
      fromComponentId: "comp-1782867633532-193",
      fromTerminalId: "pv_neg",
      toComponentId: "comp-1782867583785-113",
      toTerminalId: "pv_pos",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867640355-230",
      fromComponentId: "comp-1782867633532-193",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867634822-204",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867642128-237",
      fromComponentId: "comp-1782867634822-204",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867470682-15",
      toTerminalId: "pv2_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 1445,
          y: -1350
        },
        {
          x: 350,
          y: -1350
        },
        {
          x: 350,
          y: -1067.1836530169464
        }
      ],
      routeMode: "manual",
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867664424-298",
      fromComponentId: "comp-1782867650658-262",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-263",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867665355-305",
      fromComponentId: "comp-1782867650658-263",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-264",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867666228-312",
      fromComponentId: "comp-1782867650658-264",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-265",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867669362-319",
      fromComponentId: "comp-1782867650658-265",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-266",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867670567-326",
      fromComponentId: "comp-1782867650658-266",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-267",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867672200-333",
      fromComponentId: "comp-1782867650658-267",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-268",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867673203-340",
      fromComponentId: "comp-1782867650658-268",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-269",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867676780-347",
      fromComponentId: "comp-1782867650658-262",
      fromTerminalId: "pv_neg",
      toComponentId: "comp-1782867470682-15",
      toTerminalId: "pv1_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 415,
          y: -1200
        },
        {
          x: 360,
          y: -1200
        },
        {
          x: 360,
          y: -1013.0701879773865
        }
      ],
      routeMode: "manual",
      busType: "pv_neg",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867680799-354",
      fromComponentId: "comp-1782867650658-269",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867470682-15",
      toTerminalId: "pv1_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 1445,
          y: -1180
        },
        {
          x: 370,
          y: -1180
        },
        {
          x: 370,
          y: -1031.5826891751306
        }
      ],
      routeMode: "manual",
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      recommendedFuseA: 20,
      errors: []
    },
    {
      id: "conn-1782867906434-556",
      fromComponentId: "comp-1782867470682-15",
      fromTerminalId: "ac_out_l2",
      toComponentId: "comp-1782867852273-453",
      toTerminalId: "l2_in",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 279.7461590056672,
          y: -860
        },
        {
          x: 792.6,
          y: -860
        }
      ],
      routeMode: "manual",
      busType: "ac_line2",
      calculatedCurrentA: 30,
      recommendedFuseA: 35,
      recommendedCableAwg: "10",
      voltageDropV: 0.36,
      voltageDropPercent: 0.15,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867909335-563",
      fromComponentId: "comp-1782867470682-15",
      fromTerminalId: "ac_out_l1",
      toComponentId: "comp-1782867852273-453",
      toTerminalId: "l1_in",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 255.53750359323254,
          y: -840
        },
        {
          x: 767.4,
          y: -840
        }
      ],
      routeMode: "manual",
      busType: "ac_line",
      calculatedCurrentA: 30,
      recommendedFuseA: 35,
      recommendedCableAwg: "10",
      voltageDropV: 0.36,
      voltageDropPercent: 0.15,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867911464-570",
      fromComponentId: "comp-1782867470682-15",
      fromTerminalId: "ac_gen_l2",
      toComponentId: "comp-1782867851040-440",
      toTerminalId: "l2_out",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 204.2721156610179,
          y: -790
        },
        {
          x: 712.6,
          y: -790
        }
      ],
      routeMode: "manual",
      busType: "ac_line2",
      calculatedCurrentA: 40,
      recommendedCableAwg: "10",
      voltageDropV: 0.48,
      voltageDropPercent: 0.2,
      warnings: [],
      errors: [],
      recommendedFuseA: 50
    },
    {
      id: "conn-1782867913734-577",
      fromComponentId: "comp-1782867470682-15",
      fromTerminalId: "ac_gen_l1",
      toComponentId: "comp-1782867851040-440",
      toTerminalId: "l1_out",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 187.18365301694632,
          y: -810
        },
        {
          x: 687.4,
          y: -810
        }
      ],
      routeMode: "manual",
      busType: "ac_line",
      calculatedCurrentA: 40,
      recommendedCableAwg: "10",
      voltageDropV: 0.48,
      voltageDropPercent: 0.2,
      warnings: [],
      errors: [],
      recommendedFuseA: 50
    },
    {
      id: "conn-1782867915172-584",
      fromComponentId: "comp-1782867847805-433",
      fromTerminalId: "l1_out",
      toComponentId: "comp-1782867470682-15",
      toTerminalId: "ac_grid_l1",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 607.4,
          y: -750
        },
        {
          x: 154.43076628247587,
          y: -750
        }
      ],
      routeMode: "manual",
      busType: "ac_line",
      calculatedCurrentA: 40,
      recommendedCableAwg: "10",
      voltageDropV: 0.48,
      voltageDropPercent: 0.2,
      warnings: [],
      errors: [],
      recommendedFuseA: 50
    },
    {
      id: "conn-1782867917896-591",
      fromComponentId: "comp-1782867470682-15",
      fromTerminalId: "ac_grid_l2",
      toComponentId: "comp-1782867847805-433",
      toTerminalId: "l2_out",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 170.09519037287478,
          y: -770
        },
        {
          x: 632.6,
          y: -770
        }
      ],
      routeMode: "manual",
      busType: "ac_line2",
      calculatedCurrentA: 40,
      recommendedCableAwg: "10",
      voltageDropV: 0.48,
      voltageDropPercent: 0.2,
      warnings: [],
      errors: [],
      recommendedFuseA: 50
    },
    {
      id: "conn-1782867963537-704",
      fromComponentId: "comp-1782867852273-453",
      fromTerminalId: "l2_out",
      toComponentId: "comp-1782867890071-533",
      toTerminalId: "ac_l2",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 792.6,
          y: -600
        }
      ],
      routeMode: "manual",
      busType: "ac_line2",
      calculatedCurrentA: 30,
      recommendedFuseA: 35,
      recommendedCableAwg: "10",
      voltageDropV: 0.36,
      voltageDropPercent: 0.15,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867965325-711",
      fromComponentId: "comp-1782867852273-453",
      fromTerminalId: "l1_out",
      toComponentId: "comp-1782867890071-533",
      toTerminalId: "ac_l1",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 767.4,
          y: -610
        },
        {
          x: 1170,
          y: -610
        }
      ],
      routeMode: "manual",
      busType: "ac_line",
      calculatedCurrentA: 30,
      recommendedFuseA: 35,
      recommendedCableAwg: "10",
      voltageDropV: 0.36,
      voltageDropPercent: 0.15,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867979043-742",
      fromComponentId: "comp-1782867851040-440",
      fromTerminalId: "l2_in",
      toComponentId: "comp-1782867874813-497",
      toTerminalId: "ac_l2",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 712.6,
          y: -500
        }
      ],
      routeMode: "auto",
      busType: "ac_line2",
      calculatedCurrentA: 40,
      recommendedFuseA: 50,
      recommendedCableAwg: "10",
      voltageDropV: 0.48,
      voltageDropPercent: 0.2,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867980793-749",
      fromComponentId: "comp-1782867874813-497",
      fromTerminalId: "ac_l1",
      toComponentId: "comp-1782867851040-440",
      toTerminalId: "l1_in",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 687.4,
          y: -516
        }
      ],
      routeMode: "auto",
      busType: "ac_line",
      calculatedCurrentA: 40,
      recommendedFuseA: 50,
      recommendedCableAwg: "10",
      voltageDropV: 0.48,
      voltageDropPercent: 0.2,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867982316-756",
      fromComponentId: "comp-1782867847805-433",
      fromTerminalId: "l2_in",
      toComponentId: "comp-1782867869646-470",
      toTerminalId: "ac_l2",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 632.6,
          y: -400
        }
      ],
      routeMode: "auto",
      busType: "ac_line2",
      calculatedCurrentA: 40,
      recommendedFuseA: 50,
      recommendedCableAwg: "10",
      voltageDropV: 0.48,
      voltageDropPercent: 0.2,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867983843-763",
      fromComponentId: "comp-1782867869646-470",
      fromTerminalId: "ac_l1",
      toComponentId: "comp-1782867847805-433",
      toTerminalId: "l1_in",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 607.4,
          y: -416
        }
      ],
      routeMode: "auto",
      busType: "ac_line",
      calculatedCurrentA: 40,
      recommendedFuseA: 50,
      recommendedCableAwg: "10",
      voltageDropV: 0.48,
      voltageDropPercent: 0.2,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867986280-770",
      fromComponentId: "comp-1782867470682-15",
      fromTerminalId: "ac_out_n",
      toComponentId: "comp-1782867890071-533",
      toTerminalId: "ac_n",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 268.3538505762862,
          y: -850
        },
        {
          x: 820,
          y: -850
        },
        {
          x: 820,
          y: -584
        }
      ],
      routeMode: "manual",
      busType: "ac_neutral",
      calculatedCurrentA: 30,
      recommendedCableAwg: "12",
      voltageDropV: 0.572,
      voltageDropPercent: 0.48,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867988467-777",
      fromComponentId: "comp-1782867470682-15",
      fromTerminalId: "ac_gen_n",
      toComponentId: "comp-1782867874813-497",
      toTerminalId: "ac_n",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 195.7278843389821,
          y: -800
        },
        {
          x: 730,
          y: -800
        },
        {
          x: 730,
          y: -520
        },
        {
          x: 930,
          y: -520
        }
      ],
      routeMode: "manual",
      busType: "ac_neutral",
      calculatedCurrentA: 40,
      recommendedCableAwg: "10",
      voltageDropV: 0.48,
      voltageDropPercent: 0.4,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1782867991317-784",
      fromComponentId: "comp-1782867470682-15",
      fromTerminalId: "ac_grid_n",
      toComponentId: "comp-1782867869646-470",
      toTerminalId: "ac_n",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 162.97499760451166,
          y: -760
        },
        {
          x: 650,
          y: -760
        },
        {
          x: 650,
          y: -384
        }
      ],
      routeMode: "manual",
      busType: "ac_neutral",
      calculatedCurrentA: 40,
      recommendedCableAwg: "10",
      voltageDropV: 0.48,
      voltageDropPercent: 0.4,
      warnings: [],
      errors: []
    }
  ],
  annotations: []
};

export const FULL_12V: SystemDesign = {
  id: "sys-1783960957666-8",
  name: "24V Medium RV",
  nominalVoltage: 24,
  assumptions: {
    inverterEfficiency: 0.92,
    defaultOemDiscountPercent: 30,
    defaultCableLengthFt: 6,
    maxVoltageDropPercent: 3,
    continuousLoadMultiplier: 1.25,
    batteryInterconnectMaxLengthFt: 3
  },
  createdAt: "2026-07-13T16:42:37.666Z",
  updatedAt: "2026-07-13T18:30:42.927Z",
  components: [
    {
      id: "rv24-bat-1",
      productId: "discover-aes-lithium-24-100",
      label: "House Battery 1",
      quantity: 1,
      x: -420,
      y: 120,
      includeInBom: true
    },
    {
      id: "rv24-bat-2",
      productId: "discover-aes-lithium-24-100",
      label: "House Battery 2",
      quantity: 1,
      x: -420,
      y: 360,
      includeInBom: true
    },
    {
      id: "rv24-pack-fuse",
      productId: "holder-class-t-1pos",
      label: "Main Battery Fuse",
      quantity: 1,
      x: -220,
      y: 120,
      includeInBom: true,
      fuseSlots: {
        slot_1: {
          installed: true,
          ratingA: 175
        }
      }
    },
    {
      id: "rv24-pos-bus",
      productId: "dist-generic-busbar-5pt",
      label: "Positive Busbar",
      quantity: 1,
      x: 0,
      y: 120,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "rv24-neg-bus",
      productId: "dist-generic-busbar-5pt",
      label: "Negative Busbar",
      quantity: 1,
      x: 0,
      y: 280,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "negative",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "rv24-inv-fuse",
      productId: "holder-class-t-1pos",
      label: "Inverter Fuse",
      quantity: 1,
      x: 220,
      y: 80,
      includeInBom: true,
      fuseSlots: {
        slot_1: {
          installed: true,
          ratingA: 175
        }
      }
    },
    {
      id: "rv24-inverter",
      productId: "inv-vic-mp2-24-3000",
      label: "MultiPlus-II 24/3000",
      quantity: 1,
      x: 520,
      y: 80,
      includeInBom: true,
      imageScale: 2
    },
    {
      id: "rv24-ac-source",
      productId: "generic-generator-source",
      label: "Shore / Generator",
      quantity: 1,
      x: 240,
      y: 430,
      includeInBom: true,
      instanceVoltageV: 120,
      instanceMaxCurrentA: 30
    },
    {
      id: "rv24-ac-load",
      productId: "acc-ac-load-generic",
      label: "AC Loads",
      quantity: 1,
      x: 720,
      y: 430,
      includeInBom: true,
      instanceVoltageV: 120,
      instanceMaxCurrentA: 20
    },
    {
      id: "rv24-mppt",
      productId: "mppt-vic-150-60",
      label: "SmartSolar MPPT 150/60",
      quantity: 1,
      x: 240,
      y: -300,
      includeInBom: true
    },
    {
      id: "rv24-pv-1",
      productId: "solar-array-400w",
      label: "Solar Panel 1",
      quantity: 1,
      x: 460,
      y: -500,
      includeInBom: true
    },
    {
      id: "rv24-pv-2",
      productId: "solar-array-400w",
      label: "Solar Panel 2",
      quantity: 1,
      x: 600,
      y: -500,
      includeInBom: true
    },
    {
      id: "rv24-pv-3",
      productId: "solar-array-400w",
      label: "Solar Panel 3",
      quantity: 1,
      x: 160,
      y: -500,
      includeInBom: true
    },
    {
      id: "rv24-pv-4",
      productId: "solar-array-400w",
      label: "Solar Panel 4",
      quantity: 1,
      x: 300,
      y: -500,
      includeInBom: true
    },
    {
      id: "rv24-mppt-fuse",
      productId: "holder-midi-1pos-inline",
      label: "MPPT Fuse",
      quantity: 1,
      x: 40,
      y: -120,
      includeInBom: true,
      fuseSlots: {
        slot_1: {
          installed: true,
          ratingA: 80
        }
      }
    },
    {
      id: "rv24-alternator",
      productId: "generic-alternator-source",
      label: "Vehicle Alternator",
      quantity: 1,
      x: -420,
      y: -80,
      includeInBom: true,
      instanceVoltageV: 12,
      instanceMaxCurrentA: 30
    },
    {
      id: "rv24-dcdc-in-fuse",
      productId: "holder-midi-1pos-inline",
      label: "Alternator Input Fuse",
      quantity: 1,
      x: -240,
      y: -80,
      includeInBom: true,
      fuseSlots: {
        slot_1: {
          installed: true,
          ratingA: 40,
          fuseProductId: "fuse-midi-40a"
        }
      }
    },
    {
      id: "rv24-dcdc",
      productId: "orion-tr-smart-12-24-15-non-isolated",
      label: "Orion-Tr Smart 12/24-15A",
      quantity: 1,
      x: -40,
      y: -80,
      includeInBom: true
    },
    {
      id: "rv24-dcdc-out-fuse",
      productId: "holder-midi-1pos-inline",
      label: "DC-DC Output Fuse",
      quantity: 1,
      x: 160,
      y: -80,
      includeInBom: true,
      fuseSlots: {
        slot_1: {
          installed: true,
          ratingA: 30
        }
      }
    },
    {
      id: "rv24-converter",
      productId: "orion-tr-24-12-30-converter",
      label: "24V to 12V Converter",
      quantity: 1,
      x: 320,
      y: 160,
      includeInBom: true
    },
    {
      id: "rv24-converter-fuse",
      productId: "holder-midi-1pos-inline",
      label: "12V Load Fuse",
      quantity: 1,
      x: 500,
      y: 280,
      includeInBom: true,
      fuseSlots: {
        slot_1: {
          installed: true,
          ratingA: 40
        }
      }
    },
    {
      id: "rv24-dc-load",
      productId: "acc-dc-load-generic",
      label: "12V DC Loads",
      quantity: 1,
      x: 720,
      y: 280,
      includeInBom: true,
      instanceVoltageV: 12,
      instanceMaxCurrentA: 20
    },
    {
      id: "comp-1783960964189-9",
      productId: "holder-class-t-1pos",
      label: "Battery Pack Fuse",
      quantity: 1,
      x: 160,
      y: 220,
      rotationDeg: 0,
      includeInBom: true,
      fuseSlots: {
        slot_1: {
          installed: true,
          ratingA: 35
        }
      }
    },
    {
      id: "comp-1783967279148-2",
      productId: "solar-branch-2-1",
      label: "2-1 PV Branch Connector",
      quantity: 1,
      x: 340,
      y: -300,
      includeInBom: true,
      inferredConnectionKind: "pv_power",
      inferredPolarity: "negative",
      inferredVoltageClass: "pv_high_voltage"
    },
    {
      id: "comp-1783967366891-6",
      productId: "solar-branch-2-1",
      label: "2-1 PV Branch Connector Copy",
      quantity: 1,
      x: 420,
      y: -300,
      includeInBom: true,
      locked: false,
      inferredConnectionKind: "pv_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "pv_high_voltage"
    }
  ],
  connections: [
    {
      id: "rv24-bat-pos-link",
      fromComponentId: "rv24-bat-2",
      fromTerminalId: "dc_pos",
      toComponentId: "rv24-bat-1",
      toTerminalId: "dc_pos",
      cableLengthFt: 2,
      busType: "dc_pos",
      calculatedCurrentA: 72.5,
      recommendedFuseA: 80,
      recommendedCableAwg: "1",
      voltageDropV: 0.036,
      voltageDropPercent: 0.15,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-bat-neg-link",
      fromComponentId: "rv24-bat-2",
      fromTerminalId: "dc_neg",
      toComponentId: "rv24-bat-1",
      toTerminalId: "dc_neg",
      cableLengthFt: 2,
      busType: "dc_neg",
      calculatedCurrentA: 72.5,
      recommendedCableAwg: "1",
      voltageDropV: 0.036,
      voltageDropPercent: 0.15,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-bat-to-pack-fuse",
      fromComponentId: "rv24-bat-1",
      fromTerminalId: "dc_pos",
      toComponentId: "rv24-pack-fuse",
      toTerminalId: "in_pos",
      cableLengthFt: 2,
      busType: "dc_pos",
      calculatedCurrentA: 145,
      recommendedFuseA: 175,
      recommendedCableAwg: "1",
      voltageDropV: 0.072,
      voltageDropPercent: 0.3,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-pack-fuse-to-pos-bus",
      fromComponentId: "rv24-pack-fuse",
      fromTerminalId: "out_pos",
      toComponentId: "rv24-pos-bus",
      toTerminalId: "terminal_1",
      cableLengthFt: 2,
      busType: "dc_pos",
      calculatedCurrentA: 145,
      recommendedFuseA: 175,
      recommendedCableAwg: "1",
      voltageDropV: 0.072,
      voltageDropPercent: 0.3,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-pos-bus-to-inv-fuse",
      fromComponentId: "rv24-pos-bus",
      fromTerminalId: "terminal_2",
      toComponentId: "rv24-inv-fuse",
      toTerminalId: "in_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 130,
      recommendedFuseA: 150,
      recommendedCableAwg: "1",
      voltageDropV: 0.097,
      voltageDropPercent: 0.4,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-inv-fuse-to-inverter",
      fromComponentId: "rv24-inv-fuse",
      fromTerminalId: "out_pos",
      toComponentId: "rv24-inverter",
      toTerminalId: "dc_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 130,
      recommendedFuseA: 150,
      recommendedCableAwg: "1",
      voltageDropV: 0.097,
      voltageDropPercent: 0.4,
      warnings: [],
      errors: [],
      routePoints: [
        {
          x: 400,
          y: 80
        },
        {
          x: 400,
          y: 240
        },
        {
          x: 470,
          y: 240
        }
      ],
      routeMode: "manual"
    },
    {
      id: "rv24-inverter-neg",
      fromComponentId: "rv24-neg-bus",
      fromTerminalId: "terminal_2",
      toComponentId: "rv24-inverter",
      toTerminalId: "dc_neg",
      cableLengthFt: 6,
      busType: "dc_neg",
      calculatedCurrentA: 130,
      recommendedCableAwg: "1",
      voltageDropV: 0.193,
      voltageDropPercent: 0.81,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-pv-s1-series",
      fromComponentId: "rv24-pv-1",
      fromTerminalId: "pv_pos",
      toComponentId: "rv24-pv-2",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedFuseA: 20,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-pv-s2-series",
      fromComponentId: "rv24-pv-3",
      fromTerminalId: "pv_pos",
      toComponentId: "rv24-pv-4",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedFuseA: 20,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-mppt-to-fuse",
      fromComponentId: "rv24-mppt",
      fromTerminalId: "bat_pos",
      toComponentId: "rv24-mppt-fuse",
      toTerminalId: "in_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 60,
      recommendedFuseA: 70,
      recommendedCableAwg: "6",
      voltageDropV: 0.142,
      voltageDropPercent: 0.59,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-mppt-fuse-to-bus",
      fromComponentId: "rv24-mppt-fuse",
      fromTerminalId: "out_pos",
      toComponentId: "rv24-pos-bus",
      toTerminalId: "terminal_3",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 60,
      recommendedFuseA: 70,
      recommendedCableAwg: "6",
      voltageDropV: 0.142,
      voltageDropPercent: 0.59,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-mppt-neg",
      fromComponentId: "rv24-mppt",
      fromTerminalId: "bat_neg",
      toComponentId: "rv24-neg-bus",
      toTerminalId: "terminal_3",
      cableLengthFt: 4,
      busType: "dc_neg",
      calculatedCurrentA: 60,
      recommendedCableAwg: "6",
      voltageDropV: 0.19,
      voltageDropPercent: 0.79,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-alt-to-input-fuse",
      fromComponentId: "rv24-alternator",
      fromTerminalId: "dc_pos",
      toComponentId: "rv24-dcdc-in-fuse",
      toTerminalId: "in_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 30,
      recommendedFuseA: 35,
      recommendedCableAwg: "12",
      voltageDropV: 0.286,
      voltageDropPercent: 2.38,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-input-fuse-to-dcdc",
      fromComponentId: "rv24-dcdc-in-fuse",
      fromTerminalId: "out_pos",
      toComponentId: "rv24-dcdc",
      toTerminalId: "in_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 30,
      recommendedFuseA: 35,
      recommendedCableAwg: "12",
      voltageDropV: 0.286,
      voltageDropPercent: 2.38,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-alt-neg-to-dcdc",
      fromComponentId: "rv24-alternator",
      fromTerminalId: "dc_neg",
      toComponentId: "rv24-dcdc",
      toTerminalId: "in_neg",
      cableLengthFt: 6,
      busType: "dc_neg",
      calculatedCurrentA: 30,
      recommendedCableAwg: "10",
      voltageDropV: 0.36,
      voltageDropPercent: 3,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-dcdc-to-output-fuse",
      fromComponentId: "rv24-dcdc",
      fromTerminalId: "out_pos",
      toComponentId: "rv24-dcdc-out-fuse",
      toTerminalId: "in_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 15,
      recommendedFuseA: 20,
      recommendedCableAwg: "12",
      voltageDropV: 0.143,
      voltageDropPercent: 0.6,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-output-fuse-to-bus",
      fromComponentId: "rv24-dcdc-out-fuse",
      fromTerminalId: "out_pos",
      toComponentId: "rv24-pos-bus",
      toTerminalId: "terminal_4",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 15,
      recommendedFuseA: 20,
      recommendedCableAwg: "14",
      voltageDropV: 0.227,
      voltageDropPercent: 0.95,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-dcdc-neg",
      fromComponentId: "rv24-dcdc",
      fromTerminalId: "out_neg",
      toComponentId: "rv24-neg-bus",
      toTerminalId: "terminal_4",
      cableLengthFt: 4,
      busType: "dc_neg",
      calculatedCurrentA: 15,
      recommendedCableAwg: "12",
      voltageDropV: 0.191,
      voltageDropPercent: 0.79,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-converter-neg",
      fromComponentId: "rv24-neg-bus",
      fromTerminalId: "terminal_5",
      toComponentId: "rv24-converter",
      toTerminalId: "in_neg",
      cableLengthFt: 4,
      busType: "dc_neg",
      calculatedCurrentA: 15,
      recommendedCableAwg: "12",
      voltageDropV: 0.191,
      voltageDropPercent: 0.79,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-converter-to-load-fuse",
      fromComponentId: "rv24-converter",
      fromTerminalId: "out_pos",
      toComponentId: "rv24-converter-fuse",
      toTerminalId: "in_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 20,
      recommendedFuseA: 25,
      recommendedCableAwg: "12",
      voltageDropV: 0.191,
      voltageDropPercent: 1.59,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-load-fuse-to-load",
      fromComponentId: "rv24-converter-fuse",
      fromTerminalId: "out_pos",
      toComponentId: "rv24-dc-load",
      toTerminalId: "dc_pos",
      cableLengthFt: 4,
      busType: "dc_pos",
      calculatedCurrentA: 20,
      recommendedFuseA: 25,
      recommendedCableAwg: "12",
      voltageDropV: 0.254,
      voltageDropPercent: 2.12,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-load-neg",
      fromComponentId: "rv24-converter",
      fromTerminalId: "out_neg",
      toComponentId: "rv24-dc-load",
      toTerminalId: "dc_neg",
      cableLengthFt: 4,
      busType: "dc_neg",
      calculatedCurrentA: 20,
      recommendedCableAwg: "12",
      voltageDropV: 0.254,
      voltageDropPercent: 2.12,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-ac-source-l",
      fromComponentId: "rv24-ac-source",
      fromTerminalId: "ac_l",
      toComponentId: "rv24-inverter",
      toTerminalId: "ac_in_l",
      cableLengthFt: 10,
      busType: "ac_line",
      calculatedCurrentA: 25,
      recommendedFuseA: 30,
      recommendedCableAwg: "14",
      voltageDropV: 1.262,
      voltageDropPercent: 1.05,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-ac-source-n",
      fromComponentId: "rv24-ac-source",
      fromTerminalId: "ac_n",
      toComponentId: "rv24-inverter",
      toTerminalId: "ac_in_n",
      cableLengthFt: 10,
      busType: "ac_neutral",
      calculatedCurrentA: 25,
      recommendedCableAwg: "14",
      voltageDropV: 1.262,
      voltageDropPercent: 1.05,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-ac-load-l",
      fromComponentId: "rv24-inverter",
      fromTerminalId: "ac_out_l",
      toComponentId: "rv24-ac-load",
      toTerminalId: "ac_l",
      cableLengthFt: 15,
      busType: "ac_line",
      calculatedCurrentA: 20,
      recommendedFuseA: 25,
      recommendedCableAwg: "14",
      voltageDropV: 1.515,
      voltageDropPercent: 1.26,
      warnings: [],
      errors: []
    },
    {
      id: "rv24-ac-load-n",
      fromComponentId: "rv24-inverter",
      fromTerminalId: "ac_out_n",
      toComponentId: "rv24-ac-load",
      toTerminalId: "ac_n",
      cableLengthFt: 15,
      busType: "ac_neutral",
      calculatedCurrentA: 20,
      recommendedCableAwg: "16",
      voltageDropV: 2.41,
      voltageDropPercent: 2.01,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783960964189-10",
      fromComponentId: "rv24-pos-bus",
      fromTerminalId: "terminal_5",
      toComponentId: "comp-1783960964189-9",
      toTerminalId: "in_pos",
      cableLengthFt: 2,
      routePoints: [
        {
          x: 50,
          y: 150
        },
        {
          x: 50,
          y: 263
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 15,
      recommendedFuseA: 20,
      recommendedCableAwg: "12",
      voltageDropV: 0.095,
      voltageDropPercent: 0.4,
      warnings: [],
      errors: [],
      routeMode: "manual"
    },
    {
      id: "conn-1783963287845-13",
      fromComponentId: "comp-1783960964189-9",
      fromTerminalId: "out_pos",
      toComponentId: "rv24-converter",
      toTerminalId: "in_pos",
      cableLengthFt: 6,
      busType: "dc_pos",
      calculatedCurrentA: 15,
      recommendedFuseA: 20,
      recommendedCableAwg: "12",
      voltageDropV: 0.286,
      voltageDropPercent: 1.19,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783963587533-14",
      fromComponentId: "rv24-bat-2",
      fromTerminalId: "dc_neg",
      toComponentId: "rv24-neg-bus",
      toTerminalId: "terminal_1",
      cableLengthFt: 2,
      routePoints: [
        {
          x: -464,
          y: 220
        },
        {
          x: -52,
          y: 220
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 145,
      recommendedCableAwg: "2",
      voltageDropV: 0.091,
      voltageDropPercent: 0.38,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783967283232-3",
      fromComponentId: "rv24-pv-3",
      fromTerminalId: "pv_neg",
      toComponentId: "comp-1783967279148-2",
      toTerminalId: "in_1",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 135,
          y: -370
        },
        {
          x: 330,
          y: -370
        }
      ],
      routeMode: "manual",
      busType: "pv_neg",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783967358557-4",
      fromComponentId: "rv24-pv-1",
      fromTerminalId: "pv_neg",
      toComponentId: "comp-1783967279148-2",
      toTerminalId: "in_2",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 435,
          y: -370
        },
        {
          x: 350,
          y: -370
        }
      ],
      routeMode: "manual",
      busType: "pv_neg",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783967360895-5",
      fromComponentId: "comp-1783967279148-2",
      fromTerminalId: "out",
      toComponentId: "rv24-mppt",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 340,
          y: -190
        },
        {
          x: 246,
          y: -190
        }
      ],
      routeMode: "manual",
      busType: "pv_neg",
      calculatedCurrentA: 24,
      recommendedCableAwg: "12",
      voltageDropV: 0.457,
      voltageDropPercent: 1.35,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783967372081-7",
      fromComponentId: "rv24-pv-4",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1783967366891-6",
      toTerminalId: "in_1",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 325,
          y: -380
        },
        {
          x: 410,
          y: -380
        }
      ],
      routeMode: "manual",
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedFuseA: 20,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783967374420-8",
      fromComponentId: "rv24-pv-2",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1783967366891-6",
      toTerminalId: "in_2",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 625,
          y: -370
        },
        {
          x: 430,
          y: -370
        }
      ],
      routeMode: "manual",
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedFuseA: 20,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 1.7,
      warnings: [],
      errors: []
    },
    {
      id: "conn-1783967376565-9",
      fromComponentId: "comp-1783967366891-6",
      fromTerminalId: "out",
      toComponentId: "rv24-mppt",
      toTerminalId: "pv_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 420,
          y: -210
        },
        {
          x: 255,
          y: -210
        }
      ],
      routeMode: "manual",
      busType: "pv_pos",
      calculatedCurrentA: 24,
      recommendedFuseA: 40,
      recommendedCableAwg: "12",
      voltageDropV: 0.457,
      voltageDropPercent: 1.35,
      warnings: [],
      errors: []
    }
  ],
  annotations: []
};

export const SYSTEM_PRESETS: SystemPreset[] = [
  {
    id: 'simple-12v',
    name: '12V Bare DC',
    description:
      'Minimal 12V DC-only system: Discover AES-B battery, Victron MPPT 150/60 with 2x 400W panels, Orion 12/12-30A DC-DC charger, and DC loads.',
    voltage: 12,
    tags: ['12V', 'DC-Only', 'Solar', 'DC-DC', 'Lithium'],
    system: SIMPLE_12V,
  },
  {
    id: 'full-12v',
    name: '24V Medium RV',
    description:
      'Medium 24V RV system: 2x Discover AES-B 24V batteries, MultiPlus-II 24/3000, MPPT 150/60, 12V alternator charging, 24V-to-12V conversion, and four 400W PV panels.',
    voltage: 24,
    tags: ['24V', 'Medium RV', 'Solar', 'DC-DC', 'Lithium'],
    system: MEDIUM_24V,
  },
  {
    id: 'offgrid-48v',
    name: '48V Stationary',
    description:
      'Stationary 48V system: Discover Helios ESS battery bank, Megarevo hybrid inverter with dual PV tracker inputs, generator/grid inputs, AC distribution, and two 8-panel PV strings.',
    voltage: 48,
    tags: ['48V', 'Stationary', 'Off-Grid', 'Solar', 'Generator', 'Helios'],
    system: OFFGRID_48V,
  },
];
