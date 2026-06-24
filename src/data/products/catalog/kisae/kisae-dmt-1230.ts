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
      label: "Alt+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -42,
      offsetY: -24,
      domain: "dc",
      requiresOvercurrentProtection: true
    },
    {
      id: "in_neg",
      label: "Alt-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -42,
      offsetY: -6,
      domain: "dc"
    },
    {
      id: "pv_pos",
      label: "PV+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: -15,
      offsetY: -56,
      domain: "pv"
    },
    {
      id: "pv_neg",
      label: "PV-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: 15,
      offsetY: -56,
      domain: "pv"
    },
    {
      id: "out_pos",
      label: "Bat+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 42,
      offsetY: 24,
      domain: "dc",
      requiresOvercurrentProtection: true
    },
    {
      id: "out_neg",
      label: "Bat-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 42,
      offsetY: 42,
      domain: "dc"
    }
  ],
  dcDcChargerRatings: {
    outputVoltageV: 12,
    outputCurrentA: 30,
    outputPowerW: 360,
    isolated: false
  },
  imageUrl: "/product-images/kisae-dc-dc-mppt.svg"
};

export default product;
