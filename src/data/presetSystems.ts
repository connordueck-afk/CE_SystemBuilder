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
  id: "sys-1782848189218-1",
  name: "Evaluate",
  nominalVoltage: 12,
  assumptions: {
    inverterEfficiency: 0.92,
    defaultOemDiscountPercent: 30,
    defaultCableLengthFt: 6,
    maxVoltageDropPercent: 3,
    continuousLoadMultiplier: 1.25,
    batteryInterconnectMaxLengthFt: 3
  },
  createdAt: "2026-06-30T19:36:29.218Z",
  updatedAt: "2026-06-30T19:59:27.973Z",
  components: [
    {
      id: "comp-1782842438398-42",
      productId: "discover-aes-lithium-12-200",
      label: "AES-B LiFePO4 12.8V/200Ah",
      quantity: 1,
      x: 600,
      y: 380,
      includeInBom: true
    },
    {
      id: "comp-1782842440255-43",
      productId: "discover-aes-lithium-12-200",
      label: "AES-B LiFePO4 12.8V/200Ah Copy",
      quantity: 1,
      x: 460,
      y: 380,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782842451840-46",
      productId: "dist-generic-busbar",
      label: "Generic Busbar 4-point",
      quantity: 1,
      x: 660,
      y: 100,
      includeInBom: true,
      inferredElectricalType: "dc_pos",
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782842453627-47",
      productId: "dist-generic-busbar",
      label: "Generic Busbar 4-point Copy",
      quantity: 1,
      x: 440,
      y: 100,
      includeInBom: true,
      locked: false,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "negative",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782842526576-59",
      productId: "inv-vic-mp2-12-3000",
      label: "MultiPlus-II 12/3000/120-50",
      quantity: 1,
      x: 920,
      y: -60,
      includeInBom: true
    },
    {
      id: "comp-1782842560239-63",
      productId: "generic-grid-source",
      label: "AC Source",
      quantity: 1,
      x: 1280,
      y: -320,
      includeInBom: true,
      instanceVoltageV: 120,
      instanceMaxCurrentA: 60,
      rotationDeg: 180
    },
    {
      id: "comp-1782842566112-64",
      productId: "acc-ac-load-generic",
      label: "AC Load (generic)",
      quantity: 1,
      x: 1280,
      y: -200,
      includeInBom: true,
      instanceVoltageV: 120,
      instanceMaxCurrentA: 8
    },
    {
      id: "comp-1782842574071-65",
      productId: "breaker-ac-din-1p-40a",
      label: "AC Breaker",
      quantity: 1,
      x: 1020,
      y: -60,
      includeInBom: true
    },
    {
      id: "comp-1782842575858-66",
      productId: "breaker-ac-din-1p-10a",
      label: "AC Breaker Copy",
      quantity: 1,
      x: 1100,
      y: -60,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782842632675-73",
      productId: "mppt-100-50",
      label: "SmartSolar MPPT 100/50",
      quantity: 1,
      x: 580,
      y: -360,
      includeInBom: true
    },
    {
      id: "comp-1782842639700-76",
      productId: "fuse-midi-littelfuse-70a",
      label: "Fuse 3",
      quantity: 1,
      x: 677.33,
      y: -140.16500000000002,
      rotationDeg: 90,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782842647862-79",
      productId: "solar-array-400w",
      label: "Solar Panel 400W",
      quantity: 1,
      x: 340,
      y: -500,
      includeInBom: true
    },
    {
      id: "comp-1782842662695-84",
      productId: "generic-pv-disconnect",
      label: "PV Disconnect",
      quantity: 1,
      x: 480,
      y: -360,
      includeInBom: true
    },
    {
      id: "comp-1782842823310-90",
      productId: "fuse-anl-littelfuse-350a",
      label: "Fuse 4",
      quantity: 1,
      x: 580,
      y: 240,
      includeInBom: true,
      rotationDeg: 0,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782842834889-93",
      productId: "fuse-anl-littelfuse-350a",
      label: "Fuse 4 Copy",
      quantity: 1,
      x: 780,
      y: 180,
      includeInBom: true,
      rotationDeg: 0,
      locked: false,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    }
  ],
  connections: [
    {
      id: "conn-1782842443039-44",
      fromComponentId: "comp-1782842440255-43",
      fromTerminalId: "dc_pos",
      toComponentId: "comp-1782842438398-42",
      toTerminalId: "dc_pos",
      cableLengthFt: 2,
      busType: "dc_pos",
      calculatedCurrentA: 170,
      recommendedFuseA: 225,
      recommendedCableAwg: "1/0",
      voltageDropV: 0.067,
      voltageDropPercent: 0.52,
      warnings: [],
      routePoints: [
        {
          x: 504,
          y: 290
        },
        {
          x: 644,
          y: 290
        }
      ],
      routeMode: "manual"
    },
    {
      id: "conn-1782842444342-45",
      fromComponentId: "comp-1782842438398-42",
      fromTerminalId: "dc_neg",
      toComponentId: "comp-1782842440255-43",
      toTerminalId: "dc_neg",
      cableLengthFt: 2,
      busType: "dc_neg",
      calculatedCurrentA: 170,
      recommendedCableAwg: "1/0",
      voltageDropV: 0.067,
      voltageDropPercent: 0.52,
      warnings: [],
      routePoints: [
        {
          x: 556,
          y: 290
        },
        {
          x: 416,
          y: 290
        }
      ],
      routeMode: "manual"
    },
    {
      id: "conn-1782842457742-48",
      fromComponentId: "comp-1782842440255-43",
      fromTerminalId: "dc_neg",
      toComponentId: "comp-1782842453627-47",
      toTerminalId: "terminal_1",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 416,
          y: 297
        },
        {
          x: 388,
          y: 297
        }
      ],
      routeMode: "auto",
      busType: "dc_neg",
      calculatedCurrentA: 300,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.176,
      voltageDropPercent: 1.38,
      warnings: []
    },
    {
      id: "conn-1782842537635-60",
      fromComponentId: "comp-1782842453627-47",
      fromTerminalId: "terminal_2",
      toComponentId: "comp-1782842526576-59",
      toTerminalId: "dc_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 422.67,
          y: 7
        },
        {
          x: 908,
          y: 7
        }
      ],
      routeMode: "auto",
      busType: "dc_neg",
      calculatedCurrentA: 250,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.147,
      voltageDropPercent: 1.23,
      warnings: []
    },
    {
      id: "conn-1782842582779-67",
      fromComponentId: "comp-1782842560239-63",
      fromTerminalId: "ac_l",
      toComponentId: "comp-1782842574071-65",
      toTerminalId: "l1_in",
      cableLengthFt: 1,
      routePoints: [
        {
          x: 1020,
          y: -330
        }
      ],
      routeMode: "auto",
      busType: "ac_line",
      calculatedCurrentA: 25,
      recommendedFuseA: 35,
      recommendedCableAwg: "12",
      voltageDropV: 0.079,
      voltageDropPercent: 0.07,
      warnings: []
    },
    {
      id: "conn-1782842585301-68",
      fromComponentId: "comp-1782842574071-65",
      fromTerminalId: "l1_out",
      toComponentId: "comp-1782842526576-59",
      toTerminalId: "ac_in_l",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 1020,
          y: 24
        }
      ],
      routeMode: "auto",
      busType: "ac_line",
      calculatedCurrentA: 25,
      recommendedFuseA: 35,
      recommendedCableAwg: "12",
      voltageDropV: 0.476,
      voltageDropPercent: 0.4,
      warnings: []
    },
    {
      id: "conn-1782842587488-69",
      fromComponentId: "comp-1782842526576-59",
      fromTerminalId: "ac_in_n",
      toComponentId: "comp-1782842560239-63",
      toTerminalId: "ac_n",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 929,
          y: 30
        },
        {
          x: 1040,
          y: 30
        },
        {
          x: 1040,
          y: -310
        }
      ],
      routeMode: "manual",
      busType: "ac_neutral",
      calculatedCurrentA: 25,
      recommendedCableAwg: "14",
      voltageDropV: 0.758,
      voltageDropPercent: 0.63,
      warnings: []
    },
    {
      id: "conn-1782842593493-70",
      fromComponentId: "comp-1782842526576-59",
      fromTerminalId: "ac_out_l",
      toComponentId: "comp-1782842575858-66",
      toTerminalId: "l1_out",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 936,
          y: 36
        },
        {
          x: 1100,
          y: 36
        }
      ],
      routeMode: "auto",
      busType: "ac_line",
      calculatedCurrentA: 8,
      recommendedFuseA: 10,
      recommendedCableAwg: "18",
      voltageDropV: 0.612,
      voltageDropPercent: 0.51,
      warnings: []
    },
    {
      id: "conn-1782842595146-71",
      fromComponentId: "comp-1782842575858-66",
      fromTerminalId: "l1_in",
      toComponentId: "comp-1782842566112-64",
      toTerminalId: "ac_l",
      cableLengthFt: 1,
      routePoints: [
        {
          x: 1100,
          y: -210
        }
      ],
      routeMode: "auto",
      busType: "ac_line",
      calculatedCurrentA: 8,
      recommendedFuseA: 10,
      recommendedCableAwg: "18",
      voltageDropV: 0.102,
      voltageDropPercent: 0.09,
      warnings: []
    },
    {
      id: "conn-1782842596288-72",
      fromComponentId: "comp-1782842566112-64",
      fromTerminalId: "ac_n",
      toComponentId: "comp-1782842526576-59",
      toTerminalId: "ac_out_n",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 1130,
          y: -190
        },
        {
          x: 1130,
          y: 40
        },
        {
          x: 943,
          y: 40
        }
      ],
      routeMode: "manual",
      busType: "ac_neutral",
      calculatedCurrentA: 8,
      recommendedCableAwg: "18",
      voltageDropV: 0.612,
      voltageDropPercent: 0.51,
      warnings: []
    },
    {
      id: "conn-1782842637401-75",
      fromComponentId: "comp-1782842632675-73",
      fromTerminalId: "bat_neg",
      toComponentId: "comp-1782842453627-47",
      toTerminalId: "terminal_3",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 608,
          y: -220
        },
        {
          x: 457.33,
          y: -220
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 50,
      recommendedCableAwg: "6",
      voltageDropV: 0.237,
      voltageDropPercent: 1.98,
      warnings: []
    },
    {
      id: "conn-1782842639700-77",
      fromComponentId: "comp-1782842632675-73",
      fromTerminalId: "bat_pos",
      toComponentId: "comp-1782842639700-76",
      toTerminalId: "in",
      cableLengthFt: 3,
      routePoints: [
        {
          x: 589,
          y: -210
        },
        {
          x: 677.33,
          y: -210
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 50,
      recommendedFuseA: 70,
      recommendedCableAwg: "8",
      voltageDropV: 0.189,
      voltageDropPercent: 1.57,
      warnings: [],
      routeMode: "manual"
    },
    {
      id: "conn-1782842639700-78",
      fromComponentId: "comp-1782842639700-76",
      fromTerminalId: "out",
      toComponentId: "comp-1782842451840-46",
      toTerminalId: "terminal_3",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 50,
      recommendedFuseA: 70,
      recommendedCableAwg: "8",
      voltageDropV: 0.189,
      voltageDropPercent: 1.57,
      warnings: []
    },
    {
      id: "conn-1782842668443-85",
      fromComponentId: "comp-1782842647862-79",
      fromTerminalId: "pv_neg",
      toComponentId: "comp-1782842662695-84",
      toTerminalId: "in_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 315,
          y: -280
        },
        {
          x: 476,
          y: -280
        }
      ],
      routeMode: "manual",
      busType: "pv_neg",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 0.1,
      warnings: []
    },
    {
      id: "conn-1782842671366-87",
      fromComponentId: "comp-1782842662695-84",
      fromTerminalId: "out_neg",
      toComponentId: "comp-1782842632675-73",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 492,
          y: -290
        },
        {
          x: 552,
          y: -290
        }
      ],
      routeMode: "manual",
      busType: "pv_neg",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 0.1,
      warnings: []
    },
    {
      id: "conn-1782842674843-88",
      fromComponentId: "comp-1782842632675-73",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782842662695-84",
      toTerminalId: "out_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 571,
          y: -279
        }
      ],
      routeMode: "auto",
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 0.1,
      warnings: []
    },
    {
      id: "conn-1782842704396-89",
      fromComponentId: "comp-1782842647862-79",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782842662695-84",
      toTerminalId: "in_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 365,
          y: -290
        },
        {
          x: 468,
          y: -290
        }
      ],
      routeMode: "manual",
      busType: "pv_pos",
      calculatedCurrentA: 12,
      recommendedCableAwg: "16",
      voltageDropV: 0.578,
      voltageDropPercent: 0.1,
      warnings: []
    },
    {
      id: "conn-1782842825725-91",
      fromComponentId: "comp-1782842438398-42",
      fromTerminalId: "dc_pos",
      toComponentId: "comp-1782842823310-90",
      toTerminalId: "out",
      cableLengthFt: 2,
      routePoints: [
        {
          x: 644,
          y: 240
        }
      ],
      routeMode: "auto",
      busType: "dc_pos",
      calculatedCurrentA: 250,
      recommendedFuseA: 325,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.147,
      voltageDropPercent: 1.15,
      warnings: []
    },
    {
      id: "conn-1782842827140-92",
      fromComponentId: "comp-1782842823310-90",
      fromTerminalId: "in",
      toComponentId: "comp-1782842451840-46",
      toTerminalId: "terminal_1",
      cableLengthFt: 1,
      routePoints: [
        {
          x: 540,
          y: 200
        },
        {
          x: 608,
          y: 200
        }
      ],
      routeMode: "manual",
      busType: "dc_pos",
      calculatedCurrentA: 250,
      recommendedFuseA: 325,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.025,
      voltageDropPercent: 0.2,
      warnings: []
    },
    {
      id: "conn-1782842839873-94",
      fromComponentId: "comp-1782842451840-46",
      fromTerminalId: "terminal_2",
      toComponentId: "comp-1782842834889-93",
      toTerminalId: "in",
      cableLengthFt: 1,
      routePoints: [
        {
          x: 642.67,
          y: 180
        }
      ],
      routeMode: "auto",
      busType: "dc_pos",
      calculatedCurrentA: 250,
      recommendedFuseA: 325,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.025,
      voltageDropPercent: 0.2,
      warnings: []
    },
    {
      id: "conn-1782842841320-95",
      fromComponentId: "comp-1782842834889-93",
      fromTerminalId: "out",
      toComponentId: "comp-1782842526576-59",
      toTerminalId: "dc_pos",
      cableLengthFt: 1,
      routePoints: [
        {
          x: 900,
          y: 180
        }
      ],
      routeMode: "auto",
      busType: "dc_pos",
      calculatedCurrentA: 250,
      recommendedFuseA: 325,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.025,
      voltageDropPercent: 0.2,
      warnings: []
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
