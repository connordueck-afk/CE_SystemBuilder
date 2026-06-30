import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-can-splitter-4port",
  manufacturer: "Generic",
  name: "CAN 4-Port Splitter",
  productType: "commAccessory",
  category: "Communication",
  msrpUsd: 0,
  description: "4-port passive RJ45 CAN bus splitter.",
  dataQuality: "placeholder",
  commAccessoryBehavior: "passive",
  width: 80,
  height: 50,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port A",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: false
    },
    {
      id: "port-b",
      name: "Port B",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: false
    },
    {
      id: "port-c",
      name: "Port C",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: false
    },
    {
      id: "port-d",
      name: "Port D",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
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
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
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
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: false
    },
    {
      id: "port-c",
      kind: "comm",
      topology: "two_pole",
      label: "Port C",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: false
    },
    {
      id: "port-d",
      kind: "comm",
      topology: "two_pole",
      label: "Port D",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
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
    },
    {
      id: "port-c_iface",
      portId: "port-c",
      label: "Port C Interface",
      groupType: "communication_interface",
      internallyCommon: false
    },
    {
      id: "port-d_iface",
      portId: "port-d",
      label: "Port D Interface",
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
      offsetX: -40,
      offsetY: 25,
      connector: {
        kind: "comm"
      }
    },
    {
      id: "port-b",
      terminalGroupId: "port-b_iface",
      label: "Port B",
      side: "bottom",
      offsetX: -13.33,
      offsetY: 25,
      connector: {
        kind: "comm"
      }
    },
    {
      id: "port-c",
      terminalGroupId: "port-c_iface",
      label: "Port C",
      side: "bottom",
      offsetX: 13.33,
      offsetY: 25,
      connector: {
        kind: "comm"
      }
    },
    {
      id: "port-d",
      terminalGroupId: "port-d_iface",
      label: "Port D",
      side: "bottom",
      offsetX: 40,
      offsetY: 25,
      connector: {
        kind: "comm"
      }
    }
  ]
};

export default product;
