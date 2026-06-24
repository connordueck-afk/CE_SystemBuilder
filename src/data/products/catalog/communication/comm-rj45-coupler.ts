import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-rj45-coupler",
  manufacturer: "Generic",
  name: "RJ45 Coupler",
  productType: "commAccessory",
  category: "Communication",
  description: "Inline RJ45 coupler for extending communication cables.",
  commAccessoryBehavior: "passive",
  width: 60,
  height: 40,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port A",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Can",
        "BMS-Can",
        "VE.Bus",
        "AEbus",
        "CANopen",
        "J1939",
        "Ethernet"
      ],
      isConfigurable: false
    },
    {
      id: "port-b",
      name: "Port B",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Can",
        "BMS-Can",
        "VE.Bus",
        "AEbus",
        "CANopen",
        "J1939",
        "Ethernet"
      ],
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
