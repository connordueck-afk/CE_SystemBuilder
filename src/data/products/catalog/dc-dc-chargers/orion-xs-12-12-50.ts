import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-xs-12-12-50",
  manufacturer: "Victron",
  name: "Orion XS 12/12-50A DC-DC Charger",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 12,
  maxCurrentA: 50,
  continuousPowerW: 600,
  msrpUsd: 381,
  description: "Victron Orion XS 12V/12V-50A � smart DC-DC charger with Bluetooth/VE.Direct",
  partNumber: "ORI121217050",
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
      maxCurrentA: 50,
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
      maxCurrentA: 50,
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    inputVoltageMinV: 9,
    inputVoltageMaxV: 17,
    outputVoltageV: 12,
    outputCurrentA: 50,
    outputPowerW: 600,
    isolated: false
  }
};

export default product;
