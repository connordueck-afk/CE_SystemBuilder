import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-tr-smart-24-24-17-non-isolated",
  manufacturer: "Victron",
  name: "Orion-Tr Smart 24/24-17A Non-Isolated",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 17,
  continuousPowerW: 408,
  msrpUsd: 264,
  description: "Victron Orion-Tr Smart 24V/24V-17A non-isolated DC-DC converter � Bluetooth",
  partNumber: "ORI242440140",
  productUrl: "https://www.cdnrg.com/products/veori242440140",
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
      maxCurrentA: 17,
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
      maxCurrentA: 17,
      connector: {
        kind: "screw_terminal"
      },
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    inputVoltageMinV: 18,
    inputVoltageMaxV: 35,
    outputVoltageV: 24,
    outputCurrentA: 17,
    outputPowerW: 408,
    isolated: false
  },
  ports: [
    {
      id: "input",
      kind: "dc",
      topology: "two_pole",
      label: "In+",
      voltageMinV: 18,
      voltageMaxV: 35
    },
    {
      id: "output",
      kind: "dc",
      topology: "two_pole",
      label: "Out+",
      nominalVoltageV: 24,
      maxCurrentA: 17
    }
  ]
};

export default product;
