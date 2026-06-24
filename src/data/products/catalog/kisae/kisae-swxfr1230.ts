import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-swxfr1230",
  manufacturer: "KISAE",
  name: "SWXFR 12V 3000W Sine Wave Inverter w/ Transfer Switch",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 12,
  continuousPowerW: 3000,
  capabilities: [
    "inverter"
  ],
  description: "KISAE SWXFR 12V pure sine wave inverter, 3000W with integrated AC transfer switch.",
  partNumber: "SWXFR1230",
  productUrl: "https://www.kisaepower.com/products/swxfr1230/",
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
    continuousInverterW: 3000,
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
