import type { Product } from '../../../../types/system';

const product: Product = {
  id: "buck-boost-25",
  manufacturer: "Victron",
  name: "Buck-Boost 25A DC-DC Converter",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: [12, 24],
  maxCurrentA: 25,
  continuousPowerW: 300,
  msrpUsd: 662,
  capabilities: ["dc-dc-converter", "battery-charger"],
  description: "Buck-Boost 25A DC-DC Converter DC-DC charger/converter.",
  partNumber: "ORI303025000",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 86,
  height: 80,
  dcDcChargerRatings: {
    outputCurrentA: 25,
    outputPowerW: 300,
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
      maxCurrentA: 25,
      requiresOvercurrentProtection: true
    },
    {
      id: "in_neg",
      portId: "input",
      label: "Input Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 25
    },
    {
      id: "out_pos",
      portId: "output",
      label: "Output Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 25,
      requiresOvercurrentProtection: true
    },
    {
      id: "out_neg",
      portId: "output",
      label: "Output Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 25
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
      maxCurrentA: 25,
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
      maxCurrentA: 25,
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
      maxCurrentA: 25,
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
      maxCurrentA: 25,
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
      maxCurrentA: 25,
      role: "sink",
      direction: "input"
    },
    {
      id: "output",
      kind: "dc",
      topology: "two_pole",
      label: "Output",
      voltageClass: "dc_low_voltage",
      maxCurrentA: 25,
      maxPowerW: 300,
      role: "source",
      direction: "output"
    }
  ]
};

export default product;
