import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-can-t-connector",
  manufacturer: "Generic",
  name: "CAN T-Connector",
  productType: "commAccessory",
  category: "Communication",
  description: "RJ45 T-connector/splitter for CAN bus networks (VE.Can, BMS-Can).",
  commAccessoryBehavior: "passive",
  width: 70,
  height: 50,
  terminalGroups: [
    { id: "port-a", portId: "port-a", label: "Port A", groupType: "communication_interface", internallyCommon: false },
    { id: "port-b", portId: "port-b", label: "Port B", groupType: "communication_interface", internallyCommon: false },
    { id: "port-c", portId: "port-c", label: "Port C", groupType: "communication_interface", internallyCommon: false },
  ],
  communicationPorts: [
    {
      id: "port-a",
      name: "Port A",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: false,
    },
    {
      id: "port-b",
      name: "Port B",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: false,
    },
    {
      id: "port-c",
      name: "Port C",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: false,
    },
  ],
  terminals: [
    { id: "port-a", label: "Port A", role: "bidirectional", side: "bottom", offsetX: -35, offsetY: 25, portId: "port-a", terminalGroupId: "port-a" },
    { id: "port-b", label: "Port B", role: "bidirectional", side: "bottom", offsetX: 0, offsetY: 25, portId: "port-b", terminalGroupId: "port-b" },
    { id: "port-c", label: "Port C", role: "bidirectional", side: "bottom", offsetX: 35, offsetY: 25, portId: "port-c", terminalGroupId: "port-c" },
  ],
  ports: [
    { id: "port-a", kind: "comm", label: "Port A", topology: "two_pole" },
    { id: "port-b", kind: "comm", label: "Port B", topology: "two_pole" },
    { id: "port-c", kind: "comm", label: "Port C", topology: "two_pole" },
  ],
};

export default product;
