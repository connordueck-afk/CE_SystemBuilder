import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-dmt2430",
  manufacturer: "KISAE",
  name: "DMT2430 DC-DC Charger with MPPT 24V 30A",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 30,
  continuousPowerW: 720,
  msrpUsd: 0,
  capabilities: ["dc-dc-converter", "battery-charger", "mppt", "pv-input"],
  description: "KISAE smart DC-to-DC battery charger with PV input, 24V 30A. Charges from alternator or solar.",
  partNumber: "DMT2430",
  productUrl: "https://www.kisaepower.com/products/dmt2430/",
  source: "kisaepower.com",
  dataQuality: "partial",
  dcDcChargerRatings: {
    outputVoltageV: 24,
    outputCurrentA: 30,
    outputPowerW: 720,
    isolated: false
  },
  imageUrl: "/product-images/kisae-dc-dc-mppt.svg",
  width: 84,
  height: 112,
  terminalGroups: [
    {
      id: "in_pos",
      portId: "input",
      label: "Input Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 30,
      requiresOvercurrentProtection: true
    },
    {
      id: "in_neg",
      portId: "input",
      label: "Input Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 30
    },
    {
      id: "pv_pos",
      portId: "pv",
      label: "PV Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 30
    },
    {
      id: "pv_neg",
      portId: "pv",
      label: "PV Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 30
    },
    {
      id: "out_pos",
      portId: "output",
      label: "Battery Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 30,
      requiresOvercurrentProtection: true
    },
    {
      id: "out_neg",
      portId: "output",
      label: "Battery Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 30
    }
  ],
  terminals: [
    {
      id: "in_pos",
      terminalGroupId: "in_pos",
      label: "Alt+",
      side: "left",
      offsetX: -42,
      offsetY: -24,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "in_neg",
      terminalGroupId: "in_neg",
      label: "Alt-",
      side: "left",
      offsetX: -42,
      offsetY: -6,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "pv_pos",
      terminalGroupId: "pv_pos",
      label: "PV+",
      side: "top",
      offsetX: -15,
      offsetY: -56,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "pv_neg",
      terminalGroupId: "pv_neg",
      label: "PV-",
      side: "top",
      offsetX: 15,
      offsetY: -56,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "out_pos",
      terminalGroupId: "out_pos",
      label: "Bat+",
      side: "right",
      offsetX: 42,
      offsetY: 24,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "out_neg",
      terminalGroupId: "out_neg",
      label: "Bat-",
      side: "right",
      offsetX: 42,
      offsetY: 42,
      maxCurrentA: 30,
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
      label: "Alternator Input",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 24,
      maxCurrentA: 30,
      role: "sink",
      direction: "input"
    },
    {
      id: "pv",
      kind: "pv",
      topology: "two_pole",
      label: "PV Input",
      voltageClass: "pv_high_voltage",
      maxCurrentA: 30,
      role: "sink",
      direction: "input"
    },
    {
      id: "output",
      kind: "dc",
      topology: "two_pole",
      label: "Battery Output",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 24,
      maxCurrentA: 30,
      maxPowerW: 720,
      role: "source",
      direction: "output"
    }
  ]
};

export default product;
