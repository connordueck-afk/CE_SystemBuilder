import type { Product } from '../../../../types/system';

const product: Product = {
  id: "blue-smart-ip65-12-15",
  manufacturer: "Victron",
  name: "Blue Smart IP65 Charger 12/15",
  productType: "shore_charger",
  category: "Charging",
  nominalVoltage: 12,
  maxCurrentA: 15,
  msrpUsd: 176,
  description: "Victron Blue Smart IP65 Charger 12V/15A â€” Bluetooth, IP65 weatherproof, 120VAC input",
  partNumber: "BPC121531104R",
  productUrl: "https://www.cdnrg.com/products/vebpc121531104r",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 80,
  height: 60,
  terminals: [
    {
      id: "ac_l",
      label: "AC L",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      notes: "AC input line conductor."
    },
    {
      id: "ac_n",
      label: "AC N",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      notes: "AC input neutral conductor."
    },
    {
      id: "dc_pos",
      label: "DC+",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: -10,
      requiresOvercurrentProtection: true,
      maxCurrentA: 15,
      notes: "DC output positive. Fuse required on positive conductor."
    },
    {
      id: "dc_neg",
      label: "DC-",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 10,
      maxCurrentA: 15,
      notes: "DC output negative."
    }
  ]
};

export default product;
