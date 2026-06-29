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
  id: "sys-1782677616826-1",
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
  createdAt: "2026-06-28T20:13:36.826Z",
  updatedAt: "2026-06-28T20:17:11.416Z",
  components: [
    {
      id: "comp-1782677621992-2",
      productId: "discover-helios-ess-52-48-16000",
      label: "HELIOS ESS 52-48-16000",
      quantity: 1,
      x: 80,
      y: 340,
      includeInBom: true,
      imageScale: 2
    },
    {
      id: "comp-1782677671538-9",
      productId: "discover-helios-ess-52-48-16000",
      label: "HELIOS ESS 52-48-16000 Copy",
      quantity: 1,
      x: -120,
      y: 340,
      includeInBom: true,
      imageScale: 2,
      locked: false
    },
    {
      id: "comp-1782677705858-13",
      productId: "discover-helios-ess-52-48-16000",
      label: "HELIOS ESS 52-48-16000 Copy Copy",
      quantity: 1,
      x: -320,
      y: 340,
      includeInBom: true,
      imageScale: 2,
      locked: false
    },
    {
      id: "comp-1782677787656-18",
      productId: "acc-dc-load-generic",
      label: "DC Load (generic)",
      quantity: 1,
      x: 260,
      y: 20,
      includeInBom: true,
      instanceVoltageV: 48,
      instanceMaxCurrentA: 150
    },
    {
      id: "comp-1782677820985-21",
      productId: "fuse-midi-200a",
      label: "Fuse",
      quantity: 1,
      x: 170,
      y: 95,
      rotationDeg: 270,
      includeInBom: true,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "positive",
      inferredVoltageClass: "dc_low_voltage"
    }
  ],
  connections: [
    {
      id: "conn-1782677711809-14",
      fromComponentId: "comp-1782677705858-13",
      fromTerminalId: "dc_pos_1",
      toComponentId: "comp-1782677671538-9",
      toTerminalId: "dc_pos_2",
      cableLengthFt: 2,
      routePoints: [
        {
          x: -230,
          y: 216
        },
        {
          x: -230,
          y: 180
        },
        {
          x: -30,
          y: 180
        },
        {
          x: -30,
          y: 230
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
      id: "conn-1782677712997-15",
      fromComponentId: "comp-1782677671538-9",
      fromTerminalId: "dc_pos_1",
      toComponentId: "comp-1782677621992-2",
      toTerminalId: "dc_pos_2",
      cableLengthFt: 2,
      routePoints: [
        {
          x: -30,
          y: 216
        },
        {
          x: -30,
          y: 180
        },
        {
          x: 170,
          y: 180
        },
        {
          x: 170,
          y: 230
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
      id: "conn-1782677714730-16",
      fromComponentId: "comp-1782677621992-2",
      fromTerminalId: "dc_neg_1",
      toComponentId: "comp-1782677671538-9",
      toTerminalId: "dc_neg_2",
      cableLengthFt: 2,
      routePoints: [
        {
          x: -10,
          y: 216
        },
        {
          x: -10,
          y: 150
        },
        {
          x: -210,
          y: 150
        },
        {
          x: -210,
          y: 230
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 150,
      recommendedCableAwg: "1",
      voltageDropV: 0.074,
      voltageDropPercent: 0.15,
      warnings: []
    },
    {
      id: "conn-1782677716262-17",
      fromComponentId: "comp-1782677671538-9",
      fromTerminalId: "dc_neg_1",
      toComponentId: "comp-1782677705858-13",
      toTerminalId: "dc_neg_2",
      cableLengthFt: 2,
      routePoints: [
        {
          x: -210,
          y: 216
        },
        {
          x: -210,
          y: 150
        },
        {
          x: -410,
          y: 150
        },
        {
          x: -410,
          y: 230
        }
      ],
      routeMode: "manual",
      busType: "dc_neg",
      calculatedCurrentA: 150,
      recommendedCableAwg: "1",
      voltageDropV: 0.074,
      voltageDropPercent: 0.15,
      warnings: []
    },
    {
      id: "conn-1782677801296-20",
      fromComponentId: "comp-1782677705858-13",
      fromTerminalId: "dc_neg_1",
      toComponentId: "comp-1782677787656-18",
      toTerminalId: "dc_neg",
      cableLengthFt: 6,
      routePoints: [
        {
          x: -410,
          y: 216
        },
        {
          x: -410,
          y: 30
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
      id: "conn-1782677820985-24",
      fromComponentId: "comp-1782677787656-18",
      fromTerminalId: "dc_pos",
      toComponentId: "comp-1782677820985-21",
      toTerminalId: "out",
      cableLengthFt: 3,
      routePoints: [
        {
          x: 170,
          y: 10
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 150,
      recommendedFuseA: 200,
      recommendedCableAwg: "1/0",
      voltageDropV: 0.088,
      voltageDropPercent: 0.18,
      warnings: []
    },
    {
      id: "conn-1782677820985-25",
      fromComponentId: "comp-1782677820985-21",
      fromTerminalId: "in",
      toComponentId: "comp-1782677621992-2",
      toTerminalId: "dc_pos_1",
      cableLengthFt: 3,
      routePoints: [
        {
          x: 170,
          y: 216
        }
      ],
      busType: "dc_pos",
      calculatedCurrentA: 150,
      recommendedFuseA: 200,
      recommendedCableAwg: "1/0",
      voltageDropV: 0.088,
      voltageDropPercent: 0.17,
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
    name: 'Simple 12V Solar',
    description:
      'Small 12 V starter system slot for the final default library.',
    voltage: 12,
    tags: ['12V', 'Small', 'Solar'],
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
