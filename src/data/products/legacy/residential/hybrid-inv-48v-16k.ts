import type { Product } from '../../../../types/system';

const product: Product = {
  id: "hybrid-inv-48v-16k",
  manufacturer: "Generic",
  name: "Hybrid Solar Inverter 48V/16kW",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 48,
  continuousPowerW: 16000,
  peakPowerW: 32000,
  maxCurrentA: 320,
  capabilities: [
    "hybrid-inverter",
    "inverter-charger",
    "mppt",
    "pv-input",
    "battery-charger"
  ],
  description: "Generic residential hybrid solar inverter. 48V/16kW split-phase output, dual MPPT inputs, dual AC inputs (grid + generator). Representative of EG4, Sol-Ark, Deye class products.",
  dataQuality: "partial",
  width: 160,
  height: 180,
  terminals: [
    {
      id: "dc_pos",
      label: "DC+",
      polarity: "positive",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -80,
      offsetY: -10,
      requiresOvercurrentProtection: true,
      notes: "Battery positive. Requires DC disconnect/fuse between battery and inverter.",
      portId: "dc"
    },
    {
      id: "dc_neg",
      label: "DC-",
      polarity: "negative",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -80,
      offsetY: 10,
      notes: "Battery negative.",
      portId: "dc"
    },
    {
      id: "pv1_pos",
      label: "PV1+",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: -50,
      offsetY: -90,
      maxCurrentA: 160,
      notes: "MPPT tracker 1 PV positive input.",
      portId: "pv1"
    },
    {
      id: "pv1_neg",
      label: "PV1-",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: -30,
      offsetY: -90,
      notes: "MPPT tracker 1 PV negative input.",
      portId: "pv1"
    },
    {
      id: "pv2_pos",
      label: "PV2+",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: 30,
      offsetY: -90,
      maxCurrentA: 160,
      notes: "MPPT tracker 2 PV positive input.",
      portId: "pv2"
    },
    {
      id: "pv2_neg",
      label: "PV2-",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: 50,
      offsetY: -90,
      notes: "MPPT tracker 2 PV negative input.",
      portId: "pv2"
    },
    {
      id: "ac_in1_l1",
      label: "AC In 1 L1",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: -55,
      phases: 1,
      maxCurrentA: 80,
      notes: "AC input 1 (grid) â€” Line 1.",
      portId: "ac_in1"
    },
    {
      id: "ac_in1_l2",
      label: "AC In 1 L2",
      polarity: "line2",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: -40,
      phases: 1,
      maxCurrentA: 80,
      notes: "AC input 1 (grid) â€” Line 2.",
      portId: "ac_in1"
    },
    {
      id: "ac_in1_n",
      label: "AC In 1 N",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: -25,
      notes: "AC input 1 (grid) â€” Neutral.",
      portId: "ac_in1"
    },
    {
      id: "ac_in2_l1",
      label: "AC In 2 L1",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: -5,
      phases: 1,
      maxCurrentA: 80,
      notes: "AC input 2 (generator) â€” Line 1.",
      portId: "ac_in2"
    },
    {
      id: "ac_in2_l2",
      label: "AC In 2 L2",
      polarity: "line2",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: 10,
      phases: 1,
      maxCurrentA: 80,
      notes: "AC input 2 (generator) â€” Line 2.",
      portId: "ac_in2"
    },
    {
      id: "ac_in2_n",
      label: "AC In 2 N",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: 25,
      notes: "AC input 2 (generator) â€” Neutral.",
      portId: "ac_in2"
    },
    {
      id: "ac_out_l1",
      label: "AC Out L1",
      polarity: "line",
      role: "source",
      direction: "output",
      voltageClass: "ac_240v",
      side: "bottom",
      offsetX: -20,
      offsetY: 90,
      phases: 1,
      maxCurrentA: 67,
      notes: "AC output â€” Line 1 (120 V to neutral, 240 V to L2).",
      portId: "ac_out"
    },
    {
      id: "ac_out_l2",
      label: "AC Out L2",
      polarity: "line2",
      role: "source",
      direction: "output",
      voltageClass: "ac_240v",
      side: "bottom",
      offsetX: -5,
      offsetY: 90,
      phases: 1,
      maxCurrentA: 67,
      notes: "AC output â€” Line 2 (120 V to neutral, 240 V to L1).",
      portId: "ac_out"
    },
    {
      id: "ac_out_n",
      label: "AC Out N",
      polarity: "neutral",
      role: "source",
      direction: "output",
      voltageClass: "ac_240v",
      side: "bottom",
      offsetX: 10,
      offsetY: 90,
      notes: "AC output â€” Neutral.",
      portId: "ac_out"
    },
    {
      id: "ve_bus",
      label: "VE.Bus",
      role: "bidirectional",
      side: "top",
      offsetX: 0,
      offsetY: -90,
      portId: "ve_bus"
    }
  ],
  inverterChargerRatings: {
    dcVoltageV: 48,
    maxDcCurrentA: 320,
    continuousInverterW: 16000,
    surgeW: 32000,
    chargerCurrentA: 200,
    acInputVoltageV: 240,
    acInputCurrentA: 80,
    acOutputVoltageV: 240,
    acOutputCurrentA: 67,
    transferSwitchA: 80,
    efficiencyPct: 97,
    mpptTrackerCount: 2,
    maxPvVoltageV: 150,
    maxPvCurrentA: 160,
    maxPvPowerW: 16000
  },
  communicationPorts: [
    {
      id: "ve_bus",
      name: "VE.Bus",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Bus"
      ],
      configuredProtocol: "VE.Bus"
    }
  ],
  ports: [
    {
      id: "dc",
      kind: "dc",
      topology: "two_pole",
      label: "DC",
      nominalVoltageV: 48,
      maxCurrentA: 320
    },
    {
      id: "pv1",
      kind: "pv",
      topology: "two_pole",
      label: "PV1+",
      voltageMaxV: 150,
      maxCurrentA: 160,
      maxPowerW: 16000
    },
    {
      id: "pv2",
      kind: "pv",
      topology: "two_pole",
      label: "PV2+",
      voltageMaxV: 150,
      maxCurrentA: 160,
      maxPowerW: 16000
    },
    {
      id: "ac_in1",
      kind: "ac",
      topology: "two_pole",
      label: "AC In 1 L1",
      nominalVoltageV: 240,
      maxCurrentA: 80
    },
    {
      id: "ac_in2",
      kind: "ac",
      topology: "two_pole",
      label: "AC In 2 L1",
      nominalVoltageV: 240,
      maxCurrentA: 80
    },
    {
      id: "ac_out",
      kind: "ac",
      topology: "two_pole",
      label: "AC Output",
      nominalVoltageV: 240,
      maxCurrentA: 67
    },
    {
      id: "ve_bus",
      kind: "comm",
      label: "VE.Bus",
      topology: "two_pole"
    }
  ]
};

export default product;
