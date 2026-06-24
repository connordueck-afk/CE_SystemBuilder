import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-aebus-splitter",
  manufacturer: "Generic",
  name: "AEbus Splitter",
  productType: "commAccessory",
  category: "Communication",
  description: "Passive AEbus communication splitter for parallel battery networks.",
  commAccessoryBehavior: "passive",
  width: 70,
  height: 50,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port A",
      connectorType: "RJ45",
      supportedProtocols: [
        "AEbus"
      ],
      configuredProtocol: "AEbus",
      isConfigurable: false
    },
    {
      id: "port-b",
      name: "Port B",
      connectorType: "RJ45",
      supportedProtocols: [
        "AEbus"
      ],
      configuredProtocol: "AEbus",
      isConfigurable: false
    },
    {
      id: "port-c",
      name: "Port C",
      connectorType: "RJ45",
      supportedProtocols: [
        "AEbus"
      ],
      configuredProtocol: "AEbus",
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
      offsetX: -35,
      offsetY: 25
    },
    {
      id: "port-b",
      label: "Port B",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "bottom",
      offsetX: 0,
      offsetY: 25
    },
    {
      id: "port-c",
      label: "Port C",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "bottom",
      offsetX: 35,
      offsetY: 25
    }
  ]
};

export default product;
