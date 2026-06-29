import type { Product } from '../../../../types/system';

const product: Product = {
  id: "multiplus-ii-48-5000-120v",
  manufacturer: "Victron",
  name: "MultiPlus-II 48/5000/70-95 (120V)",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 48,
  continuousPowerW: 5000,
  maxCurrentA: 110,
  msrpUsd: 1453,
  description: "Victron MultiPlus-II 48V/5000VA/70A charger � 120V AC output, VE.Bus",
  partNumber: "PMP482505110",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 90,
  height: 130,
  terminals: [
    {
      id: "dc_pos",
      label: "DC+",
      polarity: "positive",
      role: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -20,
      offsetY: 48,
      requiresOvercurrentProtection: true,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "DC positive bus connection. Requires Class T or ANL fuse between battery and inverter.",
      portId: "dc",
      maxCurrentA: 140
    },
    {
      id: "dc_neg",
      label: "DC-",
      polarity: "negative",
      role: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -12,
      offsetY: 48,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "DC negative bus connection.",
      portId: "dc",
      maxCurrentA: 140
    },
    {
      id: "ac_in_l",
      label: "AC In L",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 2,
      offsetY: 48,
      phases: 1,
      maxCurrentA: 95,
      connector: {
        kind: "screw_terminal"
      },
      notes: "AC input Line conductor (shore power or generator).",
      portId: "ac_in"
    },
    {
      id: "ac_in_n",
      label: "AC In N",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 9,
      offsetY: 48,
      maxCurrentA: 95,
      connector: {
        kind: "screw_terminal"
      },
      notes: "AC input Neutral conductor.",
      portId: "ac_in"
    },
    {
      id: "ac_out_l",
      label: "AC Out L",
      polarity: "line",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 16,
      offsetY: 48,
      phases: 1,
      maxCurrentA: 42,
      connector: {
        kind: "screw_terminal"
      },
      notes: "AC output Line conductor to AC distribution panel.",
      portId: "ac_out"
    },
    {
      id: "ac_out_n",
      label: "AC Out N",
      polarity: "neutral",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 23,
      offsetY: 48,
      maxCurrentA: 42,
      connector: {
        kind: "screw_terminal"
      },
      notes: "AC output Neutral conductor.",
      portId: "ac_out"
    },
    {
      id: "ve_bus",
      label: "VE.Bus",
      role: "bidirectional",
      side: "top",
      offsetX: 0,
      offsetY: -65,
      portId: "ve_bus"
    }
  ],
  inverterChargerRatings: {
    dcVoltageV: 48,
    continuousInverterW: 5000,
    chargerCurrentA: 70,
    acInputVoltageV: 120,
    acOutputVoltageV: 120
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
      maxCurrentA: 140,
      voltageMinV: 9,
      voltageMaxV: 60
    },
    {
      id: "ac_in",
      kind: "ac",
      topology: "two_pole",
      label: "AC Input",
      nominalVoltageV: 120
    },
    {
      id: "ac_out",
      kind: "ac",
      topology: "two_pole",
      label: "AC Output",
      nominalVoltageV: 120
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
