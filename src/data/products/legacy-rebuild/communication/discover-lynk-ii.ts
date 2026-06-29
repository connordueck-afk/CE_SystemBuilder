import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-lynk-ii",
  manufacturer: "Discover Battery",
  name: "LYNK II",
  productType: "commGateway",
  category: "Communication",
  description: "Discover LYNK II - advanced battery communication gateway bridging BMS-CAN to Ethernet and RS485 for multi-protocol integration and remote monitoring.",
  commAccessoryBehavior: "active-gateway",
  commProtocolBridges: [
    {
      fromProtocol: "BMS-Can",
      toProtocol: "Ethernet",
    },
    {
      fromProtocol: "BMS-Can",
      toProtocol: "RS485",
    },
  ],
  width: 134,
  height: 128,
  terminalGroups: [
    { id: "port-can", portId: "port-can", label: "CAN", groupType: "communication_interface", internallyCommon: false },
    { id: "port_lynk_rj45", portId: "port_lynk_rj45", label: "LYNK RJ45", groupType: "communication_interface", internallyCommon: false },
    { id: "port_lynk_m12", portId: "port_lynk_m12", label: "LYNK M12", groupType: "communication_interface", internallyCommon: false },
  ],
  communicationPorts: [
    {
      id: "port-can",
      name: "CAN",
      connectorType: "RJ45",
      supportedProtocols: [
        "CANopen",
        "VE.Can",
        "AEbus",
        "J1939",
      ],
      configuredProtocol: "CANopen",
      isConfigurable: true,
    },
    {
      id: "port_lynk_rj45",
      name: "LYNK RJ45",
      connectorType: "RJ45",
      supportedProtocols: [
        "AEbus",
      ],
      configuredProtocol: "AEbus",
      isConfigurable: true,
    },
    {
      id: "port_lynk_m12",
      name: "LYNK M12",
      connectorType: "M12",
      supportedProtocols: [
        "AEbus",
      ],
      isConfigurable: true,
      configuredProtocol: "AEbus",
    },
  ],
  terminals: [
    {
      id: "port-can",
      label: "CAN",
      role: "bidirectional",
      side: "bottom",
      offsetX: 56,
      offsetY: 22,
      portId: "port-can",
      terminalGroupId: "port-can",
    },
    {
      id: "port_lynk_rj45",
      label: "LYNK RJ45",
      role: "bidirectional",
      side: "left",
      offsetX: -49,
      offsetY: -30,
      portId: "port_lynk_rj45",
      terminalGroupId: "port_lynk_rj45",
    },
    {
      id: "port_lynk_m12",
      label: "LYNK M12",
      role: "bidirectional",
      side: "left",
      offsetX: -49,
      offsetY: 1,
      portId: "port_lynk_m12",
      terminalGroupId: "port_lynk_m12",
    },
  ],
  imageUrl: "/product-images/discover_lynk_ii.svg",
  ports: [
    {
      id: "port-can",
      kind: "comm",
      label: "CAN",
      topology: "two_pole",
    },
    {
      id: "port_lynk_rj45",
      kind: "comm",
      label: "LYNK RJ45",
      topology: "two_pole",
    },
    {
      id: "port_lynk_m12",
      kind: "comm",
      label: "LYNK M12",
      topology: "two_pole",
    },
  ],
};

export default product;
