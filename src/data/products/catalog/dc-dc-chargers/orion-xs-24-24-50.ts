import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-xs-24-24-50",
  manufacturer: "Victron",
  name: "Orion XS 24/24-50A DC-DC Charger",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 50,
  continuousPowerW: 1200,
  msrpUsd: 436,
  capabilities: ["dc-dc-converter", "battery-charger"],
  description: "Orion XS 24/24-50A DC-DC Charger DC-DC charger/converter.",
  partNumber: "ORI242417040",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 86,
  height: 80,
  dcDcChargerRatings: {
    inputVoltageMinV: 18,
    inputVoltageMaxV: 35,
    outputVoltageV: 24,
    outputCurrentA: 50,
    outputPowerW: 1200,
    isolated: false
  },
  terminalGroups: [
    {
      id: "in_pos",
      portId: "input",
      label: "Input Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 50,
      requiresOvercurrentProtection: true
    },
    {
      id: "in_neg",
      portId: "input",
      label: "Input Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 50
    },
    {
      id: "out_pos",
      portId: "output",
      label: "Output Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 50,
      requiresOvercurrentProtection: true
    },
    {
      id: "out_neg",
      portId: "output",
      label: "Output Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 50
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
      maxCurrentA: 50,
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
      maxCurrentA: 50,
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
      maxCurrentA: 50,
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
      maxCurrentA: 50,
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
      voltageMinV: 18,
      voltageMaxV: 35,
      maxCurrentA: 50,
      role: "sink",
      direction: "input"
    },
    {
      id: "output",
      kind: "dc",
      topology: "two_pole",
      label: "Output",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 24,
      maxCurrentA: 50,
      maxPowerW: 1200,
      role: "source",
      direction: "output"
    }
  ]
};

export default product;
