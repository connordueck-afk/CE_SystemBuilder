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
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -18,
      requiresOvercurrentProtection: true,
      portId: "dc_in"
    },
    {
      id: "dc_neg",
      label: "DC-",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 18,
      portId: "dc_in"
    },
    {
      id: "ac_out_l",
      label: "AC Out L",
      polarity: "line",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 70,
      offsetY: -12,
      portId: "ac_out"
    },
    {
      id: "ac_out_n",
      label: "AC Out N",
      polarity: "neutral",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 70,
      offsetY: 12,
      portId: "ac_out"
    },
    {
      id: "ve_bus",
      label: "VE.Bus",
      role: "bidirectional",
      side: "top",
      offsetX: 0,
      offsetY: -45,
      portId: "ve_bus"
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
  ],
  ports: [
    {
      id: "dc_in",
      kind: "dc",
      topology: "two_pole",
      label: "DC Input",
      nominalVoltageV: 12
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
