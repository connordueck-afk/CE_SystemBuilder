import type { Product } from '../../../../types/system';

const product: Product = {
  id: "inv-vic-mp2-12-3000",
  manufacturer: "Victron",
  name: "MultiPlus-II 12/3000/120-50",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 12,
  continuousPowerW: 3000,
  peakPowerW: 6000,
  maxCurrentA: 250,
  msrpUsd: 1699,
  oemPriceUsd: 1189,
  description: "Victron MultiPlus-II 12V 3000W inverter/charger with 120A charger",
  partNumber: "EAS010300114",
  productUrl: "https://www.victronenergy.com/inverters-chargers/multiplus-ii",
  source: "Victron 2024",
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
      maxCurrentA: 50,
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
      maxCurrentA: 50,
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
      maxCurrentA: 25,
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
      maxCurrentA: 25,
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
    dcVoltageV: 12,
    maxDcCurrentA: 250,
    continuousInverterW: 3000,
    surgeW: 6000,
    chargerCurrentA: 120,
    acInputVoltageV: 120,
    acInputCurrentA: 50,
    acOutputVoltageV: 120,
    acOutputCurrentA: 25,
    transferSwitchA: 50,
    efficiencyPct: 94
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
