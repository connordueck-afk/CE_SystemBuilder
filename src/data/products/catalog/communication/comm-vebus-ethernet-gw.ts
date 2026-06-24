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
      supportedProtocols: [
        "VE.Bus"
      ],
      configuredProtocol: "VE.Bus",
      isConfigurable: false
    },
    {
      id: "port-eth",
      name: "Ethernet Port",
      connectorType: "RJ45",
      supportedProtocols: [
        "Ethernet"
      ],
      configuredProtocol: "Ethernet",
      isConfigurable: false
    }
  ],
  terminals: [
    {
      id: "port-vebus",
      label: "VE.Bus Port",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "bottom",
      offsetX: -45,
      offsetY: 30
    },
    {
      id: "port-eth",
      label: "Ethernet Port",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "bottom",
      offsetX: 45,
      offsetY: 30
    }
  ]
};

export default product;
