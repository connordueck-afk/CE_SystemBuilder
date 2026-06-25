import type { Product } from '../../../../types/system';

const product: Product = {
  id: "skylla-ip65-24-70",
  manufacturer: "Victron",
  name: "Skylla-IP65 24/70 Charger",
  productType: "shore_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 70,
  continuousPowerW: 1680,
  msrpUsd: 1350,
  description: "Victron Skylla-IP65 24V/70A â€” industrial AC charger with CAN-bus, IP65, 120/240VAC input",
  partNumber: "SKI024070000",
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
      maxCurrentA: 70,
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
      maxCurrentA: 70,
      notes: "DC output negative."
    }
  ]
};

export default product;
