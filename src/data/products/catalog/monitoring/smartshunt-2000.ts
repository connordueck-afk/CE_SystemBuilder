import type { Product } from '../../../../types/system';

const product: Product = {
  id: "smartshunt-2000",
  manufacturer: "Victron",
  name: "SmartShunt 2000A/50mV",
  productType: "monitor",
  category: "Monitoring",
  maxCurrentA: 2000,
  msrpUsd: 276,
  description: "Victron SmartShunt 2000A Bluetooth battery monitor with integrated 2000A/50mV shunt.",
  partNumber: "SHU050220050",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Simplified as a 2000A negative-leg pass-through shunt with VE.Direct communication.",
  width: 100,
  height: 50,
  terminalGroups: [
    { id: "shunt_batt_side", portId: "main", label: "Battery Minus", groupType: "power_conductor", polarity: "negative", internallyCommon: false, maxCurrentA: 2000 },
    { id: "shunt_bus_side", portId: "main", label: "System Minus", groupType: "power_conductor", polarity: "negative", internallyCommon: false, maxCurrentA: 2000 },
    { id: "ve_direct_iface", portId: "ve_direct", label: "VE.Direct Interface", groupType: "communication_interface", internallyCommon: false }
  ],
  terminals: [
    { id: "shunt_pos", terminalGroupId: "shunt_batt_side", label: "BATT-", side: "left", offsetX: -42, offsetY: 13, maxCurrentA: 2000, connector: { kind: "stud", holeSize: "M10" }, notes: "Battery negative side of the 2000A shunt." },
    { id: "shunt_neg", terminalGroupId: "shunt_bus_side", label: "SYS-", side: "right", offsetX: 42, offsetY: 13, maxCurrentA: 2000, connector: { kind: "stud", holeSize: "M10" }, notes: "System/load negative side of the 2000A shunt." },
    { id: "ve_direct", terminalGroupId: "ve_direct_iface", label: "VE.Direct", side: "top", offsetX: 0, offsetY: -25, connector: { kind: "comm", holeSize: "VE.Direct" } }
  ],
  communicationPorts: [
    { id: "ve_direct", name: "VE.Direct", connectorType: "VE.Direct", supportedProtocols: ["VE.Direct"], configuredProtocol: "VE.Direct" }
  ],
  ports: [
    { id: "main", kind: "dc", topology: "pass_through", label: "Main", voltageClass: "dc_low_voltage", maxCurrentA: 2000, role: "pass_through", direction: "bidirectional" },
    { id: "ve_direct", kind: "comm", label: "VE.Direct", topology: "pass_through", role: "bidirectional", direction: "bidirectional", connectorType: "VE.Direct", supportedProtocols: ["VE.Direct"], configuredProtocol: "VE.Direct" }
  ]
};

export default product;
