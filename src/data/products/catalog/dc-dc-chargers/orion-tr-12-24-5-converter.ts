import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-tr-12-24-5-converter",
  manufacturer: "Victron",
  name: "Orion-Tr 12/24-5A Isolated",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 5,
  continuousPowerW: 120,
  msrpUsd: 78,
  description: "Victron Orion-Tr 12V/24V-5A isolated converter � remote on/off",
  partNumber: "ORI122410110",
  productUrl: "https://www.cdnrg.com/products/veori122410110",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 86,
  height: 80,
  terminals: [
    {
      id: "in_pos",
      label: "In+",
      kind: "dc_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -16,
      offsetY: 24,
      requiresOvercurrentProtection: true,
      connector: { kind: 'screw_terminal' },
      notes: "DC input positive. Fuse required on input positive conductor."
    },
    {
      id: "in_neg",
      label: "In-",
      kind: "dc_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -5,
      offsetY: 24,
      connector: { kind: 'screw_terminal' },
      notes: "DC input negative."
    },
    {
      id: "out_pos",
      label: "Out+",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 5,
      offsetY: 24,
      requiresOvercurrentProtection: true,
      maxCurrentA: 5,
      connector: { kind: 'screw_terminal' },
      notes: "DC output positive. Fuse required on output positive conductor."
    },
    {
      id: "out_neg",
      label: "Out-",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 16,
      offsetY: 24,
      maxCurrentA: 5,
      connector: { kind: 'screw_terminal' },
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    outputVoltageV: 24,
    outputCurrentA: 5,
    outputPowerW: 120,
    isolated: true
  }
};

export default product;
