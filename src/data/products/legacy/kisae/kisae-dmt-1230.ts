import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-dmt-1230",
  manufacturer: "KISAE",
  name: "DMT-1230 DC-DC Charger with MPPT",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 12,
  maxCurrentA: 30,
  continuousPowerW: 360,
  capabilities: [
    "dc-dc-converter",
    "battery-charger",
    "mppt",
    "pv-input"
  ],
  description: "KISAE DMT smart DC-to-DC battery charger with PV input capability, 12V 30A.",
  partNumber: "DMT-1230",
  productUrl: "https://www.cdnrg.com/products/dmt-1230",
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
    outputCurrentA: 30,
    outputPowerW: 360,
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
      maxCurrentA: 30
    },
    {
      id: "output",
      kind: "dc",
      topology: "two_pole",
      label: "Bat+",
      nominalVoltageV: 12,
      maxCurrentA: 30
    }
  ]
};

export default product;
