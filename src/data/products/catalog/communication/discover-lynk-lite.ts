import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-lynk-lite",
  manufacturer: "Discover Battery",
  name: "LYNK Lite",
  productType: "commGateway",
  category: "Communication",
  msrpUsd: 0,
  description: "Discover LYNK Lite battery communication gateway bridging BMS-Can to RS485/USB for monitoring and integration.",
  dataQuality: "partial",
  commAccessoryBehavior: "active-gateway",
  commProtocolBridges: [
    {
      fromProtocol: "BMS-Can",
      toProtocol: "RS485"
    }
  ],
  imageUrl: "/product-images/discover_lynk_lite.svg",
  width: 90,
  height: 60,
  communicationPorts: [
    {
      id: "port-can",
      name: "CAN",
      connectorType: "M12",
      supportedProtocols: ["VE.Can", "CANopen", "AEbus", "J1939"],
      configuredProtocol: "CANopen",
      isConfigurable: true
    },
    {
      id: "port-lynk",
      name: "RS485 Port",
      connectorType: "M12",
      supportedProtocols: ["AEbus"],
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
      connectorType: "M12",
      supportedProtocols: ["VE.Can", "CANopen", "AEbus", "J1939"],
      configuredProtocol: "CANopen",
      isConfigurable: true
    },
    {
      id: "port-lynk",
      kind: "comm",
      topology: "two_pole",
      label: "RS485 Port",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "M12",
      supportedProtocols: ["AEbus"],
      configuredProtocol: "AEbus",
      isConfigurable: true
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
      id: "port-lynk_iface",
      portId: "port-lynk",
      label: "RS485 Port Interface",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "port-can",
      terminalGroupId: "port-can_iface",
      label: "CAN",
      side: "right",
      offsetX: -31,
      offsetY: -1,
      connector: {
        kind: "comm"
      }
    },
    {
      id: "port-lynk",
      terminalGroupId: "port-lynk_iface",
      label: "LYNK",
      side: "bottom",
      offsetX: 31,
      offsetY: 0,
      connector: {
        kind: "comm"
      }
    }
  ]
};

export default product;
