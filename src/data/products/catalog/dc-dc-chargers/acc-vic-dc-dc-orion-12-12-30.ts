import type { Product } from '../../../../types/system';

const product: Product = {
  id: "acc-vic-dc-dc-orion-12-12-30",
  manufacturer: "Victron",
  name: "Orion-Tr Smart 12/12-30A",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: 12,
  maxCurrentA: 30,
  continuousPowerW: 360,
  msrpUsd: 299,
  oemPriceUsd: 209,
  description: "Orion-Tr Smart 12/12-30A DC-DC charger/converter.",
  partNumber: "ORI121222120",
  productUrl: "https://www.cdnrg.com/products/veori121222120",
  source: "Victron 2024",
  dataQuality: "partial",
  width: 86,
  height: 80,
  terminalGroups: [
    { id: "in_pos", portId: "input", label: "Input Positive", groupType: "power_conductor", polarity: "positive", internallyCommon: false, requiresOvercurrentProtection: true },
    { id: "in_neg", portId: "input", label: "Input Negative", groupType: "power_conductor", polarity: "negative", internallyCommon: false },
    { id: "out_pos", portId: "output", label: "Output Positive", groupType: "power_conductor", polarity: "positive", internallyCommon: false, maxCurrentA: 30, requiresOvercurrentProtection: true },
    { id: "out_neg", portId: "output", label: "Output Negative", groupType: "power_conductor", polarity: "negative", internallyCommon: false, maxCurrentA: 30 }
  ],
  terminals: [
    { id: "in_pos", terminalGroupId: "in_pos", label: "In+", side: "bottom", offsetX: -16, offsetY: 24, connector: { kind: "screw_terminal" }, notes: "Starter battery / alternator positive input. Requires fuse close to source." },
    { id: "in_neg", terminalGroupId: "in_neg", label: "In-", side: "bottom", offsetX: -5, offsetY: 24, connector: { kind: "screw_terminal" }, notes: "Input negative." },
    { id: "out_pos", terminalGroupId: "out_pos", label: "Out+", side: "bottom", offsetX: 5, offsetY: 24, maxCurrentA: 30, connector: { kind: "screw_terminal" }, notes: "House battery positive output." },
    { id: "out_neg", terminalGroupId: "out_neg", label: "Out-", side: "bottom", offsetX: 16, offsetY: 24, maxCurrentA: 30, connector: { kind: "screw_terminal" }, notes: "House battery negative output." }
  ],
  dcDcChargerRatings: { inputVoltageMinV: 7, inputVoltageMaxV: 17, outputVoltageV: 12, outputCurrentA: 30, outputPowerW: 360, isolated: true },
  ports: [
    { id: "input", kind: "dc", topology: "two_pole", label: "Input", voltageClass: "dc_low_voltage", voltageMinV: 7, voltageMaxV: 17, role: "sink", direction: "input" },
    { id: "output", kind: "dc", topology: "two_pole", label: "Output", voltageClass: "dc_low_voltage", nominalVoltageV: 12, maxCurrentA: 30, maxPowerW: 360, role: "source", direction: "output" }
  ]
};

export default product;
