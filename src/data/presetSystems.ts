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
  id: "sys-1782868838716-1210",
  name: "48V Off-Grid Cabin",
  nominalVoltage: 12,
  assumptions: {
    inverterEfficiency: 0.92,
    defaultOemDiscountPercent: 30,
    defaultCableLengthFt: 6,
    maxVoltageDropPercent: 3,
    continuousLoadMultiplier: 1.25,
    batteryInterconnectMaxLengthFt: 3
  },
  createdAt: "2026-07-01T01:20:38.716Z",
  updatedAt: "2026-07-01T01:27:58.155Z",
  components: [
    {
      id: "comp-1782868851856-1211",
      productId: "discover-aes-lithium-12-200",
      label: "AES-B LiFePO4 12.8V/200Ah",
      quantity: 1,
      x: 780,
      y: 60,
      includeInBom: true,
      imageScale: 1.271964059955965
    },
    {
      id: "comp-1782868858026-1212",
      productId: "discover-aes-lithium-12-200",
      label: "AES-B LiFePO4 12.8V/200Ah Copy",
      quantity: 1,
      x: 940,
      y: 60,
      includeInBom: true,
      imageScale: 1.271964059955965,
      locked: false
    },
    {
      id: "comp-1782869019506-1227",
      productId: "acc-vic-dc-dc-orion-12-12-30",
      label: "Orion-Tr Smart 12/12-30A",
      quantity: 1,
      x: 660,
      y: -380,
      includeInBom: true
    },
    {
      id: "comp-1782869025105-1228",
      productId: "generic-alternator-source",
      label: "DC Source",
      quantity: 1,
      x: 440,
      y: -180,
      includeInBom: true,
      instanceVoltageV: 12,
      instanceMaxCurrentA: 120,
      rotationDeg: 0
    },
    {
      id: "comp-1782869042254-1231",
      productId: "dist-generic-busbar",
      label: "Generic Busbar 4-point",
      quantity: 1,
      x: 760,
      y: -160,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "negative",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782869044470-1232",
      productId: "dist-generic-busbar",
      label: "Generic Busbar 4-point Copy",
      quantity: 1,
      x: 940,
      y: -160,
      includeInBom: true,
      locked: false,
      inferredElectricalType: "dc_pos",
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782869085524-1237",
      productId: "acc-dc-load-generic",
      label: "DC Load (generic)",
      quantity: 1,
      x: 1140,
      y: -300,
      includeInBom: true,
      instanceVoltageV: 12,
      instanceMaxCurrentA: 8
    },
    {
      id: "comp-1782869101477-1240",
      productId: "mppt-150-70",
      label: "SmartSolar MPPT 150/70",
      quantity: 1,
      x: 880,
      y: -500,
      includeInBom: true
    },
    {
      id: "comp-1782869110625-1243",
      productId: "solar-array-400w",
      label: "Solar Panel 400W",
      quantity: 1,
      x: 480,
      y: -540,
      includeInBom: true
    },
    {
      id: "comp-1782869112650-1244",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy",
      quantity: 1,
      x: 620,
      y: -540,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782869116261-1245",
      productId: "generic-pv-disconnect",
      label: "PV Disconnect",
      quantity: 1,
      x: 740,
      y: -540,
      includeInBom: true
    },
    {
      id: "comp-1782869156547-1251",
      productId: "fuse-mega-littelfuse-125v-30a",
      label: "Fuse",
      quantity: 1,
      x: 1000,
      y: -240,
      rotationDeg: 270,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782869168415-1254",
      productId: "fuse-mega-littelfuse-125v-100a",
      label: "Fuse 2",
      quantity: 1,
      x: 960,
      y: -240,
      rotationDeg: 90,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782869174637-1257",
      productId: "fuse-mega-littelfuse-125v-40a",
      label: "Fuse 3",
      quantity: 1,
      x: 920,
      y: -240,
      rotationDeg: 90,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782869221707-1260",
      productId: "fuse-mega-littelfuse-125v-40a",
      label: "Fuse 4",
      quantity: 1,
      x: 580,
      y: -200,
      rotationDeg: 0,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782869238420-1263",
      productId: "fuse-class-t-125a",
      label: "Fuse 5",
      quantity: 1,
      x: 940,
      y: -60,
      rotationDeg: 180,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    }
  ],
  connections: [
    {
      id: "conn-1782868861567-1213",
      fromComponentId: "comp-1782868851856-1211",
      fromTerminalId: "dc_pos",
      toComponentId: "comp-1782868858026-1212",
      toTerminalId: "dc_pos",
      cableLengthFt: 2,
      busType: "dc_pos",
      calculatedCurrentA: 100,
      recommendedFuseA: 125,
      recommendedCableAwg: "4",
      voltageDropV: 0.1,
      voltageDropPercent: 0.78,
      warnings: []
    },
    {
      id: "conn-1782868862655-1214",
      fromComponentId: "comp-1782868858026-1212",
      fromTerminalId: "dc_neg",
      toComponentId: "comp-1782868851856-1211",
      toTerminalId: "dc_neg",
      cableLengthFt: 2,
      busType: "dc_neg",
      calculatedCurrentA: 100,
      recommendedCableAwg: "4",
      voltageDropV: 0.1,
      voltageDropPercent: 0.78,
      warnings: []
    },
    {
      id: "conn-1782869032819-1230",
      fromComponentId: "comp-1782869025105-1228",
      fromTerminalId: "dc_neg",
      toComponentId: "comp-1782869019506-1227",
      toTerminalId: "in_neg",
      cableLengthFt: 6,
      busType: "dc_neg",
      calculatedCurrentA: 30,
      recommendedCableAwg: "10",
      voltageDropV: 0.36,
      voltageDropPercent: 3,
      warnings: []
    },
    {
      id: "conn-1782869047626-1233",
      fromComponentId: "comp-1782868851856-1211",
      fromTerminalId: "dc_neg",
      toComponentId: "comp-1782869042254-1231",
      toTerminalId: "terminal_1",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 724.0335813619375,
          y: -35.78231081793035
        },
        {
          x: 708,
          y: -35.78231081793035
        }
      ],
      routeMode: "auto",
      busType: "dc_neg",
      calculatedCurrentA: 100,
      recommendedCableAwg: "4",
      voltageDropV: 0.299,
      voltageDropPercent: 2.33,
      warnings: []
    },
    {
      id: "conn-1782869062879-1236",
      fromComponentId: "comp-1782869019506-1227",
      fromTerminalId: "out_neg",
      toComponentId: "comp-1782869042254-1231",
      toTerminalId: "terminal_2",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 676,
          y: -100
        },
        {
          x: 742.67,
          y: -100
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 30,
      recommendedCableAwg: "10",
      voltageDropV: 0.36,
      voltageDropPercent: 3,
      warnings: []
    },
    {
      id: "conn-1782869091299-1239",
      fromComponentId: "comp-1782869042254-1231",
      fromTerminalId: "terminal_4",
      toComponentId: "comp-1782869085524-1237",
      toTerminalId: "dc_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 812,
          y: -100
        },
        {
          x: 1030,
          y: -100
        },
        {
          x: 1030,
          y: -290
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 8,
      recommendedCableAwg: "14",
      voltageDropV: 0.242,
      voltageDropPercent: 2.02,
      warnings: []
    },
    {
      id: "conn-1782869106340-1242",
      fromComponentId: "comp-1782869101477-1240",
      fromTerminalId: "bat_neg",
      toComponentId: "comp-1782869042254-1231",
      toTerminalId: "terminal_3",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 908,
          y: -400
        },
        {
          x: 777.33,
          y: -400
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 70,
      recommendedCableAwg: "4",
      voltageDropV: 0.209,
      voltageDropPercent: 1.74,
      warnings: []
    },
    {
      id: "conn-1782869122794-1246",
      fromComponentId: "comp-1782869110625-1243",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782869112650-1244",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      busType: "unknown",
      calculatedCurrentA: 12,
      recommendedCableAwg: "18",
      voltageDropV: 0.919,
      voltageDropPercent: 2.7,
      warnings: [],
      routePoints: [
        {
          x: 505,
          y: -460
        },
        {
          x: 595,
          y: -460
        }
      ],
      routeMode: "manual"
    },
    {
      id: "conn-1782869123937-1247",
      fromComponentId: "comp-1782869112650-1244",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782869116261-1245",
      toTerminalId: "in_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 645,
          y: -460
        },
        {
          x: 728,
          y: -460
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
      id: "conn-1782869125947-1248",
      fromComponentId: "comp-1782869116261-1245",
      fromTerminalId: "out_pos",
      toComponentId: "comp-1782869101477-1240",
      toTerminalId: "pv_pos",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 744,
          y: -410
        },
        {
          x: 871,
          y: -410
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
      id: "conn-1782869127167-1249",
      fromComponentId: "comp-1782869116261-1245",
      fromTerminalId: "out_neg",
      toComponentId: "comp-1782869101477-1240",
      toTerminalId: "pv_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 752,
          y: -430
        },
        {
          x: 852,
          y: -430
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
      id: "conn-1782869129508-1250",
      fromComponentId: "comp-1782869110625-1243",
      fromTerminalId: "pv_neg",
      toComponentId: "comp-1782869116261-1245",
      toTerminalId: "in_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: 455,
          y: -450
        },
        {
          x: 736,
          y: -450
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
      id: "conn-1782869156547-1252",
      fromComponentId: "comp-1782869044470-1232",
      fromTerminalId: "terminal_4",
      toComponentId: "comp-1782869156547-1251",
      toTerminalId: "in",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 8,
      recommendedFuseA: 10,
      recommendedCableAwg: "14",
      voltageDropV: 0.121,
      voltageDropPercent: 1.01,
      warnings: []
    },
    {
      id: "conn-1782869156547-1253",
      fromComponentId: "comp-1782869156547-1251",
      fromTerminalId: "out",
      toComponentId: "comp-1782869085524-1237",
      toTerminalId: "dc_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 8,
      recommendedFuseA: 10,
      recommendedCableAwg: "14",
      voltageDropV: 0.121,
      voltageDropPercent: 1.01,
      warnings: []
    },
    {
      id: "conn-1782869168415-1255",
      fromComponentId: "comp-1782869101477-1240",
      fromTerminalId: "bat_pos",
      toComponentId: "comp-1782869168415-1254",
      toTerminalId: "in",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 70,
      recommendedFuseA: 100,
      recommendedCableAwg: "4",
      voltageDropV: 0.105,
      voltageDropPercent: 0.87,
      warnings: []
    },
    {
      id: "conn-1782869168415-1256",
      fromComponentId: "comp-1782869168415-1254",
      fromTerminalId: "out",
      toComponentId: "comp-1782869044470-1232",
      toTerminalId: "terminal_3",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 70,
      recommendedFuseA: 100,
      recommendedCableAwg: "4",
      voltageDropV: 0.105,
      voltageDropPercent: 0.87,
      warnings: []
    },
    {
      id: "conn-1782869174637-1258",
      fromComponentId: "comp-1782869019506-1227",
      fromTerminalId: "out_pos",
      toComponentId: "comp-1782869174637-1257",
      toTerminalId: "in",
      cableLengthFt: 3,
      routePoints: [
        {
          x: 665,
          y: -310
        },
        {
          x: 920,
          y: -310
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 30,
      recommendedFuseA: 40,
      recommendedCableAwg: "12",
      voltageDropV: 0.286,
      voltageDropPercent: 2.38,
      warnings: [],
      routeMode: "manual"
    },
    {
      id: "conn-1782869174637-1259",
      fromComponentId: "comp-1782869174637-1257",
      fromTerminalId: "out",
      toComponentId: "comp-1782869044470-1232",
      toTerminalId: "terminal_2",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 30,
      recommendedFuseA: 40,
      recommendedCableAwg: "12",
      voltageDropV: 0.286,
      voltageDropPercent: 2.38,
      warnings: []
    },
    {
      id: "conn-1782869221707-1261",
      fromComponentId: "comp-1782869025105-1228",
      fromTerminalId: "dc_pos",
      toComponentId: "comp-1782869221707-1260",
      toTerminalId: "in",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 30,
      recommendedFuseA: 40,
      recommendedCableAwg: "12",
      voltageDropV: 0.286,
      voltageDropPercent: 2.38,
      warnings: []
    },
    {
      id: "conn-1782869221707-1262",
      fromComponentId: "comp-1782869221707-1260",
      fromTerminalId: "out",
      toComponentId: "comp-1782869019506-1227",
      toTerminalId: "in_pos",
      cableLengthFt: 3,
      busType: "dc_pos",
      calculatedCurrentA: 30,
      recommendedFuseA: 40,
      recommendedCableAwg: "12",
      voltageDropV: 0.286,
      voltageDropPercent: 2.38,
      warnings: []
    },
    {
      id: "conn-1782869238420-1264",
      fromComponentId: "comp-1782868858026-1212",
      fromTerminalId: "dc_pos",
      toComponentId: "comp-1782869238420-1263",
      toTerminalId: "in",
      cableLengthFt: 3,
      routePoints: [
        {
          x: 995.9664186380625,
          y: -60
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 100,
      recommendedFuseA: 125,
      recommendedCableAwg: "4",
      voltageDropV: 0.149,
      voltageDropPercent: 1.17,
      warnings: [],
      routeMode: "manual"
    },
    {
      id: "conn-1782869238420-1265",
      fromComponentId: "comp-1782869238420-1263",
      fromTerminalId: "out",
      toComponentId: "comp-1782869044470-1232",
      toTerminalId: "terminal_1",
      cableLengthFt: 3,
      routePoints: [
        {
          x: 888,
          y: -70
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 100,
      recommendedFuseA: 125,
      recommendedCableAwg: "4",
      voltageDropV: 0.149,
      voltageDropPercent: 1.24,
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
  id: "sys-1782867352547-5",
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
  createdAt: "2026-07-01T00:55:52.547Z",
  updatedAt: "2026-07-01T01:09:01.478Z",
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
      productId: "fuse-class-t-350a",
      label: "Fuse",
      quantity: 1,
      x: 260,
      y: -580,
      rotationDeg: 180,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "comp-1782867565808-42",
      productId: "solar-array-400w",
      label: "Solar Panel 400W",
      quantity: 1,
      x: 440,
      y: -1440,
      includeInBom: true
    },
    {
      id: "comp-1782867576760-61",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy",
      quantity: 1,
      x: 580,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867578965-74",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy",
      quantity: 1,
      x: 720,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867580526-87",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy Copy",
      quantity: 1,
      x: 860,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867581782-100",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy Copy Copy",
      quantity: 1,
      x: 1000,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867583785-113",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy Copy Copy Copy",
      quantity: 1,
      x: 1140,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867633532-193",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy Copy Copy Copy Copy",
      quantity: 1,
      x: 1280,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867634822-204",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy Copy Copy Copy Copy Copy",
      quantity: 1,
      x: 1420,
      y: -1440,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-262",
      productId: "solar-array-400w",
      label: "Solar Panel 400W",
      quantity: 1,
      x: 440,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-263",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy",
      quantity: 1,
      x: 580,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-264",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy",
      quantity: 1,
      x: 720,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-265",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy Copy",
      quantity: 1,
      x: 860,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-266",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy Copy Copy",
      quantity: 1,
      x: 1000,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-267",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy Copy Copy Copy",
      quantity: 1,
      x: 1140,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-268",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy Copy Copy Copy Copy",
      quantity: 1,
      x: 1280,
      y: -1280,
      includeInBom: true,
      locked: false
    },
    {
      id: "comp-1782867650658-269",
      productId: "solar-array-400w",
      label: "Solar Panel 400W Copy Copy Copy Copy Copy Copy Copy",
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
      label: "Generator",
      quantity: 1,
      x: 980,
      y: -400,
      includeInBom: true,
      instanceVoltageV: 120,
      instanceMaxCurrentA: 40,
      rotationDeg: 180
    },
    {
      id: "comp-1782867874813-497",
      productId: "generic-grid-source-240v",
      label: "Grid",
      quantity: 1,
      x: 980,
      y: -500,
      includeInBom: true,
      instanceVoltageV: 120,
      instanceMaxCurrentA: 40,
      rotationDeg: 180,
      locked: false
    },
    {
      id: "comp-1782867890071-533",
      productId: "acc-ac-load-split-phase-240v",
      label: "AC Loads",
      quantity: 1,
      x: 980,
      y: -600,
      includeInBom: true,
      instanceVoltageV: 120,
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
      calculatedCurrentA: 200,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.039,
      voltageDropPercent: 0.08,
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
      routeMode: "manual"
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
      calculatedCurrentA: 200,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.039,
      voltageDropPercent: 0.08,
      warnings: []
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
      calculatedCurrentA: 200,
      recommendedFuseA: 250,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.039,
      voltageDropPercent: 0.08,
      warnings: []
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
      calculatedCurrentA: 200,
      recommendedFuseA: 250,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.039,
      voltageDropPercent: 0.08,
      warnings: []
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
      voltageDropPercent: 0.29,
      warnings: []
    },
    {
      id: "conn-1782867508124-19",
      fromComponentId: "comp-1782867373333-10",
      fromTerminalId: "dc_pos_1",
      toComponentId: "comp-1782867508123-18",
      toTerminalId: "in",
      cableLengthFt: 3,
      routePoints: [
        {
          x: 417,
          y: -580
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 250,
      recommendedFuseA: 325,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.074,
      voltageDropPercent: 0.14,
      warnings: [],
      routeMode: "manual"
    },
    {
      id: "conn-1782867508124-20",
      fromComponentId: "comp-1782867508123-18",
      fromTerminalId: "out",
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
      recommendedFuseA: 325,
      recommendedCableAwg: "4/0",
      voltageDropV: 0.074,
      voltageDropPercent: 0.15,
      warnings: [],
      routeMode: "manual"
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
      warnings: []
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
      warnings: []
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
      warnings: []
    },
    {
      id: "conn-1782867587110-126",
      fromComponentId: "comp-1782867565808-42",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867576760-61",
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
      id: "conn-1782867588024-133",
      fromComponentId: "comp-1782867576760-61",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867578965-74",
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
      id: "conn-1782867589005-140",
      fromComponentId: "comp-1782867578965-74",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867580526-87",
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
      id: "conn-1782867589947-147",
      fromComponentId: "comp-1782867580526-87",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867581782-100",
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
      id: "conn-1782867590878-154",
      fromComponentId: "comp-1782867581782-100",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867583785-113",
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
      voltageDropPercent: 1.2,
      warnings: []
    },
    {
      id: "conn-1782867639237-223",
      fromComponentId: "comp-1782867633532-193",
      fromTerminalId: "pv_neg",
      toComponentId: "comp-1782867583785-113",
      toTerminalId: "pv_pos",
      cableLengthFt: 6,
      busType: "unknown",
      calculatedCurrentA: 12,
      recommendedCableAwg: "18",
      voltageDropV: 0.919,
      voltageDropPercent: 2.7,
      warnings: []
    },
    {
      id: "conn-1782867640355-230",
      fromComponentId: "comp-1782867633532-193",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867634822-204",
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
      voltageDropPercent: 1.2,
      warnings: []
    },
    {
      id: "conn-1782867664424-298",
      fromComponentId: "comp-1782867650658-262",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-263",
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
      id: "conn-1782867665355-305",
      fromComponentId: "comp-1782867650658-263",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-264",
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
      id: "conn-1782867666228-312",
      fromComponentId: "comp-1782867650658-264",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-265",
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
      id: "conn-1782867669362-319",
      fromComponentId: "comp-1782867650658-265",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-266",
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
      id: "conn-1782867670567-326",
      fromComponentId: "comp-1782867650658-266",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-267",
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
      id: "conn-1782867672200-333",
      fromComponentId: "comp-1782867650658-267",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-268",
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
      id: "conn-1782867673203-340",
      fromComponentId: "comp-1782867650658-268",
      fromTerminalId: "pv_pos",
      toComponentId: "comp-1782867650658-269",
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
      voltageDropPercent: 1.2,
      warnings: []
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
      voltageDropPercent: 1.2,
      warnings: []
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
      recommendedFuseA: 40,
      recommendedCableAwg: "12",
      voltageDropV: 0.572,
      voltageDropPercent: 0.24,
      warnings: []
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
      recommendedFuseA: 40,
      recommendedCableAwg: "12",
      voltageDropV: 0.572,
      voltageDropPercent: 0.24,
      warnings: []
    },
    {
      id: "conn-1782867911464-570",
      fromComponentId: "comp-1782867470682-15",
      fromTerminalId: "ac_gen_l2",
      toComponentId: "comp-1782867851040-440",
      toTerminalId: "l2_in",
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
      calculatedCurrentA: 0,
      recommendedCableAwg: "10",
      voltageDropV: 0,
      voltageDropPercent: 0,
      warnings: []
    },
    {
      id: "conn-1782867913734-577",
      fromComponentId: "comp-1782867470682-15",
      fromTerminalId: "ac_gen_l1",
      toComponentId: "comp-1782867851040-440",
      toTerminalId: "l1_in",
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
      calculatedCurrentA: 0,
      recommendedCableAwg: "10",
      voltageDropV: 0,
      voltageDropPercent: 0,
      warnings: []
    },
    {
      id: "conn-1782867915172-584",
      fromComponentId: "comp-1782867847805-433",
      fromTerminalId: "l1_in",
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
      calculatedCurrentA: 0,
      recommendedCableAwg: "10",
      voltageDropV: 0,
      voltageDropPercent: 0,
      warnings: []
    },
    {
      id: "conn-1782867917896-591",
      fromComponentId: "comp-1782867470682-15",
      fromTerminalId: "ac_grid_l2",
      toComponentId: "comp-1782867847805-433",
      toTerminalId: "l2_in",
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
      calculatedCurrentA: 0,
      recommendedCableAwg: "10",
      voltageDropV: 0,
      voltageDropPercent: 0,
      warnings: []
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
      recommendedFuseA: 40,
      recommendedCableAwg: "12",
      voltageDropV: 0.572,
      voltageDropPercent: 0.24,
      warnings: []
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
      recommendedFuseA: 40,
      recommendedCableAwg: "12",
      voltageDropV: 0.572,
      voltageDropPercent: 0.24,
      warnings: []
    },
    {
      id: "conn-1782867979043-742",
      fromComponentId: "comp-1782867851040-440",
      fromTerminalId: "l2_out",
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
      warnings: []
    },
    {
      id: "conn-1782867980793-749",
      fromComponentId: "comp-1782867874813-497",
      fromTerminalId: "ac_l1",
      toComponentId: "comp-1782867851040-440",
      toTerminalId: "l1_out",
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
      warnings: []
    },
    {
      id: "conn-1782867982316-756",
      fromComponentId: "comp-1782867847805-433",
      fromTerminalId: "l2_out",
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
      warnings: []
    },
    {
      id: "conn-1782867983843-763",
      fromComponentId: "comp-1782867869646-470",
      fromTerminalId: "ac_l1",
      toComponentId: "comp-1782867847805-433",
      toTerminalId: "l1_out",
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
      warnings: []
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
      voltageDropPercent: 0.24,
      warnings: []
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
          y: -484
        }
      ],
      routeMode: "manual",
      busType: "ac_neutral",
      calculatedCurrentA: 40,
      recommendedCableAwg: "10",
      voltageDropV: 0.48,
      voltageDropPercent: 0.2,
      warnings: []
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
      voltageDropPercent: 0.2,
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
