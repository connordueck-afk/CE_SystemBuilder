import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-can-usb-interface",
  manufacturer: "Generic",
  name: "CAN to USB Interface",
  productType: "commGateway",
  category: "Communication",
  description: "Active CAN-to-USB adapter for diagnostics. Not for permanent installed links.",
  commAccessoryBehavior: "active-interface",
  width: 80,
  height: 55,
  terminalGroups: [
    { id: "port-can", portId: "port-can", label: "CAN Port", groupType: "communication_interface", internallyCommon: false },
  ],
  communicationPorts: [
    {
      id: "port-can",
      name: "CAN Port",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: false,
    },
  ],
  terminals: [
    {
      id: "port-can",
      label: "CAN Port",
      role: "bidirectional",
      side: "bottom",
      offsetX: 0,
      offsetY: 27.5,
      portId: "port-can",
      terminalGroupId: "port-can",
    },
  ],
  ports: [
    { id: "port-can", kind: "comm", label: "CAN Port", topology: "two_pole" },
  ],
};

export default product;
