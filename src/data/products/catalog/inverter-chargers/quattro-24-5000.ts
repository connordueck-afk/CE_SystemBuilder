import type { Product } from '../../../../types/system';

const product: Product = {
  id: "quattro-24-5000",
  manufacturer: "Victron",
  name: "Quattro 24/5000/120-100/100",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 24,
  continuousPowerW: 5000,
  maxCurrentA: 220,
  msrpUsd: 2358,
  description: "Victron Quattro 24V/5000VA/120A charger � dual AC input, 120V, VE.Bus",
  partNumber: "QUA245021010",
  productUrl: "https://www.cdnrg.com/products/vequa245023110",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 90,
  height: 130,
  terminals: [
    {
      id: "dc_pos",
      label: "DC+",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -20,
      offsetY: 48,
      requiresOvercurrentProtection: true,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "DC positive bus connection. Requires Class T or ANL fuse between battery and inverter."
    },
    {
      id: "dc_neg",
      label: "DC-",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -12,
      offsetY: 48,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "DC negative bus connection."
    },
    {
      id: "ac_in_l",
      label: "AC In L",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 2,
      offsetY: 48,
      phases: 1,
      maxCurrentA: 100,
      connector: { kind: 'screw_terminal' },
      notes: "AC input Line conductor (shore power or generator)."
    },
    {
      id: "ac_in_n",
      label: "AC In N",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 9,
      offsetY: 48,
      maxCurrentA: 100,
      connector: { kind: 'screw_terminal' },
      notes: "AC input Neutral conductor."
    },
    {
      id: "ac_out_l",
      label: "AC Out L",
      kind: "ac_power",
      polarity: "line",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 16,
      offsetY: 48,
      phases: 1,
      maxCurrentA: 42,
      connector: { kind: 'screw_terminal' },
      notes: "AC output Line conductor to AC distribution panel."
    },
    {
      id: "ac_out_n",
      label: "AC Out N",
      kind: "ac_power",
      polarity: "neutral",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 23,
      offsetY: 48,
      maxCurrentA: 42,
      connector: { kind: 'screw_terminal' },
      notes: "AC output Neutral conductor."
    },
    {
      id: "ac_in2_l",
      label: "AC In 2 L",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "top",
      offsetX: -4,
      offsetY: -48,
      phases: 1,
      maxCurrentA: 100,
      connector: { kind: 'screw_terminal' },
      notes: "AC input 2 Line conductor (generator or second grid supply)."
    },
    {
      id: "ac_in2_n",
      label: "AC In 2 N",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "top",
      offsetX: 3,
      offsetY: -48,
      maxCurrentA: 100,
      connector: { kind: 'screw_terminal' },
      notes: "AC input 2 Neutral conductor."
    },
    {
      id: "ve_bus",
      label: "VE.Bus",
      kind: "network",
      role: "bidirectional",
      side: "top",
      offsetX: 0,
      offsetY: -65
    }
  ],
  inverterChargerRatings: {
    dcVoltageV: 24,
    continuousInverterW: 5000,
    chargerCurrentA: 120,
    acInputVoltageV: 120,
    acOutputVoltageV: 120,
    transferSwitchA: 100
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
  ]
};

export default product;
