import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-vebus-cable-rj45",
  manufacturer: "Victron Energy",
  name: "VE.Bus RJ45 Cable",
  productType: "commAccessory",
  category: "Communication",
  description: "RJ45 cable for connecting VE.Bus devices (MultiPlus, Quattro, etc.).",
  commAccessoryBehavior: "passive",
  isBOMItem: true,
  width: 60,
  height: 40,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port A",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Bus"
      ],
      configuredProtocol: "VE.Bus",
      isConfigurable: false
    },
    {
      id: "port-b",
      name: "Port B",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Bus"
      ],
      configuredProtocol: "VE.Bus",
      isConfigurable: false
    }
  ],
  terminals: [
    {
      id: "port-a",
      label: "Port A",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "bottom",
      offsetX: -30,
      offsetY: 20
    },
    {
      id: "port-b",
      label: "Port B",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "bottom",
      offsetX: 30,
      offsetY: 20
    }
  ]
};

export default product;
