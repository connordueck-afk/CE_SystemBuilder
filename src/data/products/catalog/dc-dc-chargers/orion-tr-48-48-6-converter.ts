import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-tr-48-48-6-converter",
  manufacturer: "Victron",
  name: "Orion-Tr 48/48-6A Isolated",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 48,
  maxCurrentA: 6,
  continuousPowerW: 280,
  msrpUsd: 140,
  capabilities: ["dc-dc-converter", "battery-charger"],
  description: "Orion-Tr 48/48-6A Isolated DC-DC charger/converter.",
  partNumber: "ORI484828110",
  productUrl: "https://www.cdnrg.com/products/veori484828110",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 86,
  height: 80,
  dcDcChargerRatings: {
    inputVoltageMinV: 36,
    inputVoltageMaxV: 70,
    outputVoltageV: 48,
    outputCurrentA: 6,
    outputPowerW: 280,
    isolated: true
  },
  terminalGroups: [
    {
      id: "in_pos",
      portId: "input",
      label: "Input Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 6,
      requiresOvercurrentProtection: true
    },
    {
      id: "in_neg",
      portId: "input",
      label: "Input Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 6
    },
    {
      id: "out_pos",
      portId: "output",
      label: "Output Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 6,
      requiresOvercurrentProtection: true
    },
    {
      id: "out_neg",
      portId: "output",
      label: "Output Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 6
    }
  ],
  terminals: [
    {
      id: "in_pos",
      terminalGroupId: "in_pos",
      label: "In+",
      side: "bottom",
      offsetX: -16,
      offsetY: 24,
      maxCurrentA: 6,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "in_neg",
      terminalGroupId: "in_neg",
      label: "In-",
      side: "bottom",
      offsetX: -5,
      offsetY: 24,
      maxCurrentA: 6,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "out_pos",
      terminalGroupId: "out_pos",
      label: "Out+",
      side: "bottom",
      offsetX: 5,
      offsetY: 24,
      maxCurrentA: 6,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "out_neg",
      terminalGroupId: "out_neg",
      label: "Out-",
      side: "bottom",
      offsetX: 16,
      offsetY: 24,
      maxCurrentA: 6,
      connector: {
        kind: "screw_terminal"
      }
    }
  ],
  ports: [
    {
      id: "input",
      kind: "dc",
      topology: "two_pole",
      label: "Input",
      voltageClass: "dc_low_voltage",
      voltageMinV: 36,
      voltageMaxV: 70,
      maxCurrentA: 6,
      role: "sink",
      direction: "input"
    },
    {
      id: "output",
      kind: "dc",
      topology: "two_pole",
      label: "Output",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 48,
      maxCurrentA: 6,
      maxPowerW: 280,
      role: "source",
      direction: "output"
    }
  ]
};

export default product;
