import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-can-terminator-generic",
  manufacturer: "Generic",
  name: "CAN Terminator",
  productType: "commAccessory",
  category: "Communication",
  description: "Generic 120 Ohm terminator for CAN bus ends.",
  commAccessoryBehavior: "terminator",
  width: 60,
  height: 40,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port",
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
      label: "Port",
      kind: "network",
      role: "bidirectional",
      side: "bottom",
      offsetX: 0,
      offsetY: 20
    }
  ]
};

export default product;
