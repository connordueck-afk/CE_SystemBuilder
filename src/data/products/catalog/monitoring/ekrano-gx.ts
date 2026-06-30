import type { Product } from '../../../../types/system';

const product: Product = {
  id: "ekrano-gx",
  manufacturer: "Victron",
  name: "Ekrano GX",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 690,
  description: "Victron Ekrano GX combined system controller and 7-inch touchscreen display with VE.Bus, VE.Direct, VE.Can, BMS-Can, and Ethernet interfaces.",
  partNumber: "BPP900480100",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs from legacy catalog.",
  width: 80,
  height: 60,
  terminalGroups: [
    { id: "signal_iface", portId: "main", label: "System Signal Interface", groupType: "signal_interface", internallyCommon: false },
    { id: "can_bus_iface", portId: "can_bus", label: "BMS-Can / VE.Can Interface", groupType: "communication_interface", internallyCommon: false },
    { id: "ve_bus_iface", portId: "ve_bus", label: "VE.Bus Interface", groupType: "communication_interface", internallyCommon: false },
    { id: "ethernet_iface", portId: "ethernet", label: "Ethernet Interface", groupType: "communication_interface", internallyCommon: false }
  ],
  terminals: [
    { id: "signal", terminalGroupId: "signal_iface", label: "Signal", side: "left", offsetX: -40, offsetY: 0, connector: { kind: "comm" }, notes: "Low-voltage system signal/control interface." },
    { id: "can_bus", terminalGroupId: "can_bus_iface", label: "BMS-Can / VE.Can", side: "top", offsetX: -40, offsetY: -30, connector: { kind: "comm", holeSize: "RJ45" } },
    { id: "ve_bus", terminalGroupId: "ve_bus_iface", label: "VE.Bus", side: "top", offsetX: 0, offsetY: -30, connector: { kind: "comm", holeSize: "RJ45" } },
    { id: "ethernet", terminalGroupId: "ethernet_iface", label: "Ethernet", side: "top", offsetX: 40, offsetY: -30, connector: { kind: "comm", holeSize: "RJ45" } }
  ],
  communicationPorts: [
    {
      id: "can_bus",
      name: "BMS-Can / VE.Can",
      connectorType: "RJ45",
      supportedProtocols: ["BMS-Can", "VE.Can"],
      configuredProtocol: "BMS-Can",
      isConfigurable: true,
      notes: "CAN-bus profile is selectable (VE.Can or BMS-Can)."
    },
    {
      id: "ve_bus",
      name: "VE.Bus",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Bus"],
      configuredProtocol: "VE.Bus"
    },
    {
      id: "ethernet",
      name: "Ethernet",
      connectorType: "RJ45",
      supportedProtocols: ["Ethernet"],
      configuredProtocol: "Ethernet"
    }
  ],
  ports: [
    { id: "main", kind: "signal", topology: "two_pole", label: "Main Signal", voltageClass: "signal_low_voltage", role: "control", direction: "bidirectional" },
    { id: "can_bus", kind: "comm", label: "BMS-Can / VE.Can", topology: "two_pole", role: "bidirectional", direction: "bidirectional", connectorType: "RJ45", supportedProtocols: ["BMS-Can", "VE.Can"], configuredProtocol: "BMS-Can", isConfigurable: true },
    { id: "ve_bus", kind: "comm", label: "VE.Bus", topology: "two_pole", role: "bidirectional", direction: "bidirectional", connectorType: "RJ45", supportedProtocols: ["VE.Bus"], configuredProtocol: "VE.Bus" },
    { id: "ethernet", kind: "comm", label: "Ethernet", topology: "two_pole", role: "bidirectional", direction: "bidirectional", connectorType: "RJ45", supportedProtocols: ["Ethernet"], configuredProtocol: "Ethernet" }
  ]
};

export default product;
