import type { SystemDesign } from '../types/system';

// Last pushed from canvas: 2026-06-25T23:12:24.571Z
export const DEFAULT_SYSTEM: SystemDesign = {
  id: "sys-1782429141784-1",
  name: "48V Off-Grid Cabin",  assumptions: {
    inverterEfficiency: 0.92,
    defaultOemDiscountPercent: 30,
    defaultCableLengthFt: 6,
    maxVoltageDropPercent: 3,
    continuousLoadMultiplier: 1.25,
    batteryInterconnectMaxLengthFt: 3
  },
  createdAt: "2026-06-25T23:12:21.784Z",
  updatedAt: "2026-06-25T23:11:02.343Z",
  components: [
    {
      id: "p3-bat-1",
      productId: "discover-helios-ess-52-48-16000",
      label: "Helios ESS 1",
      quantity: 1,
      x: -220,
      y: 240
    },
    {
      id: "p3-bat-2",
      productId: "discover-helios-ess-52-48-16000",
      label: "Helios ESS 2",
      quantity: 1,
      x: -220,
      y: 440
    },
    {
      id: "p3-fuse-pack",
      productId: "holder-anl-1pos-inline",
      label: "Pack Fuse",
      quantity: 1,
      x: -40,
      y: 340,
      fuseSlots: { slot_1: { installed: true, ratingA: 250 } }
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
      x: 80,
      y: 440,
      inferredConnectionKind: "dc_power",
      inferredPolarity: "negative",
      inferredVoltageClass: "dc_low_voltage"
    },
    {
      id: "p3-solar",
      productId: "solar-array-400w",
      label: "Solar Array (4x 400W)",
      quantity: 1,
      x: -140,
      y: -80
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
      productId: "holder-midi-1pos-inline",
      label: "MPPT Fuse",
      quantity: 1,
      x: 190,
      y: 130,
      fuseSlots: { slot_1: { installed: true, ratingA: 125 } }
    },
    {
      id: "p3-fuse-inv",
      productId: "holder-anl-1pos-inline",
      label: "Inverter Fuse",
      quantity: 1,
      x: 300,
      y: 320,
      fuseSlots: { slot_1: { installed: true, ratingA: 150 } }
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
      x: 280,
      y: 600
    },
    {
      id: "p3-ac-load",
      productId: "acc-ac-load-generic",
      label: "AC Loads",
      quantity: 1,
      x: 720,
      y: 600
    }
  ],
  connections: [
    {
      id: "p3-b2-to-b1-pos",
      fromComponentId: "p3-bat-2",
      fromTerminalId: "dc_pos_1",
      toComponentId: "p3-bat-1",
      toTerminalId: "dc_pos_1",
      cableLengthFt: 1,    },
    {
      id: "p3-b1-to-fuse",
      fromComponentId: "p3-bat-1",
      fromTerminalId: "dc_pos_2",
      toComponentId: "p3-fuse-pack",
      toTerminalId: "in_pos",
      cableLengthFt: 2,    },
    {
      id: "p3-fuse-to-bus",
      fromComponentId: "p3-fuse-pack",
      fromTerminalId: "out_pos",
      toComponentId: "p3-bus-pos",
      toTerminalId: "terminal_1",
      cableLengthFt: 2,    },
    {
      id: "p3-b2-to-b1-neg",
      fromComponentId: "p3-bat-2",
      fromTerminalId: "dc_neg_1",
      toComponentId: "p3-bat-1",
      toTerminalId: "dc_neg_1",
      cableLengthFt: 1,    },
    {
      id: "p3-b1-neg",
      fromComponentId: "p3-bat-1",
      fromTerminalId: "dc_neg_2",
      toComponentId: "p3-bus-neg",
      toTerminalId: "terminal_1",
      cableLengthFt: 2,    },
    {
      id: "p3-solar-pv-pos",
      fromComponentId: "p3-solar",
      fromTerminalId: "pv_pos",
      toComponentId: "p3-mppt",
      toTerminalId: "pv_pos",
      cableLengthFt: 15,    },
    {
      id: "p3-solar-pv-neg",
      fromComponentId: "p3-solar",
      fromTerminalId: "pv_neg",
      toComponentId: "p3-mppt",
      toTerminalId: "pv_neg",
      cableLengthFt: 15,    },
    {
      id: "p3-mppt-to-fuse",
      fromComponentId: "p3-mppt",
      fromTerminalId: "bat_pos",
      toComponentId: "p3-fuse-mppt",
      toTerminalId: "in_pos",
      cableLengthFt: 2,    },
    {
      id: "p3-mppt-fuse-to-bus",
      fromComponentId: "p3-fuse-mppt",
      fromTerminalId: "out_pos",
      toComponentId: "p3-bus-pos",
      toTerminalId: "terminal_3",
      cableLengthFt: 3,    },
    {
      id: "p3-mppt-neg",
      fromComponentId: "p3-mppt",
      fromTerminalId: "bat_neg",
      toComponentId: "p3-bus-neg",
      toTerminalId: "terminal_3",
      cableLengthFt: 5,    },
    {
      id: "p3-bus-to-fuse-inv",
      fromComponentId: "p3-bus-pos",
      fromTerminalId: "terminal_4",
      toComponentId: "p3-fuse-inv",
      toTerminalId: "in_pos",
      cableLengthFt: 3,    },
    {
      id: "p3-fuse-inv-to-inv",
      fromComponentId: "p3-fuse-inv",
      fromTerminalId: "out_pos",
      toComponentId: "p3-inverter",
      toTerminalId: "dc_pos",
      cableLengthFt: 3,    },
    {
      id: "p3-inv-neg",
      fromComponentId: "p3-bus-neg",
      fromTerminalId: "terminal_4",
      toComponentId: "p3-inverter",
      toTerminalId: "dc_neg",
      cableLengthFt: 6,    },
    {
      id: "p3-gen-l",
      fromComponentId: "p3-generator",
      fromTerminalId: "ac_l",
      toComponentId: "p3-inverter",
      toTerminalId: "ac_in_l",
      cableLengthFt: 10,    },
    {
      id: "p3-gen-n",
      fromComponentId: "p3-generator",
      fromTerminalId: "ac_n",
      toComponentId: "p3-inverter",
      toTerminalId: "ac_in_n",
      cableLengthFt: 10,    },
    {
      id: "p3-ac-l",
      fromComponentId: "p3-inverter",
      fromTerminalId: "ac_out_l",
      toComponentId: "p3-ac-load",
      toTerminalId: "ac_l",
      cableLengthFt: 15,    },
    {
      id: "p3-ac-n",
      fromComponentId: "p3-inverter",
      fromTerminalId: "ac_out_n",
      toComponentId: "p3-ac-load",
      toTerminalId: "ac_n",
      cableLengthFt: 15,    }
  ]
};
