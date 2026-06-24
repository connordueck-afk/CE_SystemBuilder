import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-tr-24-48-8-5-converter",
  manufacturer: "Victron",
  name: "Orion-Tr 24/48-8.5A Isolated",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 48,
  maxCurrentA: 9,
  continuousPowerW: 400,
  msrpUsd: 246,
  description: "Victron Orion-Tr 24V/48V-8.5A isolated converter � remote on/off",
  partNumber: "ORI244841110",
  productUrl: "https://www.cdnrg.com/products/veori244841110",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 86,
  height: 80,
  terminals: [
    {
      id: "in_pos",
      label: "In+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -16,
      offsetY: 24,
      domain: "dc",
      requiresOvercurrentProtection: true,
      notes: "DC input positive. Fuse required on input positive conductor."
    },
    {
      id: "in_neg",
      label: "In-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -5,
      offsetY: 24,
      domain: "dc",
      notes: "DC input negative."
    },
    {
      id: "out_pos",
      label: "Out+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 5,
      offsetY: 24,
      domain: "dc",
      requiresOvercurrentProtection: true,
      maxCurrentA: 9,
      notes: "DC output positive. Fuse required on output positive conductor."
    },
    {
      id: "out_neg",
      label: "Out-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 16,
      offsetY: 24,
      domain: "dc",
      maxCurrentA: 9,
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    inputVoltageMinV: 18,
    inputVoltageMaxV: 35,
    outputVoltageV: 48,
    outputCurrentA: 9,
    outputPowerW: 400,
    isolated: true
  }
};

export default product;
