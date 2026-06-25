import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-tr-smart-12-24-15-non-isolated",
  manufacturer: "Victron",
  name: "Orion-Tr Smart 12/24-15A Non-Isolated",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 15,
  continuousPowerW: 360,
  msrpUsd: 264,
  description: "Victron Orion-Tr Smart 12V/24V-15A non-isolated DC-DC converter � Bluetooth",
  partNumber: "ORI122436140",
  productUrl: "https://www.cdnrg.com/products/veori122436140",
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
      maxCurrentA: 15,
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
      maxCurrentA: 15,
      connector: { kind: 'screw_terminal' },
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    inputVoltageMinV: 9,
    inputVoltageMaxV: 17,
    outputVoltageV: 24,
    outputCurrentA: 15,
    outputPowerW: 360,
    isolated: false
  }
};

export default product;
