import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-tr-12-12-18-isolated",
  manufacturer: "Victron",
  name: "Orion-Tr Smart 12/12-18A Isolated",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 12,
  maxCurrentA: 18,
  continuousPowerW: 216,
  msrpUsd: 196,
  description: "Victron Orion-Tr Smart 12V/12V-18A isolated DC-DC charger � Bluetooth",
  partNumber: "ORI121222120",
  productUrl: "https://www.cdnrg.com/products/veori121222120",
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
      maxCurrentA: 18,
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
      maxCurrentA: 18,
      connector: { kind: 'screw_terminal' },
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    outputVoltageV: 12,
    outputCurrentA: 18,
    outputPowerW: 216,
    isolated: true
  }
};

export default product;
