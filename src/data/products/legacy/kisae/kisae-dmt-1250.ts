import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-dmt-1250",
  manufacturer: "KISAE",
  name: "DMT-1250 DC-DC Charger with MPPT",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 12,
  maxCurrentA: 50,
  continuousPowerW: 600,
  capabilities: [
    "dc-dc-converter",
    "battery-charger",
    "mppt",
    "pv-input"
  ],
  description: "KISAE DMT smart DC-to-DC battery charger with PV input capability, 12V 50A.",
  partNumber: "DMT-1250",
  productUrl: "https://www.cdnrg.com/products/dmt-1250",
  source: "Canadian Energy product index",
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
    outputCurrentA: 50,
    outputPowerW: 600,
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
      maxCurrentA: 50
    },
    {
      id: "output",
      kind: "dc",
      topology: "two_pole",
      label: "Bat+",
      nominalVoltageV: 12,
      maxCurrentA: 50
    }
  ]
};

export default product;
