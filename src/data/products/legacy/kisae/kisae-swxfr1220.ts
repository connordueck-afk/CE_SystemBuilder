import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-swxfr1220",
  manufacturer: "KISAE",
  name: "SWXFR 12V 2000W Sine Wave Inverter",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 12,
  continuousPowerW: 2000,
  capabilities: [
    "inverter"
  ],
  description: "KISAE SWXFR 12V sine wave inverter, 2000W.",
  partNumber: "SWXFR1220",
  productUrl: "https://www.cdnrg.com/products/swxfr1220",
  source: "Canadian Energy product index",
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
