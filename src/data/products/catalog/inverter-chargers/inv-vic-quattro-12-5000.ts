import type { Product } from '../../../../types/system';

const product: Product = {
  id: "inv-vic-quattro-12-5000",
  manufacturer: "Victron",
  name: "Quattro 12/5000/220-100/100",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 12,
  continuousPowerW: 5000,
  peakPowerW: 10000,
  maxCurrentA: 420,
  msrpUsd: 2899,
  oemPriceUsd: 2029,
  description: "Victron Quattro 12V 5000W inverter/charger with dual AC inputs",
  partNumber: "QUA012500114",
  productUrl: "https://www.cdnrg.com/products/vequa125021100",
  source: "Victron 2024",
  dataQuality: "partial",
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
      maxCurrentA: 41,
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
      maxCurrentA: 41,
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
    dcVoltageV: 12,
    maxDcCurrentA: 420,
    continuousInverterW: 5000,
    surgeW: 10000,
    chargerCurrentA: 220,
    acInputVoltageV: 120,
    acInputCurrentA: 100,
    acOutputVoltageV: 120,
    acOutputCurrentA: 41,
    transferSwitchA: 100,
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
