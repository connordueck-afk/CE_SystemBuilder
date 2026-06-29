import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-vebus-ethernet-gw",
  manufacturer: "Victron Energy",
  name: "VE.Bus to Ethernet Interface",
  productType: "commGateway",
  category: "Communication",
  description: "Active gateway bridging VE.Bus to Ethernet for remote monitoring.",
  commAccessoryBehavior: "active-gateway",
  commProtocolBridges: [
    {
      fromProtocol: "VE.Bus",
      toProtocol: "Ethernet",
    },
  ],
  width: 90,
  height: 60,
  terminalGroups: [
    { id: "port-vebus", portId: "port-vebus", label: "VE.Bus Port", groupType: "communication_interface", internallyCommon: false },
    { id: "port-eth", portId: "port-eth", label: "Ethernet Port", groupType: "communication_interface", internallyCommon: false },
  ],
  communicationPorts: [
    {
      id: "port-vebus",
      name: "VE.Bus Port",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Bus"],
      configuredProtocol: "VE.Bus",
      isConfigurable: false,
    },
    {
      id: "port-eth",
      name: "Ethernet Port",
      connectorType: "RJ45",
      supportedProtocols: ["Ethernet"],
      configuredProtocol: "Ethernet",
      isConfigurable: false,
    },
  ],
  terminals: [
    {
      id: "port-vebus",
      label: "VE.Bus Port",
      role: "bidirectional",
      side: "bottom",
      offsetX: -45,
      offsetY: 30,
      portId: "port-vebus",
      terminalGroupId: "port-vebus",
    },
    {
      id: "port-eth",
      label: "Ethernet Port",
      role: "bidirectional",
      side: "bottom",
      offsetX: 45,
      offsetY: 30,
      portId: "port-eth",
      terminalGroupId: "port-eth",
    },
  ],
  ports: [
    {
      id: "port-vebus",
      kind: "comm",
      label: "VE.Bus Port",
      topology: "two_pole",
    },
    {
      id: "port-eth",
      kind: "comm",
      label: "Ethernet Port",
      topology: "two_pole",
    },
  ],
};

export default product;
