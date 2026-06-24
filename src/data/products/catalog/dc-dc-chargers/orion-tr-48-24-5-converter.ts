import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-tr-48-24-5-converter",
  manufacturer: "Victron",
  name: "Orion-Tr 48/24-5A Isolated",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 5,
  continuousPowerW: 120,
  msrpUsd: 78,
  description: "Victron Orion-Tr 48V/24V-5A isolated converter � remote on/off",
  partNumber: "ORI482410110",
  productUrl: "https://www.cdnrg.com/products/veori482410110",
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
      maxCurrentA: 5,
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
      maxCurrentA: 5,
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    inputVoltageMinV: 36,
    inputVoltageMaxV: 70,
    outputVoltageV: 24,
    outputCurrentA: 5,
    outputPowerW: 120,
    isolated: true
  }
};

export default product;
