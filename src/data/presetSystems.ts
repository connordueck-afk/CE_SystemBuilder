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
// "Set Default" writer. The small/mobile slots are intentionally lightweight
// scaffolds until they are authored from the canvas.
// ----------------------------------------------------------
const SIMPLE_12V: SystemDesign = {
  id: "sys-simple-24v-rv",
  name: "24V Small RV System",
  nominalVoltage: 24,
  assumptions: {
    inverterEfficiency: 0.92,
    defaultOemDiscountPercent: 30,
    defaultCableLengthFt: 6,
    maxVoltageDropPercent: 3,
    continuousLoadMultiplier: 1.25,
    batteryInterconnectMaxLengthFt: 3
  },
  createdAt: "2026-06-29T00:00:00.000Z",
  updatedAt: "2026-06-29T00:00:00.000Z",
  components: [
    // ============================================================
    // Batteries — Discover AES-B 24V 100Ah (2 in parallel = 200Ah)
    // ============================================================
    {
      id: "bat-1",
      productId: "discover-aes-lithium-24-100",
      label: "AES-B Battery 1",
      quantity: 1,
      x: -40,
      y: 360,
      includeInBom: true
    },
    {
      id: "bat-2",
      productId: "discover-aes-lithium-24-100",
      label: "AES-B Battery 2",
      quantity: 1,
      x: 160,
      y: 360,
      includeInBom: true
    },
    // ============================================================
    // Battery pack fuse — Class-T 250A
    // 2 x 100A batteries in parallel = 200A max x 1.25 = 250A
    // Single fuse protecting the pack feeder to the positive busbar
    // ============================================================
    {
      id: "fuse-pack",
      productId: "fuse-class-t-250a",
      label: "Battery Pack Fuse",
      quantity: 1,
      x: 60,
      y: 230,
      rotationDeg: 270,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    // ============================================================
    // DC Busbars — 5-point, positive and negative
    // ============================================================
    {
      id: "bus-pos",
      productId: "dist-generic-busbar-5pt",
      label: "Positive Busbar",
      quantity: 1,
      x: 220,
      y: 50,
      includeInBom: true,
      busPolarity: "positive",
      dcNominalVoltage: 24,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "bus-neg",
      productId: "dist-generic-busbar-5pt",
      label: "Negative Busbar",
      quantity: 1,
      x: 220,
      y: 170,
      includeInBom: true,
      busPolarity: "negative",
      dcNominalVoltage: 24,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "negative",
      inferredVoltageClass: "dc_low_voltage"
    },
    // ============================================================
    // Main inverter fuse — Class-T 175A
    // MultiPlus-II 24/3000 max DC 130A x 1.25 = 162.5A -> 175A
    // ============================================================
    {
      id: "fuse-inverter",
      productId: "fuse-class-t-175a",
      label: "Inverter Main Fuse",
      quantity: 1,
      x: 420,
      y: 30,
      rotationDeg: 270,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    // ============================================================
    // MultiPlus-II 24/3000/70-50 2x120V Inverter/Charger
    // ============================================================
    {
      id: "inverter",
      productId: "multiplus-ii-24-3000-2x120v",
      label: "MultiPlus-II 24/3000",
      quantity: 1,
      x: 600,
      y: 150,
      includeInBom: true
    },
    // ============================================================
    // Shore power — 240V split-phase grid source
    // ============================================================
    {
      id: "shore-source",
      productId: "generic-grid-source-240v",
      label: "Shore Power",
      quantity: 1,
      x: 600,
      y: -140,
      includeInBom: true
    },
    // ============================================================
    // AC loads — 240V split-phase
    // ============================================================
    {
      id: "ac-loads",
      productId: "acc-ac-load-split-phase-240v",
      label: "RV AC Loads",
      quantity: 1,
      x: 600,
      y: 460,
      includeInBom: true
    },
    // ============================================================
    // Solar — 2 x 400W panels, 2-string combiner, MPPT 150/60
    // ============================================================
    {
      id: "pv-1",
      productId: "solar-array-400w",
      label: "PV Panel 1",
      quantity: 1,
      x: -360,
      y: -460,
      includeInBom: true
    },
    {
      id: "pv-2",
      productId: "solar-array-400w",
      label: "PV Panel 2",
      quantity: 1,
      x: -160,
      y: -460,
      includeInBom: true
    },
    {
      id: "pv-combiner",
      productId: "solar-combiner-2-string",
      label: "PV Combiner",
      quantity: 1,
      x: -250,
      y: -340,
      includeInBom: true
    },
    {
      id: "mppt",
      productId: "mppt-vic-150-60",
      label: "MPPT 150/60",
      quantity: 1,
      x: 60,
      y: -200,
      includeInBom: true
    },
    // MPPT output fuse — MIDI 80A (60A x 1.25 = 75A -> 80A)
    {
      id: "fuse-mppt",
      productId: "fuse-midi-80a",
      label: "MPPT Fuse",
      quantity: 1,
      x: 60,
      y: -90,
      rotationDeg: 270,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    // ============================================================
    // DC-DC charger — Orion-Tr Smart 12/24-15A (alternator -> 24V house)
    // ============================================================
    {
      id: "alt-source",
      productId: "generic-alternator-source",
      label: "Alternator / Starter Batt",
      quantity: 1,
      x: -700,
      y: -180,
      includeInBom: true
    },
    {
      id: "dc-dc",
      productId: "orion-tr-smart-12-24-15-non-isolated",
      label: "Orion 12/24-15A DC-DC",
      quantity: 1,
      x: -510,
      y: -160,
      includeInBom: true
    },
    // DC-DC output fuse — MIDI 30A (15A x 1.25 = 18.75A -> 30A)
    {
      id: "fuse-dcdc",
      productId: "fuse-midi-30a",
      label: "DC-DC Output Fuse",
      quantity: 1,
      x: -350,
      y: -90,
      rotationDeg: 270,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    }
  ],
  connections: [
    // ============================================================
    // Battery parallel interconnect — Bat1 pos <-> Bat2 pos
    // ============================================================
    {
      id: "bat1-bat2-pos",
      fromComponentId: "bat-1",
      fromTerminalId: "dc_pos",
      toComponentId: "bat-2",
      toTerminalId: "dc_pos",
      cableLengthFt: 1.5
    },
    {
      id: "bat1-bat2-neg",
      fromComponentId: "bat-1",
      fromTerminalId: "dc_neg",
      toComponentId: "bat-2",
      toTerminalId: "dc_neg",
      cableLengthFt: 1.5
    },
    // ============================================================
    // Battery pack -> pack fuse -> positive busbar
    // ============================================================
    {
      id: "bat2-pos-fuse",
      fromComponentId: "bat-2",
      fromTerminalId: "dc_pos",
      toComponentId: "fuse-pack",
      toTerminalId: "in",
      cableLengthFt: 2
    },
    {
      id: "pack-fuse-bus",
      fromComponentId: "fuse-pack",
      fromTerminalId: "out",
      toComponentId: "bus-pos",
      toTerminalId: "terminal_1",
      cableLengthFt: 3
    },
    {
      id: "bat2-neg-bus",
      fromComponentId: "bat-2",
      fromTerminalId: "dc_neg",
      toComponentId: "bus-neg",
      toTerminalId: "terminal_1",
      cableLengthFt: 4
    },
    // ============================================================
    // Inverter DC — bus -> fuse -> inverter
    // ============================================================
    {
      id: "bus-pos-inv-fuse",
      fromComponentId: "bus-pos",
      fromTerminalId: "terminal_5",
      toComponentId: "fuse-inverter",
      toTerminalId: "in",
      cableLengthFt: 3
    },
    {
      id: "inv-fuse-inverter",
      fromComponentId: "fuse-inverter",
      fromTerminalId: "out",
      toComponentId: "inverter",
      toTerminalId: "dc_pos",
      cableLengthFt: 3
    },
    {
      id: "bus-neg-inverter",
      fromComponentId: "bus-neg",
      fromTerminalId: "terminal_5",
      toComponentId: "inverter",
      toTerminalId: "dc_neg",
      cableLengthFt: 4
    },
    // ============================================================
    // Shore power AC in
    // ============================================================
    {
      id: "shore-l1",
      fromComponentId: "shore-source",
      fromTerminalId: "ac_l1",
      toComponentId: "inverter",
      toTerminalId: "ac_in_l",
      cableLengthFt: 10
    },
    {
      id: "shore-n",
      fromComponentId: "shore-source",
      fromTerminalId: "ac_n",
      toComponentId: "inverter",
      toTerminalId: "ac_in_n",
      cableLengthFt: 10
    },
    // ============================================================
    // AC loads out
    // ============================================================
    {
      id: "ac-out-l1",
      fromComponentId: "inverter",
      fromTerminalId: "ac_out_l",
      toComponentId: "ac-loads",
      toTerminalId: "ac_l1",
      cableLengthFt: 10
    },
    {
      id: "ac-out-n",
      fromComponentId: "inverter",
      fromTerminalId: "ac_out_n",
      toComponentId: "ac-loads",
      toTerminalId: "ac_n",
      cableLengthFt: 10
    },
    // ============================================================
    // PV panels -> combiner
    // ============================================================
    {
      id: "pv1-pos",
      fromComponentId: "pv-1",
      fromTerminalId: "pv_pos",
      toComponentId: "pv-combiner",
      toTerminalId: "string_1_pos",
      cableLengthFt: 15
    },
    {
      id: "pv1-neg",
      fromComponentId: "pv-1",
      fromTerminalId: "pv_neg",
      toComponentId: "pv-combiner",
      toTerminalId: "string_1_neg",
      cableLengthFt: 15
    },
    {
      id: "pv2-pos",
      fromComponentId: "pv-2",
      fromTerminalId: "pv_pos",
      toComponentId: "pv-combiner",
      toTerminalId: "string_2_pos",
      cableLengthFt: 15
    },
    {
      id: "pv2-neg",
      fromComponentId: "pv-2",
      fromTerminalId: "pv_neg",
      toComponentId: "pv-combiner",
      toTerminalId: "string_2_neg",
      cableLengthFt: 15
    },
    // ============================================================
    // PV combiner -> MPPT
    // ============================================================
    {
      id: "comb-pos",
      fromComponentId: "pv-combiner",
      fromTerminalId: "out_pos",
      toComponentId: "mppt",
      toTerminalId: "pv_pos",
      cableLengthFt: 5
    },
    {
      id: "comb-neg",
      fromComponentId: "pv-combiner",
      fromTerminalId: "out_neg",
      toComponentId: "mppt",
      toTerminalId: "pv_neg",
      cableLengthFt: 5
    },
    // ============================================================
    // MPPT -> fuse -> busbar
    // ============================================================
    {
      id: "mppt-pos",
      fromComponentId: "mppt",
      fromTerminalId: "bat_pos",
      toComponentId: "fuse-mppt",
      toTerminalId: "in",
      cableLengthFt: 3
    },
    {
      id: "mppt-fuse-bus",
      fromComponentId: "fuse-mppt",
      fromTerminalId: "out",
      toComponentId: "bus-pos",
      toTerminalId: "terminal_3",
      cableLengthFt: 3
    },
    {
      id: "mppt-neg",
      fromComponentId: "mppt",
      fromTerminalId: "bat_neg",
      toComponentId: "bus-neg",
      toTerminalId: "terminal_3",
      cableLengthFt: 5
    },
    // ============================================================
    // Alternator -> DC-DC charger
    // ============================================================
    {
      id: "alt-pos",
      fromComponentId: "alt-source",
      fromTerminalId: "dc_pos",
      toComponentId: "dc-dc",
      toTerminalId: "in_pos",
      cableLengthFt: 15
    },
    {
      id: "alt-neg",
      fromComponentId: "alt-source",
      fromTerminalId: "dc_neg",
      toComponentId: "dc-dc",
      toTerminalId: "in_neg",
      cableLengthFt: 15
    },
    // ============================================================
    // DC-DC -> fuse -> busbar
    // ============================================================
    {
      id: "dcdc-pos",
      fromComponentId: "dc-dc",
      fromTerminalId: "out_pos",
      toComponentId: "fuse-dcdc",
      toTerminalId: "in",
      cableLengthFt: 3
    },
    {
      id: "dcdc-fuse-bus",
      fromComponentId: "fuse-dcdc",
      fromTerminalId: "out",
      toComponentId: "bus-pos",
      toTerminalId: "terminal_4",
      cableLengthFt: 3
    },
    {
      id: "dcdc-neg",
      fromComponentId: "dc-dc",
      fromTerminalId: "out_neg",
      toComponentId: "bus-neg",
      toTerminalId: "terminal_4",
      cableLengthFt: 5
    }
  ],
  annotations: []
};

const FULL_12V: SystemDesign = {
  id: 'preset-full-12v',
  name: 'Full 12V Mobile',
  nominalVoltage: 12,
  assumptions: { ...DEFAULT_SYSTEM.assumptions },
  createdAt: '2026-06-28T00:00:00.000Z',
  updatedAt: '2026-06-28T00:00:00.000Z',
  components: [],
  connections: [],
  annotations: [],
};

const OFFGRID_48V: SystemDesign = {
  id: "sys-1782659762722-1",
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
  createdAt: "2026-06-28T15:16:02.722Z",
  updatedAt: "2026-06-28T16:03:19.395Z",
  components: [
    {
      id: "comp-1782601913910-3",
      productId: "discover-helios-ess-52-48-16000",
      label: "HELIOS ESS 52-48-16000",
      quantity: 1,
      x: -120,
      y: 60,
      includeInBom: true,
      imageScale: 2
    },
    {
      id: "comp-1782601920117-5",
      productId: "discover-helios-ess-52-48-16000",
      label: "HELIOS ESS 52-48-16000 Copy",
      quantity: 1,
      x: 120,
      y: 60,
      includeInBom: true,
      imageScale: 2,
      locked: false
    },
    {
      id: "comp-1782601958053-19",
      productId: "acc-dc-load-generic",
      label: "DC Load (generic)",
      quantity: 1,
      x: 560,
      y: -380,
      includeInBom: true,
      instanceVoltageV: 48,
      instanceMaxCurrentA: 150
    },
    {
      id: "comp-1782603312356-2645",
      productId: "mppt-vic-150-100",
      label: "SmartSolar MPPT 150/100 TR Copy",
      quantity: 1,
      x: -300,
      y: -640,
      includeInBom: true,
      imageScale: 1.7560679349343797,
      locked: false
    },
    {
      id: "comp-1782603317974-2772",
      productId: "solar-array-400w",
      label: "Solar Array 400W",
      quantity: 1,
      x: -540,
      y: -880,
      includeInBom: true
    },
    {
      id: "comp-1782603320895-2871",
      productId: "solar-array-400w",
      label: "Solar Array 400W Copy",
      quantity: 1,
      x: -400,
      y: -880,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782603321910-2914",
      productId: "solar-array-400w",
      label: "Solar Array 400W Copy Copy",
      quantity: 1,
      x: -680,
      y: -880,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782603341600-3355",
      productId: "mppt-vic-150-100",
      label: "SmartSolar MPPT 150/100 TR Copy",
      quantity: 1,
      x: 120,
      y: -640,
      includeInBom: true,
      imageScale: 1.7560679349343797,
      locked: false
    },
    {
      id: "comp-1782603341600-3356",
      productId: "solar-array-400w",
      label: "Solar Array 400W",
      quantity: 1,
      x: -120,
      y: -880,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782603341600-3357",
      productId: "solar-array-400w",
      label: "Solar Array 400W Copy",
      quantity: 1,
      x: 20,
      y: -880,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782603341600-3358",
      productId: "solar-array-400w",
      label: "Solar Array 400W Copy Copy",
      quantity: 1,
      x: -260,
      y: -880,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782603441636-5852",
      productId: "fuse-midi-125a",
      label: "Fuse 3",
      quantity: 1,
      x: -300,
      y: -440,
      rotationDeg: 90,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782604094139-6302",
      productId: "fuse-midi-125a",
      label: "Fuse 4",
      quantity: 1,
      x: 140,
      y: -460,
      rotationDeg: 90,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782662563891-163",
      productId: "fuse-midi-200a",
      label: "Fuse 5",
      quantity: 1,
      x: 300,
      y: -160,
      rotationDeg: 270,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    }
  ],
  connections: [
    {
      id: "conn-1782601937475-8",
      fromComponentId: "comp-1782601913910-3",
      fromTerminalId: "dc_pos_1",
      toComponentId: "comp-1782601920117-5",
      toTerminalId: "dc_pos_2",
      cableLengthFt: 2,
      routePoints: [
        {
          x: -30,
          y: -64
        },
        {
          x: -30,
          y: -110
        },
        {
          x: 210,
          y: -110
        },
        {
          x: 210,
          y: -50
        }
      ],
      routeMode: "manual",
      busType: "dc_pos",
      calculatedCurrentA: 150,
      recommendedFuseA: 200,
      recommendedCableAwg: "1/0",
      voltageDropV: 0.059,
      voltageDropPercent: 0.12,
      warnings: []
    },
    {
      id: "conn-1782601941176-10",
      fromComponentId: "comp-1782601920117-5",
      fromTerminalId: "dc_neg_1",
      toComponentId: "comp-1782601913910-3",
      toTerminalId: "dc_neg_2",
      cableLengthFt: 2,
      routePoints: [
        {
          x: 30,
          y: -64
        },
        {
          x: 30,
          y: -110
        },
        {
          x: -196,
          y: -110
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 150,
      recommendedCableAwg: "1/0",
      voltageDropV: 0.059,
      voltageDropPercent: 0.12,
      warnings: [],
      manualCableAwg: "1/0"
    },
    {
      id: "conn-1782601944675-12",
      fromComponentId: "comp-1782601913910-3",
      fromTerminalId: "port_lynk_2",
      toComponentId: "comp-1782601920117-5",
      toTerminalId: "port_lynk_1",
      cableLengthFt: 6,
      wireKind: "communication",
      busType: "communication",
      calculatedCurrentA: 0,
      voltageDropV: 0,
      voltageDropPercent: 0,
      warnings: []
    },
    {
      id: "conn-1782602627268-756",
      fromComponentId: "comp-1782601913910-3",
      fromTerminalId: "dc_neg_1",
      toComponentId: "comp-1782601958053-19",
      toTerminalId: "dc_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -210,
          y: -64
        },
        {
          x: -210,
          y: -217
        },
        {
          x: 364,
          y: -217
        },
        {
          x: 364,
          y: -370
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 150,
      recommendedCableAwg: "1/0",
      voltageDropV: 0.177,
      voltageDropPercent: 0.35,
      warnings: []
    },
    {
      id: "conn-1782603325465-3029",
      fromComponentId: "comp-1782603321910-2914",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782603317974-2772",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "unknown",
      calculatedCurrentA: 11.764705882352942,
      recommendedCableAwg: "18",
      voltageDropV: 0.901,
      voltageDropPercent: 2.65,
      warnings: []
    },
    {
      id: "conn-1782603326695-3036",
      fromComponentId: "comp-1782603317974-2772",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782603320895-2871",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "unknown",
      calculatedCurrentA: 11.764705882352942,
      recommendedCableAwg: "18",
      voltageDropV: 0.901,
      voltageDropPercent: 2.65,
      warnings: []
    },
    {
      id: "conn-1782603328241-3043",
      fromComponentId: "comp-1782603320895-2871",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782603312356-2645",
      toTerminalId: "pv_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -375,
          y: -520
        },
        {
          x: -315.8046114144094,
          y: -520
        }
      ],
      routeMode: "manual",
      busType: "pv_pos",
      calculatedCurrentA: 11.764705882352942,
      recommendedCableAwg: "16",
      voltageDropV: 0.567,
      voltageDropPercent: 1.67,
      warnings: []
    },
    {
      id: "conn-1782603330047-3050",
      fromComponentId: "comp-1782603321910-2914",
      fromTerminalId: "pv_neg",
      toComponentId: "comp-1782603312356-2645",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -705,
          y: -770
        },
        {
          x: -390,
          y: -770
        },
        {
          x: -390,
          y: -530
        },
        {
          x: -349.1699021781626,
          y: -530
        }
      ],
      routeMode: "manual",
      busType: "pv_neg",
      calculatedCurrentA: 11.764705882352942,
      recommendedCableAwg: "16",
      voltageDropV: 0.567,
      voltageDropPercent: 1.67,
      warnings: []
    },
    {
      id: "conn-1782603359728-4032",
      fromComponentId: "comp-1782603341600-3358",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782603341600-3356",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "unknown",
      calculatedCurrentA: 11.764705882352942,
      recommendedCableAwg: "18",
      voltageDropV: 0.901,
      voltageDropPercent: 2.65,
      warnings: [],
      routePoints: [
        {
          x: -235,
          y: -800
        },
        {
          x: -145,
          y: -800
        }
      ],
      routeMode: "manual"
    },
    {
      id: "conn-1782603360770-4039",
      fromComponentId: "comp-1782603341600-3356",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782603341600-3357",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "unknown",
      calculatedCurrentA: 11.764705882352942,
      recommendedCableAwg: "18",
      voltageDropV: 0.901,
      voltageDropPercent: 2.65,
      warnings: []
    },
    {
      id: "conn-1782603362305-4046",
      fromComponentId: "comp-1782603341600-3357",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782603341600-3355",
      toTerminalId: "pv_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 45,
          y: -540
        },
        {
          x: 104.19538858559058,
          y: -540
        }
      ],
      routeMode: "manual",
      busType: "pv_pos",
      calculatedCurrentA: 11.764705882352942,
      recommendedCableAwg: "16",
      voltageDropV: 0.567,
      voltageDropPercent: 1.67,
      warnings: []
    },
    {
      id: "conn-1782603408209-5393",
      fromComponentId: "comp-1782603341600-3358",
      fromTerminalId: "pv_neg",
      toComponentId: "comp-1782603341600-3355",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -285,
          y: -780
        },
        {
          x: 30,
          y: -780
        },
        {
          x: 30,
          y: -530
        },
        {
          x: 70.83009782183737,
          y: -530
        }
      ],
      routeMode: "manual",
      busType: "pv_neg",
      calculatedCurrentA: 11.764705882352942,
      recommendedCableAwg: "16",
      voltageDropV: 0.567,
      voltageDropPercent: 1.67,
      warnings: []
    },
    {
      id: "conn-1782603428868-5838",
      fromComponentId: "comp-1782603312356-2645",
      fromTerminalId: "bat_neg",
      toComponentId: "comp-1782601913910-3",
      toTerminalId: "dc_neg_3",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -250.83009782183737,
          y: -36
        }
      ],
      routeMode: "auto",
      busType: "dc_neg",
      calculatedCurrentA: 100,
      recommendedCableAwg: "4",
      voltageDropV: 0.299,
      voltageDropPercent: 0.58,
      warnings: [],
      manualCableAwg: "4"
    },
    {
      manualCableAwg: "4",
      id: "conn-1782603441636-5853",
      fromComponentId: "comp-1782603312356-2645",
      fromTerminalId: "bat_pos",
      toComponentId: "comp-1782603441636-5852",
      toTerminalId: "in",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 100,
      recommendedFuseA: 125,
      recommendedCableAwg: "4",
      voltageDropV: 0.149,
      voltageDropPercent: 0.31,
      warnings: []
    },
    {
      id: "conn-1782603441636-5854",
      fromComponentId: "comp-1782603441636-5852",
      fromTerminalId: "out",
      toComponentId: "comp-1782601913910-3",
      toTerminalId: "dc_pos_2",
      cableLengthFt: 3,
      routePoints: [
        {
          x: -300,
          y: -140
        },
        {
          x: -20,
          y: -140
        },
        {
          x: -20,
          y: -50
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 100,
      recommendedFuseA: 125,
      recommendedCableAwg: "4",
      voltageDropV: 0.149,
      voltageDropPercent: 0.29,
      warnings: [],
      routeMode: "manual"
    },
    {
      id: "conn-1782603662872-5884",
      fromComponentId: "comp-1782603341600-3355",
      fromTerminalId: "bat_neg",
      toComponentId: "comp-1782601920117-5",
      toTerminalId: "dc_neg_2",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 169.16990217816263,
          y: -400
        },
        {
          x: 20,
          y: -400
        },
        {
          x: 20,
          y: -50
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 100,
      recommendedCableAwg: "4",
      voltageDropV: 0.299,
      voltageDropPercent: 0.58,
      warnings: [],
      manualCableAwg: "4"
    },
    {
      manualCableAwg: "4",
      id: "conn-1782604094140-6303",
      fromComponentId: "comp-1782603341600-3355",
      fromTerminalId: "bat_pos",
      toComponentId: "comp-1782604094139-6302",
      toTerminalId: "in",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 100,
      recommendedFuseA: 125,
      recommendedCableAwg: "4",
      voltageDropV: 0.149,
      voltageDropPercent: 0.31,
      warnings: []
    },
    {
      manualCableAwg: "4",
      id: "conn-1782604094140-6304",
      fromComponentId: "comp-1782604094139-6302",
      fromTerminalId: "out",
      toComponentId: "comp-1782601920117-5",
      toTerminalId: "dc_pos_3",
      cableLengthFt: 3,
      routePoints: [
        {
          x: 140,
          y: -250
        },
        {
          x: 250,
          y: -250
        },
        {
          x: 250,
          y: -36
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 100,
      recommendedFuseA: 125,
      recommendedCableAwg: "4",
      voltageDropV: 0.149,
      voltageDropPercent: 0.29,
      warnings: [],
      routeMode: "manual"
    },
    {
      id: "conn-1782662563891-164",
      fromComponentId: "comp-1782601920117-5",
      fromTerminalId: "dc_pos_1",
      toComponentId: "comp-1782662563891-163",
      toTerminalId: "in",
      cableLengthFt: 2,
      routePoints: [
        {
          x: 484,
          y: -64
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 150,
      recommendedFuseA: 200,
      recommendedCableAwg: "1/0",
      voltageDropV: 0.059,
      voltageDropPercent: 0.12,
      warnings: []
    },
    {
      id: "conn-1782662563891-165",
      fromComponentId: "comp-1782662563891-163",
      fromTerminalId: "out",
      toComponentId: "comp-1782601958053-19",
      toTerminalId: "dc_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 150,
      recommendedFuseA: 200,
      recommendedCableAwg: "1/0",
      voltageDropV: 0.088,
      voltageDropPercent: 0.18,
      warnings: []
    }
  ],
  annotations: []
};

export const SYSTEM_PRESETS: SystemPreset[] = [
  {
    id: 'simple-12v',
    name: '24V Small RV System',
    description:
      'Small 24V RV system: 2x Discover AES-B batteries, MultiPlus-II 24/3000 2x120V, MPPT 150/60, Orion DC-DC charger, and dual 400W PV panels.',
    voltage: 24,
    tags: ['24V', 'RV', 'Solar', 'DC-DC', 'Lithium'],
    system: SIMPLE_12V,
  },
  {
    id: 'full-12v',
    name: 'Full 12V Mobile',
    description:
      'Larger 12 V mobile power system slot for the final default library.',
    voltage: 12,
    tags: ['12V', 'Mobile', 'Full System'],
    system: FULL_12V,
  },
  {
    id: 'offgrid-48v',
    name: '48V Off-Grid Cabin',
    description:
      'Two Discover Helios ESS batteries in parallel, a solar array + MPPT, a 5 kW inverter/charger, and generator backup for a permanent installation.',
    voltage: 48,
    tags: ['48V', 'Cabin', 'Off-Grid', 'Solar', 'Generator', 'Helios'],
    system: OFFGRID_48V,
  },
];
