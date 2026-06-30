import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-can-usb-interface",
  manufacturer: "Generic",
  name: "CAN to USB Interface",
  productType: "commGateway",
  category: "Communication",
  msrpUsd: 0,
  description: "Active CAN-to-USB adapter for diagnostics. Not for permanent installed links.",
  dataQuality: "placeholder",
  commAccessoryBehavior: "active-interface",
  width: 80,
  height: 55,
  communicationPorts: [
    {
      id: "port-can",
      name: "CAN Port",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: true
    }
  ],
  ports: [
    {
      id: "port-can",
      kind: "comm",
      topology: "two_pole",
      label: "CAN Port",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
      isConfigurable: true
    }
  ],
  terminalGroups: [
    {
      id: "port-can_iface",
      portId: "port-can",
      label: "CAN Port Interface",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "port-can",
      terminalGroupId: "port-can_iface",
      label: "CAN Port",
      side: "bottom",
      offsetX: 0,
      offsetY: 27.5,
      connector: {
        kind: "comm"
      }
    }
  ]
};

export default product;
