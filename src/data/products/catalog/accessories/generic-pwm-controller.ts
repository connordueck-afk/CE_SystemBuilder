import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-pwm-controller",
  manufacturer: "Generic",
  name: "PWM Charge Controller",
  productType: "accessory",
  category: "Solar",
  nominalVoltage: [12, 24],
  maxCurrentA: 30,
  maxPvVoltageV: 50,
  msrpUsd: 0,
  description: "Generic PWM solar charge controller placeholder.",
  source: "User",
  dataQuality: "placeholder",
  width: 90,
  height: 70,
  terminalGroups: [
    { id: "pv_pos", portId: "pv", label: "PV Positive", groupType: "power_conductor", polarity: "positive", internallyCommon: false, maxCurrentA: 30 },
    { id: "pv_neg", portId: "pv", label: "PV Negative", groupType: "power_conductor", polarity: "negative", internallyCommon: false, maxCurrentA: 30 },
    { id: "bat_pos", portId: "dc_out", label: "Battery Positive", groupType: "power_conductor", polarity: "positive", internallyCommon: false, maxCurrentA: 30, requiresOvercurrentProtection: true },
    { id: "bat_neg", portId: "dc_out", label: "Battery Negative", groupType: "power_conductor", polarity: "negative", internallyCommon: false, maxCurrentA: 30 }
  ],
  terminals: [
    { id: "pv_pos", terminalGroupId: "pv_pos", label: "PV+", side: "left", offsetX: -45, offsetY: -18, maxCurrentA: 30, connector: { kind: "screw_terminal" } },
    { id: "pv_neg", terminalGroupId: "pv_neg", label: "PV-", side: "left", offsetX: -45, offsetY: 0, maxCurrentA: 30, connector: { kind: "screw_terminal" } },
    { id: "bat_pos", terminalGroupId: "bat_pos", label: "Bat+", side: "right", offsetX: 45, offsetY: -10, maxCurrentA: 30, connector: { kind: "screw_terminal" } },
    { id: "bat_neg", terminalGroupId: "bat_neg", label: "Bat-", side: "right", offsetX: 45, offsetY: 10, maxCurrentA: 30, connector: { kind: "screw_terminal" } }
  ],
  ports: [
    { id: "pv", kind: "pv", topology: "two_pole", label: "PV", voltageClass: "pv_high_voltage", voltageMaxV: 50, maxCurrentA: 30, role: "sink", direction: "input" },
    { id: "dc_out", kind: "dc", topology: "two_pole", label: "DC Output", voltageClass: "dc_low_voltage", voltageMinV: 12, voltageMaxV: 24, maxCurrentA: 30, role: "source", direction: "output" }
  ]
};

export default product;
