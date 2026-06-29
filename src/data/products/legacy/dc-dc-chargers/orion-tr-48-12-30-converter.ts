import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-tr-48-12-30-converter",
  manufacturer: "Victron",
  name: "Orion-Tr 48/12-30A Isolated",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 12,
  maxCurrentA: 30,
  continuousPowerW: 360,
  msrpUsd: 246,
  description: "Victron Orion-Tr 48V/12V-30A isolated converter � remote on/off",
  partNumber: "ORI481240110",
  productUrl: "https://www.cdnrg.com/products/veori481240110",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 86,
  height: 80,
  terminals: [
    {
      id: "in_pos",
      portId: "input",
      label: "In+",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -16,
      offsetY: 24,
      requiresOvercurrentProtection: true,
      connector: {
        kind: "screw_terminal"
      },
      notes: "DC input positive. Fuse required on input positive conductor."
    },
    {
      id: "in_neg",
      portId: "input",
      label: "In-",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -5,
      offsetY: 24,
      connector: {
        kind: "screw_terminal"
      },
      notes: "DC input negative."
    },
    {
      id: "out_pos",
      portId: "output",
      label: "Out+",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 5,
      offsetY: 24,
      requiresOvercurrentProtection: true,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      },
      notes: "DC output positive. Fuse required on output positive conductor."
    },
    {
      id: "out_neg",
      portId: "output",
      label: "Out-",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 16,
      offsetY: 24,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      },
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    inputVoltageMinV: 36,
    inputVoltageMaxV: 70,
    outputVoltageV: 12,
    outputCurrentA: 30,
    outputPowerW: 360,
    isolated: true
  },
  ports: [
    {
      id: "input",
      kind: "dc",
      topology: "two_pole",
      label: "In+",
      voltageMinV: 36,
      voltageMaxV: 70
    },
    {
      id: "output",
      kind: "dc",
      topology: "two_pole",
      label: "Out+",
      nominalVoltageV: 12,
      maxCurrentA: 30
    }
  ]
};

export default product;
