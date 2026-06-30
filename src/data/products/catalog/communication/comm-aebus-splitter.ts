import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-aebus-splitter",
  manufacturer: "Generic",
  name: "AEbus Splitter",
  productType: "commAccessory",
  category: "Communication",
  msrpUsd: 0,
  description: "Passive AEbus communication splitter for parallel battery networks.",
  dataQuality: "placeholder",
  commAccessoryBehavior: "passive",
  width: 70,
  height: 50,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port A",
      connectorType: "RJ45",
      supportedProtocols: ["AEbus"],
      configuredProtocol: "AEbus"
    },
    {
      id: "port-b",
      name: "Port B",
      connectorType: "RJ45",
      supportedProtocols: ["AEbus"],
      configuredProtocol: "AEbus"
    },
    {
      id: "port-c",
      name: "Port C",
      connectorType: "RJ45",
      supportedProtocols: ["AEbus"],
      configuredProtocol: "AEbus"
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
      supportedProtocols: ["AEbus"],
      configuredProtocol: "AEbus"
    },
    {
      id: "port-b",
      kind: "comm",
      topology: "two_pole",
      label: "Port B",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["AEbus"],
      configuredProtocol: "AEbus"
    },
    {
      id: "port-c",
      kind: "comm",
      topology: "two_pole",
      label: "Port C",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["AEbus"],
      configuredProtocol: "AEbus"
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
    }
  ],
  terminals: [
    {
      id: "port-a",
      terminalGroupId: "port-a_iface",
      label: "Port A",
      side: "bottom",
      offsetX: -35,
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
      offsetX: 0,
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
      offsetX: 35,
      offsetY: 25,
      connector: {
        kind: "comm"
      }
    }
  ]
};

export default product;
