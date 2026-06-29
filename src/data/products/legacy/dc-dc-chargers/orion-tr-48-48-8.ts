import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-tr-48-48-8",
  manufacturer: "Victron",
  name: "Orion-Tr Smart 48/48-8A Isolated",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 48,
  maxCurrentA: 8,
  continuousPowerW: 380,
  msrpUsd: 299,
  description: "Victron Orion-Tr Smart 48V/48V-8A isolated DC-DC charger � Bluetooth",
  partNumber: "ORI484838120",
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
      maxCurrentA: 8,
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
      maxCurrentA: 8,
      connector: {
        kind: "screw_terminal"
      },
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    inputVoltageMinV: 36,
    inputVoltageMaxV: 70,
    outputVoltageV: 48,
    outputCurrentA: 8,
    outputPowerW: 380,
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
      nominalVoltageV: 48,
      maxCurrentA: 8
    }
  ]
};

export default product;
