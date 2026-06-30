import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-sc1220ld",
  manufacturer: "KISAE",
  name: "SC1220LD Solar Charge Controller",
  productType: "mppt",
  category: "Charging",
  nominalVoltage: [12, 24],
  maxCurrentA: 20,
  maxPvVoltageV: 100,
  maxPvCurrentA: 20,
  msrpUsd: 0,
  capabilities: ["mppt", "pv-input", "battery-charger"],
  description: "KISAE solar charge controller, 20A.",
  partNumber: "SC1220LD",
  productUrl: "https://www.cdnrg.com/products/sc1220ld",
  source: "Canadian Energy product index",
  dataQuality: "partial",
  imageUrl: "/product-images/kisae-mppt.svg",
  width: 96,
  height: 72,
  terminalGroups: [
    { id: "pv_pos", portId: "pv", label: "PV Positive", groupType: "power_conductor", polarity: "positive", internallyCommon: false, maxCurrentA: 20 },
    { id: "pv_neg", portId: "pv", label: "PV Negative", groupType: "power_conductor", polarity: "negative", internallyCommon: false, maxCurrentA: 20 },
    { id: "bat_pos", portId: "dc_out", label: "Battery Positive", groupType: "power_conductor", polarity: "positive", internallyCommon: false, maxCurrentA: 20, requiresOvercurrentProtection: true },
    { id: "bat_neg", portId: "dc_out", label: "Battery Negative", groupType: "power_conductor", polarity: "negative", internallyCommon: false, maxCurrentA: 20 },
    { id: "ve_can_iface", portId: "ve_can", label: "VE.Can Interface", groupType: "communication_interface", internallyCommon: false },
    { id: "ve_direct_iface", portId: "ve_direct", label: "VE.Direct Interface", groupType: "communication_interface", internallyCommon: false }
  ],
  terminals: [
    { id: "pv_pos", terminalGroupId: "pv_pos", label: "PV+", side: "left", offsetX: -48, offsetY: -16, maxCurrentA: 20, connector: { kind: "screw_terminal" } },
    { id: "pv_neg", terminalGroupId: "pv_neg", label: "PV-", side: "left", offsetX: -48, offsetY: 16, maxCurrentA: 20, connector: { kind: "screw_terminal" } },
    { id: "bat_pos", terminalGroupId: "bat_pos", label: "Bat+", side: "right", offsetX: 48, offsetY: -16, maxCurrentA: 20, connector: { kind: "screw_terminal" } },
    { id: "bat_neg", terminalGroupId: "bat_neg", label: "Bat-", side: "right", offsetX: 48, offsetY: 16, maxCurrentA: 20, connector: { kind: "screw_terminal" } },
    { id: "ve_can", terminalGroupId: "ve_can_iface", label: "VE.Can", side: "top", offsetX: -48, offsetY: -36, connector: { kind: "comm" } },
    { id: "ve_direct", terminalGroupId: "ve_direct_iface", label: "VE.Direct", side: "top", offsetX: 48, offsetY: -36, connector: { kind: "comm" } }
  ],
  mpptRatings: {
    batteryVoltagesV: [12, 24],
    maxPvVoltageV: 100,
    maxPvCurrentA: 20,
    maxOutputCurrentA: 20,
    efficiencyPct: 95
  },
  communicationPorts: [
    { id: "ve_can", name: "VE.Can", connectorType: "RJ45", supportedProtocols: ["VE.Can"], configuredProtocol: "VE.Can" },
    { id: "ve_direct", name: "VE.Direct", connectorType: "VE.Direct", supportedProtocols: ["VE.Direct"], configuredProtocol: "VE.Direct" }
  ],
  ports: [
    { id: "pv", kind: "pv", topology: "two_pole", label: "PV", voltageClass: "pv_high_voltage", voltageMaxV: 100, maxCurrentA: 20, role: "sink", direction: "input" },
    { id: "dc_out", kind: "dc", topology: "two_pole", label: "DC Output", voltageClass: "dc_low_voltage", voltageMinV: 12, voltageMaxV: 24, maxCurrentA: 20, role: "source", direction: "output" },
    { id: "ve_can", kind: "comm", label: "VE.Can", topology: "two_pole", role: "bidirectional", direction: "bidirectional", connectorType: "RJ45", supportedProtocols: ["VE.Can"], configuredProtocol: "VE.Can" },
    { id: "ve_direct", kind: "comm", label: "VE.Direct", topology: "two_pole", role: "bidirectional", direction: "bidirectional", connectorType: "VE.Direct", supportedProtocols: ["VE.Direct"], configuredProtocol: "VE.Direct" }
  ]
};

export default product;
