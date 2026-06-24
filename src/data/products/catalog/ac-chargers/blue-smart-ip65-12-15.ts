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
  description: "Victron Blue Smart IP65 Charger 12V/15A — Bluetooth, IP65 weatherproof, 120VAC input",
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
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      domain: "ac",
      notes: "AC input line conductor."
    },
    {
      id: "ac_n",
      label: "AC N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      domain: "ac",
      notes: "AC input neutral conductor."
    },
    {
      id: "dc_pos",
      label: "DC+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: -10,
      domain: "dc",
      requiresOvercurrentProtection: true,
      maxCurrentA: 15,
      notes: "DC output positive. Fuse required on positive conductor."
    },
    {
      id: "dc_neg",
      label: "DC-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 10,
      domain: "dc",
      maxCurrentA: 15,
      notes: "DC output negative."
    }
  ]
};

export default product;
