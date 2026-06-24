import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-aebus-terminator",
  manufacturer: "Generic",
  name: "AEbus Terminator",
  productType: "commAccessory",
  category: "Communication",
  description: "Terminator for AEbus network end points.",
  commAccessoryBehavior: "terminator",
  width: 60,
  height: 40,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port",
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
      label: "Port",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "bottom",
      offsetX: 0,
      offsetY: 20
    }
  ]
};

export default product;
