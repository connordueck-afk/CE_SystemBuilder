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
    outputCurrentA: 100,
    outputPowerW: 1200,
    isolated: false
  },
  imageUrl: "/product-images/kisae-dc-dc-mppt.svg"
};

export default product;
