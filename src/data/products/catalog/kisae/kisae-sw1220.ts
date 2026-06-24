import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-sw1220",
  manufacturer: "KISAE",
  name: "SW 12V 2000W Sine Wave Inverter",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 12,
  continuousPowerW: 2000,
  capabilities: [
    "inverter"
  ],
  description: "KISAE SW 12V pure sine wave inverter, 2000W.",
  partNumber: "SW1220",
  productUrl: "https://www.kisaepower.com/products/sw1220/",
  source: "kisaepower.com",
  dataQuality: "partial",
  width: 140,
  height: 90,
  terminals: [
    {
      id: "dc_pos",
      label: "DC+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -18,
      domain: "dc",
      requiresOvercurrentProtection: true
    },
    {
      id: "dc_neg",
      label: "DC-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 18,
      domain: "dc"
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
      side: "right",
      offsetX: 70,
      offsetY: -12,
      domain: "ac"
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
      side: "right",
      offsetX: 70,
      offsetY: 12,
      domain: "ac"
    },
    {
      id: "ve_bus",
      label: "VE.Bus",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: 0,
      offsetY: -45
    }
  ],
  inverterChargerRatings: {
    dcVoltageV: 12,
    continuousInverterW: 2000,
    acOutputVoltageV: 120
  },
  imageUrl: "/product-images/kisae-inverter.svg",
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
