import type { Product } from '../../../../types/system';

const product: Product = {
  id: "globallink-520",
  manufacturer: "Victron",
  name: "GlobalLink 520 Cellular Gateway",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 265,
  description: "Victron GlobalLink 520 LTE-M cellular gateway for remote VRM monitoring via VE.Direct.",
  partNumber: "ASS030543020",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs from legacy catalog.",
  width: 80,
  height: 60,
  terminalGroups: [
    { id: "ve_direct_iface", portId: "ve_direct", label: "VE.Direct Interface", groupType: "communication_interface", internallyCommon: false }
  ],
  terminals: [
    { id: "ve_direct", terminalGroupId: "ve_direct_iface", label: "VE.Direct", side: "left", offsetX: -40, offsetY: 0, connector: { kind: "comm", holeSize: "VE.Direct" }, notes: "VE.Direct monitoring interface." }
  ],
  communicationPorts: [
    {
      id: "ve_direct",
      name: "VE.Direct",
      connectorType: "VE.Direct",
      supportedProtocols: ["VE.Direct"],
      configuredProtocol: "VE.Direct"
    }
  ],
  ports: [
    { id: "ve_direct", kind: "comm", topology: "two_pole", label: "VE.Direct", role: "bidirectional", direction: "bidirectional", connectorType: "VE.Direct", supportedProtocols: ["VE.Direct"], configuredProtocol: "VE.Direct" }
  ]
};

export default product;
