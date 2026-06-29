import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-vecan-cable-rj45",
  manufacturer: "Victron Energy",
  name: "VE.Can RJ45 Cable",
  productType: "commAccessory",
  category: "Communication",
  description: "RJ45 cable for VE.Can network connections.",
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
        "VE.Can",
        "BMS-Can"
      ],
      isConfigurable: false
    },
    {
      id: "port-b",
      name: "Port B",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Can",
        "BMS-Can"
      ],
      isConfigurable: false
    }
  ],
  terminals: [
    {
      id: "port-a",
      label: "Port A",
      role: "bidirectional",
      side: "bottom",
      offsetX: -30,
      offsetY: 20,
      portId: "port-a"
    },
    {
      id: "port-b",
      label: "Port B",
      role: "bidirectional",
      side: "bottom",
      offsetX: 30,
      offsetY: 20,
      portId: "port-b"
    }
  ],
  ports: [
    {
      id: "port-a",
      kind: "comm",
      label: "Port A",
      topology: "two_pole"
    },
    {
      id: "port-b",
      kind: "comm",
      label: "Port B",
      topology: "two_pole"
    }
  ]
};

export default product;
