import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-dmt12100",
  manufacturer: "KISAE",
  name: "DMT12100 DC-DC Charger with MPPT 12V 100A",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 12,
  maxCurrentA: 100,
  continuousPowerW: 1200,
  capabilities: [
    "dc-dc-converter",
    "battery-charger",
    "mppt",
    "pv-input"
  ],
  description: "KISAE ABSO smart DC-to-DC battery charger with PV input, 12V 100A. Charges from alternator or solar.",
  partNumber: "DMT12100",
  productUrl: "https://www.kisaepower.com/products/dmt12100/",
  source: "kisaepower.com",
  dataQuality: "partial",
  width: 84,
  height: 112,
  terminals: [
    {
      id: "in_pos",
      portId: "input",
      label: "Alt+",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -42,
      offsetY: -24,
      requiresOvercurrentProtection: true
    },
    {
      id: "in_neg",
      portId: "input",
      label: "Alt-",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -42,
      offsetY: -6
    },
    {
      id: "pv_pos",
      portId: "pv",
      label: "PV+",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: -15,
      offsetY: -56
    },
    {
      id: "pv_neg",
      portId: "pv",
      label: "PV-",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: 15,
      offsetY: -56
    },
    {
      id: "out_pos",
      portId: "output",
      label: "Bat+",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 42,
      offsetY: 24,
      requiresOvercurrentProtection: true
    },
    {
      id: "out_neg",
      portId: "output",
      label: "Bat-",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 42,
      offsetY: 42
    }
  ],
  dcDcChargerRatings: {
    outputVoltageV: 12,
    outputCurrentA: 100,
    outputPowerW: 1200,
    isolated: false
  },
  imageUrl: "/product-images/kisae-dc-dc-mppt.svg",
  ports: [
    {
      id: "input",
      kind: "dc",
      topology: "two_pole",
      label: "Alt+"
    },
    {
      id: "pv",
      kind: "pv",
      topology: "two_pole",
      label: "PV",
      nominalVoltageV: 12,
      maxCurrentA: 100
    },
    {
      id: "output",
      kind: "dc",
      topology: "two_pole",
      label: "Bat+",
      nominalVoltageV: 12,
      maxCurrentA: 100
    }
  ]
};

export default product;
