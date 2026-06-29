import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-can-splitter-4port",
  manufacturer: "Generic",
  name: "CAN 4-Port Splitter",
  productType: "commAccessory",
  category: "Communication",
  description: "4-port passive RJ45 CAN bus splitter.",
  commAccessoryBehavior: "passive",
  width: 80,
  height: 50,
  terminalGroups: [
    { id: "port-a", portId: "port-a", label: "Port A", groupType: "communication_interface", internallyCommon: false },
    { id: "port-b", portId: "port-b", label: "Port B", groupType: "communication_interface", internallyCommon: false },
    { id: "port-c", portId: "port-c", label: "Port C", groupType: "communication_interface", internallyCommon: false },
    { id: "port-d", portId: "port-d", label: "Port D", groupType: "communication_interface", internallyCommon: false },
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
    {
      id: "port-d",
      name: "Port D",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: false,
    },
  ],
  terminals: [
    { id: "port-a", label: "Port A", role: "bidirectional", side: "bottom", offsetX: -40, offsetY: 25, portId: "port-a", terminalGroupId: "port-a" },
    { id: "port-b", label: "Port B", role: "bidirectional", side: "bottom", offsetX: -13.333333333333336, offsetY: 25, portId: "port-b", terminalGroupId: "port-b" },
    { id: "port-c", label: "Port C", role: "bidirectional", side: "bottom", offsetX: 13.333333333333329, offsetY: 25, portId: "port-c", terminalGroupId: "port-c" },
    { id: "port-d", label: "Port D", role: "bidirectional", side: "bottom", offsetX: 40, offsetY: 25, portId: "port-d", terminalGroupId: "port-d" },
  ],
  ports: [
    { id: "port-a", kind: "comm", label: "Port A", topology: "two_pole" },
    { id: "port-b", kind: "comm", label: "Port B", topology: "two_pole" },
    { id: "port-c", kind: "comm", label: "Port C", topology: "two_pole" },
    { id: "port-d", kind: "comm", label: "Port D", topology: "two_pole" },
  ],
};

export default product;
