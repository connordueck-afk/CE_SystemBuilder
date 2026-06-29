import type { Product } from '../../../../types/system';

const product: Product = {
  id: "buck-boost-50",
  manufacturer: "Victron",
  name: "Buck-Boost 50A DC-DC Converter",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: [
    12,
    24
  ],
  maxCurrentA: 50,
  continuousPowerW: 600,
  msrpUsd: 823,
  description: "Victron 50A Buck-Boost bi-directional DC-DC converter - CAN-bus",
  partNumber: "ORI303050000",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Legacy record rebuilt with explicit input and output terminal groups.",
  width: 86,
  height: 80,
  terminalGroups: [
    { id: "in_pos", portId: "input", label: "Input Positive", groupType: "power_conductor", kind: "dc_power", polarity: "positive", internallyCommon: false },
    { id: "in_neg", portId: "input", label: "Input Negative", groupType: "power_conductor", kind: "dc_power", polarity: "negative", internallyCommon: false },
    { id: "out_pos", portId: "output", label: "Output Positive", groupType: "power_conductor", kind: "dc_power", polarity: "positive", internallyCommon: false, maxCurrentA: 50 },
    { id: "out_neg", portId: "output", label: "Output Negative", groupType: "power_conductor", kind: "dc_power", polarity: "negative", internallyCommon: false, maxCurrentA: 50 }
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
      maxCurrentA: 50,
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
      maxCurrentA: 50,
      connector: {
        kind: "screw_terminal"
      },
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    outputCurrentA: 50,
    outputPowerW: 600,
    isolated: false
  },
  ports: [
    {
      id: "input",
      kind: "dc",
      topology: "two_pole",
      label: "In+"
    },
    {
      id: "output",
      kind: "dc",
      topology: "two_pole",
      label: "Out+",
      nominalVoltageV: 12,
      maxCurrentA: 50
    }
  ]
};

export default product;
