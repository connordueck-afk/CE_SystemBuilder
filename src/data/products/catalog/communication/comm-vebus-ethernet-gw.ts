import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-vebus-ethernet-gw",
  manufacturer: "Victron Energy",
  name: "VE.Bus to Ethernet Interface",
  productType: "commGateway",
  category: "Communication",
  msrpUsd: 0,
  description: "Active gateway bridging VE.Bus to Ethernet for remote monitoring.",
  dataQuality: "placeholder",
  commAccessoryBehavior: "active-gateway",
  commProtocolBridges: [
    {
      fromProtocol: "VE.Bus",
      toProtocol: "Ethernet"
    }
  ],
  width: 90,
  height: 60,
  communicationPorts: [
    {
      id: "port-vebus",
      name: "VE.Bus Port",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Bus"],
      configuredProtocol: "VE.Bus"
    },
    {
      id: "port-eth",
      name: "Ethernet Port",
      connectorType: "RJ45",
      supportedProtocols: ["Ethernet"],
      configuredProtocol: "Ethernet"
    }
  ],
  ports: [
    {
      id: "port-vebus",
      kind: "comm",
      topology: "two_pole",
      label: "VE.Bus Port",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Bus"],
      configuredProtocol: "VE.Bus"
    },
    {
      id: "port-eth",
      kind: "comm",
      topology: "two_pole",
      label: "Ethernet Port",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["Ethernet"],
      configuredProtocol: "Ethernet"
    }
  ],
  terminalGroups: [
    {
      id: "port-vebus_iface",
      portId: "port-vebus",
      label: "VE.Bus Port Interface",
      groupType: "communication_interface",
      internallyCommon: false
    },
    {
      id: "port-eth_iface",
      portId: "port-eth",
      label: "Ethernet Port Interface",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "port-vebus",
      terminalGroupId: "port-vebus_iface",
      label: "VE.Bus Port",
      side: "bottom",
      offsetX: -45,
      offsetY: 30,
      connector: {
        kind: "comm"
      }
    },
    {
      id: "port-eth",
      terminalGroupId: "port-eth_iface",
      label: "Ethernet Port",
      side: "bottom",
      offsetX: 45,
      offsetY: 30,
      connector: {
        kind: "comm"
      }
    }
  ]
};

export default product;
