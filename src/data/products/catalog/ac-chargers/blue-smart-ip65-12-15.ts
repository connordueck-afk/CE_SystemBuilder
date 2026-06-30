import type { Product } from '../../../../types/system';

const product: Product = {
  id: "blue-smart-ip65-12-15",
  manufacturer: "Victron",
  name: "Blue Smart IP65 Charger 12/15",
  productType: "shore_charger",
  category: "Charging",
  nominalVoltage: 12,
  maxCurrentA: 15,
  msrpUsd: 176,
  description: "Victron Blue Smart IP65 Charger 12V/15A with Bluetooth, IP65 enclosure, and 120VAC input.",
  partNumber: "BPC121531104R",
  productUrl: "https://www.cdnrg.com/products/vebpc121531104r",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs from legacy catalog.",
  width: 80,
  height: 60,
  terminalGroups: [
    { id: "ac_l", portId: "ac_in", label: "AC Line", groupType: "power_conductor", polarity: "line", internallyCommon: false },
    { id: "ac_n", portId: "ac_in", label: "AC Neutral", groupType: "power_conductor", polarity: "neutral", internallyCommon: false },
    { id: "dc_pos", portId: "dc_out", label: "DC Positive", groupType: "power_conductor", polarity: "positive", internallyCommon: false, maxCurrentA: 15, requiresOvercurrentProtection: true },
    { id: "dc_neg", portId: "dc_out", label: "DC Negative", groupType: "power_conductor", polarity: "negative", internallyCommon: false, maxCurrentA: 15 }
  ],
  terminals: [
    { id: "ac_l", terminalGroupId: "ac_l", label: "AC L", side: "left", offsetX: -40, offsetY: -10, connector: { kind: "screw_terminal" }, notes: "AC input line conductor." },
    { id: "ac_n", terminalGroupId: "ac_n", label: "AC N", side: "left", offsetX: -40, offsetY: 10, connector: { kind: "screw_terminal" }, notes: "AC input neutral conductor." },
    { id: "dc_pos", terminalGroupId: "dc_pos", label: "DC+", side: "right", offsetX: 40, offsetY: -10, maxCurrentA: 15, connector: { kind: "screw_terminal" }, notes: "DC output positive." },
    { id: "dc_neg", terminalGroupId: "dc_neg", label: "DC-", side: "right", offsetX: 40, offsetY: 10, maxCurrentA: 15, connector: { kind: "screw_terminal" }, notes: "DC output negative." }
  ],
  ports: [
    { id: "ac_in", kind: "ac", topology: "two_pole", label: "AC Input", voltageClass: "ac_120v", nominalVoltageV: 120, role: "sink", direction: "input" },
    { id: "dc_out", kind: "dc", topology: "two_pole", label: "DC Output", voltageClass: "dc_low_voltage", nominalVoltageV: 12, maxCurrentA: 15, role: "source", direction: "output" }
  ]
};

export default product;
