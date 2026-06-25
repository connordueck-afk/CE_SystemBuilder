import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-can-t-connector",
  manufacturer: "Generic",
  name: "CAN T-Connector",
  productType: "commAccessory",
  category: "Communication",
  description: "RJ45 T-connector/splitter for CAN bus networks (VE.Can, BMS-Can).",
  commAccessoryBehavior: "passive",
  width: 70,
  height: 50,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port A",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Can",
        "BMS-Can",
        "CANopen",
        "J1939"
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
        "CANopen",
        "J1939"
      ],
      isConfigurable: false
    },
    {
      id: "port-c",
      name: "Port C",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Can",
        "BMS-Can",
        "CANopen",
        "J1939"
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
      side: "bottom",
      offsetX: -35,
      offsetY: 25
    },
    {
      id: "port-b",
      label: "Port B",
      kind: "network",
      role: "bidirectional",
      side: "bottom",
      offsetX: 0,
      offsetY: 25
    },
    {
      id: "port-c",
      label: "Port C",
      kind: "network",
      role: "bidirectional",
      side: "bottom",
      offsetX: 35,
      offsetY: 25
    }
  ]
};

export default product;
