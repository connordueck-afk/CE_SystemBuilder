import type { Product } from '../../../../types/system';

const product: Product = {
  id: "skylla-ip65-24-70",
  manufacturer: "Victron",
  name: "Skylla-IP65 24/70 Charger",
  productType: "shore_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 70,
  continuousPowerW: 1680,
  msrpUsd: 1350,
  description: "Victron Skylla-IP65 24V/70A industrial AC charger with CAN-bus, IP65 enclosure, and 120/240VAC input.",
  partNumber: "SKI024070000",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs from legacy catalog. AC input is modelled as line/neutral for compatibility with the legacy terminal set.",
  width: 80,
  height: 60,
  terminalGroups: [
    { id: "ac_l", portId: "ac_in", label: "AC Line", groupType: "power_conductor", polarity: "line", internallyCommon: false },
    { id: "ac_n", portId: "ac_in", label: "AC Neutral", groupType: "power_conductor", polarity: "neutral", internallyCommon: false },
    { id: "dc_pos", portId: "dc_out", label: "DC Positive", groupType: "power_conductor", polarity: "positive", internallyCommon: false, maxCurrentA: 70, requiresOvercurrentProtection: true },
    { id: "dc_neg", portId: "dc_out", label: "DC Negative", groupType: "power_conductor", polarity: "negative", internallyCommon: false, maxCurrentA: 70 }
  ],
  terminals: [
    { id: "ac_l", terminalGroupId: "ac_l", label: "AC L", side: "left", offsetX: -40, offsetY: -10, connector: { kind: "screw_terminal" }, notes: "AC input line conductor." },
    { id: "ac_n", terminalGroupId: "ac_n", label: "AC N", side: "left", offsetX: -40, offsetY: 10, connector: { kind: "screw_terminal" }, notes: "AC input neutral conductor." },
    { id: "dc_pos", terminalGroupId: "dc_pos", label: "DC+", side: "right", offsetX: 40, offsetY: -10, maxCurrentA: 70, connector: { kind: "screw_terminal" }, notes: "DC output positive." },
    { id: "dc_neg", terminalGroupId: "dc_neg", label: "DC-", side: "right", offsetX: 40, offsetY: 10, maxCurrentA: 70, connector: { kind: "screw_terminal" }, notes: "DC output negative." }
  ],
  ports: [
    { id: "ac_in", kind: "ac", topology: "two_pole", label: "AC Input", voltageClass: "ac_120v", nominalVoltageV: 120, role: "sink", direction: "input" },
    { id: "dc_out", kind: "dc", topology: "two_pole", label: "DC Output", voltageClass: "dc_low_voltage", nominalVoltageV: 24, maxCurrentA: 70, maxPowerW: 1680, role: "source", direction: "output" }
  ]
};

export default product;
