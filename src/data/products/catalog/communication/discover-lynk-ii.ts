import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-lynk-ii",
  manufacturer: "Discover Battery",
  name: "LYNK II",
  productType: "commGateway",
  category: "Communication",
  msrpUsd: 0,
  description: "Discover LYNK II battery communication gateway bridging BMS-Can to Ethernet and RS485 for multi-protocol integration and remote monitoring.",
  dataQuality: "partial",
  commAccessoryBehavior: "active-gateway",
  commProtocolBridges: [
    {
      fromProtocol: "BMS-Can",
      toProtocol: "Ethernet"
    },
    {
      fromProtocol: "BMS-Can",
      toProtocol: "RS485"
    }
  ],
  imageUrl: "/product-images/discover_lynk_ii.svg",
  width: 134,
  height: 128,
  communicationPorts: [
    {
      id: "port-can",
      name: "CAN",
      connectorType: "RJ45",
      supportedProtocols: [
        "CANopen",
        "VE.Can",
        "AEbus",
        "J1939"
      ],
      configuredProtocol: "CANopen",
      isConfigurable: true
    },
    {
      id: "port_lynk_rj45",
      name: "LYNK RJ45",
      connectorType: "RJ45",
      supportedProtocols: [
        "AEbus"
      ],
      configuredProtocol: "AEbus",
      isConfigurable: true
    },
    {
      id: "port_lynk_m12",
      name: "LYNK M12",
      connectorType: "M12",
      supportedProtocols: [
        "AEbus"
      ],
      configuredProtocol: "AEbus",
      isConfigurable: true
    }
  ],
  ports: [
    {
      id: "port-can",
      kind: "comm",
      topology: "two_pole",
      label: "CAN",
      role: "bidirectional",
      direction: "bidirectional",
      supportedProtocols: [
        "CANopen",
        "VE.Can",
        "AEbus",
        "J1939"
      ],
      configuredProtocol: "CANopen",
      isConfigurable: true
    },
    {
      id: "port_lynk",
      kind: "comm",
      topology: "two_pole",
      label: "LYNK",
      role: "bidirectional",
      direction: "bidirectional",
      supportedProtocols: [
        "AEbus"
      ],
      configuredProtocol: "AEbus"
    }
  ],
  terminalGroups: [
    {
      id: "port-can_iface",
      portId: "port-can",
      label: "CAN Interface",
      groupType: "communication_interface",
      internallyCommon: false
    },
    {
      id: "port_lynk_iface",
      portId: "port_lynk",
      label: "LYNK RJ45 Interface",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "port-can",
      terminalGroupId: "port-can_iface",
      label: "CAN",
      side: "bottom",
      offsetX: 56,
      offsetY: 22,
      connector: {
        kind: "comm"
      }
    },
    {
      id: "port_lynk_rj45",
      terminalGroupId: "port_lynk_iface",
      label: "LYNK RJ45",
      side: "left",
      offsetX: -49,
      offsetY: -30,
      connector: {
        kind: "comm"
      }
    },
    {
      id: "port_lynk_m12",
      terminalGroupId: "port_lynk_iface",
      label: "LYNK M12",
      side: "left",
      offsetX: -49,
      offsetY: 1,
      connector: {
        kind: "comm"
      }
    }
  ]
};

export default product;
