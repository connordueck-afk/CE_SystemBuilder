import type { Product } from '../../../../types/system';

const product: Product = {
  id: "hybrid-inv-48v-16k",
  manufacturer: "Generic",
  name: "Hybrid Solar Inverter 48V/16kW",
  productType: "inverter_charger",
  category: "Hybrid Inverters",
  nominalVoltage: 48,
  continuousPowerW: 16000,
  peakPowerW: 32000,
  maxCurrentA: 320,
  msrpUsd: 0,
  capabilities: [
    "hybrid-inverter",
    "inverter-charger",
    "mppt",
    "pv-input",
    "battery-charger"
  ],
  description: "Generic residential hybrid solar inverter. 48V/16kW split-phase output, dual MPPT inputs, dual AC inputs (grid and generator). Representative of EG4, Sol-Ark, and Deye class products.",
  source: "Legacy catalog rebuild; representative generic residential hybrid inverter class",
  dataQuality: "partial",
  width: 160,
  height: 180,
  terminalGroups: [
    {
      id: "dc_pos",
      portId: "dc",
      label: "Battery Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 320,
      requiresOvercurrentProtection: true,
      requiresDisconnect: true,
      notes: "Battery positive. Requires external DC disconnect and overcurrent protection sized to the installation."
    },
    {
      id: "dc_neg",
      portId: "dc",
      label: "Battery Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 320
    },
    {
      id: "pv1_pos",
      portId: "pv1",
      label: "PV1 Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 160,
      maxVoltageV: 150
    },
    {
      id: "pv1_neg",
      portId: "pv1",
      label: "PV1 Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 160,
      maxVoltageV: 150
    },
    {
      id: "pv2_pos",
      portId: "pv2",
      label: "PV2 Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 160,
      maxVoltageV: 150
    },
    {
      id: "pv2_neg",
      portId: "pv2",
      label: "PV2 Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 160,
      maxVoltageV: 150
    },
    {
      id: "ac_in1_l1",
      portId: "ac_in1",
      label: "AC In 1 L1",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 80
    },
    {
      id: "ac_in1_l2",
      portId: "ac_in1",
      label: "AC In 1 L2",
      groupType: "power_conductor",
      polarity: "line2",
      internallyCommon: false,
      maxCurrentA: 80
    },
    {
      id: "ac_in1_n",
      portId: "ac_in1",
      label: "AC In 1 Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 80
    },
    {
      id: "ac_in2_l1",
      portId: "ac_in2",
      label: "AC In 2 L1",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 80
    },
    {
      id: "ac_in2_l2",
      portId: "ac_in2",
      label: "AC In 2 L2",
      groupType: "power_conductor",
      polarity: "line2",
      internallyCommon: false,
      maxCurrentA: 80
    },
    {
      id: "ac_in2_n",
      portId: "ac_in2",
      label: "AC In 2 Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 80
    },
    {
      id: "ac_out_l1",
      portId: "ac_out",
      label: "AC Out L1",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 67
    },
    {
      id: "ac_out_l2",
      portId: "ac_out",
      label: "AC Out L2",
      groupType: "power_conductor",
      polarity: "line2",
      internallyCommon: false,
      maxCurrentA: 67
    },
    {
      id: "ac_out_n",
      portId: "ac_out",
      label: "AC Out Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 67
    },
    {
      id: "comm_iface",
      portId: "comm",
      label: "Communication Interface",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "dc_pos",
      terminalGroupId: "dc_pos",
      label: "DC+",
      side: "left",
      offsetX: -80,
      offsetY: -10,
      connector: { kind: "stud", holeSize: "M10" },
      notes: "Battery positive terminal."
    },
    {
      id: "dc_neg",
      terminalGroupId: "dc_neg",
      label: "DC-",
      side: "left",
      offsetX: -80,
      offsetY: 10,
      connector: { kind: "stud", holeSize: "M10" },
      notes: "Battery negative terminal."
    },
    {
      id: "pv1_pos",
      terminalGroupId: "pv1_pos",
      label: "PV1+",
      side: "top",
      offsetX: -50,
      offsetY: -90,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "pv1_neg",
      terminalGroupId: "pv1_neg",
      label: "PV1-",
      side: "top",
      offsetX: -30,
      offsetY: -90,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "pv2_pos",
      terminalGroupId: "pv2_pos",
      label: "PV2+",
      side: "top",
      offsetX: 30,
      offsetY: -90,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "pv2_neg",
      terminalGroupId: "pv2_neg",
      label: "PV2-",
      side: "top",
      offsetX: 50,
      offsetY: -90,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "comm",
      terminalGroupId: "comm_iface",
      label: "Comm",
      side: "top",
      offsetX: 0,
      offsetY: -90
    },
    {
      id: "ac_in1_l1",
      terminalGroupId: "ac_in1_l1",
      label: "AC In 1 L1",
      side: "right",
      offsetX: 80,
      offsetY: -55,
      maxCurrentA: 80,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_in1_l2",
      terminalGroupId: "ac_in1_l2",
      label: "AC In 1 L2",
      side: "right",
      offsetX: 80,
      offsetY: -40,
      maxCurrentA: 80,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_in1_n",
      terminalGroupId: "ac_in1_n",
      label: "AC In 1 N",
      side: "right",
      offsetX: 80,
      offsetY: -25,
      maxCurrentA: 80,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_in2_l1",
      terminalGroupId: "ac_in2_l1",
      label: "AC In 2 L1",
      side: "right",
      offsetX: 80,
      offsetY: -5,
      maxCurrentA: 80,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_in2_l2",
      terminalGroupId: "ac_in2_l2",
      label: "AC In 2 L2",
      side: "right",
      offsetX: 80,
      offsetY: 10,
      maxCurrentA: 80,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_in2_n",
      terminalGroupId: "ac_in2_n",
      label: "AC In 2 N",
      side: "right",
      offsetX: 80,
      offsetY: 25,
      maxCurrentA: 80,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_out_l1",
      terminalGroupId: "ac_out_l1",
      label: "AC Out L1",
      side: "bottom",
      offsetX: -20,
      offsetY: 90,
      maxCurrentA: 67,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_out_l2",
      terminalGroupId: "ac_out_l2",
      label: "AC Out L2",
      side: "bottom",
      offsetX: -5,
      offsetY: 90,
      maxCurrentA: 67,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_out_n",
      terminalGroupId: "ac_out_n",
      label: "AC Out N",
      side: "bottom",
      offsetX: 10,
      offsetY: 90,
      maxCurrentA: 67,
      connector: { kind: "screw_terminal" }
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
      id: "comm",
      name: "Communication",
      connectorType: "RJ45",
      supportedProtocols: ["BMS-Can", "RS485", "Other"],
      configuredProtocol: "Other",
      isConfigurable: true,
      notes: "Representative communication interface for generic residential hybrid inverters."
    }
  ],
  ports: [
    {
      id: "dc",
      kind: "dc",
      topology: "two_pole",
      label: "Battery DC",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 48,
      maxCurrentA: 320,
      role: "bidirectional",
      direction: "bidirectional"
    },
    {
      id: "pv1",
      kind: "pv",
      topology: "two_pole",
      label: "PV Tracker 1",
      voltageClass: "pv_high_voltage",
      voltageMaxV: 150,
      maxCurrentA: 160,
      maxPowerW: 8000,
      role: "sink",
      direction: "input"
    },
    {
      id: "pv2",
      kind: "pv",
      topology: "two_pole",
      label: "PV Tracker 2",
      voltageClass: "pv_high_voltage",
      voltageMaxV: 150,
      maxCurrentA: 160,
      maxPowerW: 8000,
      role: "sink",
      direction: "input"
    },
    {
      id: "ac_in1",
      kind: "ac",
      topology: "two_pole",
      label: "AC Input 1",
      voltageClass: "ac_240v",
      nominalVoltageV: 240,
      maxCurrentA: 80,
      phases: 2,
      role: "sink",
      direction: "input"
    },
    {
      id: "ac_in2",
      kind: "ac",
      topology: "two_pole",
      label: "AC Input 2",
      voltageClass: "ac_240v",
      nominalVoltageV: 240,
      maxCurrentA: 80,
      phases: 2,
      role: "sink",
      direction: "input"
    },
    {
      id: "ac_out",
      kind: "ac",
      topology: "two_pole",
      label: "AC Output",
      voltageClass: "ac_240v",
      nominalVoltageV: 240,
      maxCurrentA: 67,
      phases: 2,
      role: "source",
      direction: "output"
    },
    {
      id: "comm",
      kind: "comm",
      topology: "two_pole",
      label: "Communication",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["BMS-Can", "RS485", "Other"],
      configuredProtocol: "Other",
      isConfigurable: true
    }
  ]
};

export default product;
