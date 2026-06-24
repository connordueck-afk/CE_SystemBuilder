import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-dmt2430",
  manufacturer: "KISAE",
  name: "DMT2430 DC-DC Charger with MPPT 24V 30A",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 30,
  continuousPowerW: 720,
  capabilities: [
    "dc-dc-converter",
    "battery-charger",
    "mppt",
    "pv-input"
  ],
  description: "KISAE smart DC-to-DC battery charger with PV input, 24V 30A. Charges from alternator or solar.",
  partNumber: "DMT2430",
  productUrl: "https://www.kisaepower.com/products/dmt2430/",
  source: "kisaepower.com",
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
    outputVoltageV: 24,
    outputCurrentA: 30,
    outputPowerW: 720,
    isolated: false
  },
  imageUrl: "/product-images/kisae-dc-dc-mppt.svg"
};

export default product;
