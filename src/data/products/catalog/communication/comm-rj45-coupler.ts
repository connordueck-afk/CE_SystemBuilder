import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-rj45-coupler",
  manufacturer: "Generic",
  name: "RJ45 Coupler",
  productType: "commAccessory",
  category: "Communication",
  msrpUsd: 0,
  description: "Inline RJ45 coupler for extending communication cables.",
  dataQuality: "placeholder",
  commAccessoryBehavior: "passive",
  width: 60,
  height: 40,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port A",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "VE.Bus", "AEbus", "CANopen", "J1939", "Ethernet"],
      isConfigurable: false
    },
    {
      id: "port-b",
      name: "Port B",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "VE.Bus", "AEbus", "CANopen", "J1939", "Ethernet"],
      isConfigurable: false
    }
  ],
  ports: [
    {
      id: "port-a",
      kind: "comm",
      topology: "two_pole",
      label: "Port A",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "VE.Bus", "AEbus", "CANopen", "J1939", "Ethernet"],
      isConfigurable: false
    },
    {
      id: "port-b",
      kind: "comm",
      topology: "two_pole",
      label: "Port B",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "VE.Bus", "AEbus", "CANopen", "J1939", "Ethernet"],
      isConfigurable: false
    }
  ],
  terminalGroups: [
    {
      id: "port-a_iface",
      portId: "port-a",
      label: "Port A Interface",
      groupType: "communication_interface",
      internallyCommon: false
    },
    {
      id: "port-b_iface",
      portId: "port-b",
      label: "Port B Interface",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "port-a",
      terminalGroupId: "port-a_iface",
      label: "Port A",
      side: "bottom",
      offsetX: -30,
      offsetY: 20,
      connector: {
        kind: "comm"
      }
    },
    {
      id: "port-b",
      terminalGroupId: "port-b_iface",
      label: "Port B",
      side: "bottom",
      offsetX: 30,
      offsetY: 20,
      connector: {
        kind: "comm"
      }
    }
  ]
};

export default product;
