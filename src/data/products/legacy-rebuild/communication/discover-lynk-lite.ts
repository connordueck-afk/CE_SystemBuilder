import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-lynk-lite",
  manufacturer: "Discover Battery",
  name: "LYNK Lite",
  productType: "commGateway",
  category: "Communication",
  description: "Discover LYNK Lite - battery communication gateway bridging BMS-CAN to RS485 for monitoring and integration.",
  commAccessoryBehavior: "active-gateway",
  commProtocolBridges: [
    {
      fromProtocol: "BMS-Can",
      toProtocol: "RS485",
    },
  ],
  width: 90,
  height: 60,
  terminalGroups: [
    { id: "port-can", portId: "port-can", label: "BMS-CAN Port", groupType: "communication_interface", internallyCommon: false },
    { id: "port-lynk", portId: "port-lynk", label: "RS485 Port", groupType: "communication_interface", internallyCommon: false },
  ],
  communicationPorts: [
    {
      id: "port-can",
      name: "BMS-CAN Port",
      connectorType: "M12",
      supportedProtocols: [
        "VE.Can",
        "CANopen",
        "AEbus",
        "J1939",
      ],
      configuredProtocol: "CANopen",
      isConfigurable: true,
    },
    {
      id: "port-lynk",
      name: "RS485 Port",
      connectorType: "M12",
      supportedProtocols: [
        "AEbus",
      ],
      configuredProtocol: "AEbus",
      isConfigurable: false,
    },
  ],
  terminals: [
    {
      id: "port-can",
      label: "CAN",
      role: "bidirectional",
      side: "right",
      offsetX: -31,
      offsetY: -1,
      portId: "port-can",
      terminalGroupId: "port-can",
    },
    {
      id: "port-lynk",
      label: "LYNK",
      role: "bidirectional",
      side: "bottom",
      offsetX: 31,
      offsetY: 0,
      portId: "port-lynk",
      terminalGroupId: "port-lynk",
    },
  ],
  imageUrl: "/product-images/discover_lynk_lite.svg",
  msrpUsd: 300,
  ports: [
    {
      id: "port-can",
      kind: "comm",
      label: "BMS-CAN Port",
      topology: "two_pole",
    },
    {
      id: "port-lynk",
      kind: "comm",
      label: "RS485 Port",
      topology: "two_pole",
    },
  ],
};

export default product;
