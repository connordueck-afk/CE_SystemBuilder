import type { Product } from '../../../../types/system';

const product: Product = {
  id: "multiplus-ii-48-15000-230v",
  manufacturer: "Victron",
  name: "MultiPlus-II 48/15000/200-100 (230V)",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 48,
  continuousPowerW: 15000,
  maxCurrentA: 325,
  msrpUsd: 2963,
  description: "Victron MultiPlus-II 48V/15000VA/200A charger � 230V AC output, VE.Bus",
  partNumber: "PMP483150000",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 90,
  height: 130,
  terminals: [
    {
      id: "dc_pos",
      label: "DC+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -20,
      offsetY: 48,
      domain: "dc",
      requiresOvercurrentProtection: true,
      notes: "DC positive bus connection. Requires Class T or ANL fuse between battery and inverter."
    },
    {
      id: "dc_neg",
      label: "DC-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -12,
      offsetY: 48,
      domain: "dc",
      notes: "DC negative bus connection."
    },
    {
      id: "ac_in_l",
      label: "AC In L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 2,
      offsetY: 48,
      domain: "ac",
      phases: 1,
      maxCurrentA: 100,
      notes: "AC input Line conductor (shore power or generator)."
    },
    {
      id: "ac_in_n",
      label: "AC In N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 9,
      offsetY: 48,
      domain: "ac",
      maxCurrentA: 100,
      notes: "AC input Neutral conductor."
    },
    {
      id: "ac_out_l",
      label: "AC Out L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 16,
      offsetY: 48,
      domain: "ac",
      phases: 1,
      maxCurrentA: 65,
      notes: "AC output Line conductor to AC distribution panel."
    },
    {
      id: "ac_out_n",
      label: "AC Out N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 23,
      offsetY: 48,
      domain: "ac",
      maxCurrentA: 65,
      notes: "AC output Neutral conductor."
    },
    {
      id: "ve_bus",
      label: "VE.Bus",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: 0,
      offsetY: -65
    }
  ],
  inverterChargerRatings: {
    dcVoltageV: 48,
    continuousInverterW: 15000,
    chargerCurrentA: 200,
    acInputVoltageV: 230,
    acOutputVoltageV: 230
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
