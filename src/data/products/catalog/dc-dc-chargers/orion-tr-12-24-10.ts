import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-tr-12-24-10",
  manufacturer: "Victron",
  name: "Orion-Tr Smart 12/24-10A Isolated",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 10,
  continuousPowerW: 240,
  msrpUsd: 196,
  description: "Victron Orion-Tr Smart 12V/24V-10A isolated DC-DC charger � Bluetooth",
  partNumber: "ORI122424120",
  productUrl: "https://www.cdnrg.com/products/veori122424120",
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
      maxCurrentA: 10,
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
      maxCurrentA: 10,
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    outputVoltageV: 24,
    outputCurrentA: 10,
    outputPowerW: 240,
    isolated: true
  }
};

export default product;
