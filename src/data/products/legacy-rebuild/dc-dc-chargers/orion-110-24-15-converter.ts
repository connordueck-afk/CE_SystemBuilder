import type { Product } from '../../../../types/system';

const product: Product = {
  id: "orion-110-24-15-converter",
  manufacturer: "Victron",
  name: "Orion 110/24-15A Isolated",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 15,
  continuousPowerW: 360,
  msrpUsd: 447,
  description: "Victron Orion 110V/24V-15A isolated converter - remote on/off (wide input for truck/bus)",
  partNumber: "ORI110243610",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Legacy record rebuilt with explicit input and output terminal groups.",
  width: 86,
  height: 80,
  terminalGroups: [
    { id: "in_pos", portId: "input", label: "Input Positive", groupType: "power_conductor", kind: "dc_power", polarity: "positive", internallyCommon: false },
    { id: "in_neg", portId: "input", label: "Input Negative", groupType: "power_conductor", kind: "dc_power", polarity: "negative", internallyCommon: false },
    { id: "out_pos", portId: "output", label: "Output Positive", groupType: "power_conductor", kind: "dc_power", polarity: "positive", internallyCommon: false, maxCurrentA: 15 },
    { id: "out_neg", portId: "output", label: "Output Negative", groupType: "power_conductor", kind: "dc_power", polarity: "negative", internallyCommon: false, maxCurrentA: 15 }
  ],
  terminals: [
    {
      id: "in_pos",
      terminalGroupId: "in_pos",
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
      terminalGroupId: "in_neg",
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
      terminalGroupId: "out_pos",
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
      maxCurrentA: 15,
      connector: {
        kind: "screw_terminal"
      },
      notes: "DC output positive. Fuse required on output positive conductor."
    },
    {
      id: "out_neg",
      terminalGroupId: "out_neg",
      portId: "output",
      label: "Out-",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 16,
      offsetY: 24,
      maxCurrentA: 15,
      connector: {
        kind: "screw_terminal"
      },
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    inputVoltageMinV: 75,
    inputVoltageMaxV: 145,
    outputVoltageV: 24,
    outputCurrentA: 15,
    outputPowerW: 360,
    isolated: true
  },
  ports: [
    {
      id: "input",
      kind: "dc",
      topology: "two_pole",
      label: "In+",
      voltageMinV: 75,
      voltageMaxV: 145
    },
    {
      id: "output",
      kind: "dc",
      topology: "two_pole",
      label: "Out+",
      nominalVoltageV: 24,
      maxCurrentA: 15
    }
  ]
};

export default product;
