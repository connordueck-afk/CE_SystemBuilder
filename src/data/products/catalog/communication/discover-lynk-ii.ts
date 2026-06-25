import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-lynk-ii",
  manufacturer: "Discover Battery",
  name: "LYNK II",
  productType: "commGateway",
  category: "Communication",
  description: "Discover LYNK II — advanced battery communication gateway bridging BMS-CAN to Ethernet and RS485 for multi-protocol integration and remote monitoring.",
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
      isConfigurable: true,
      configuredProtocol: "AEbus"
    }
  ],
  terminals: [
    {
      id: "port-can",
      label: "CAN",
      kind: "network",
      role: "bidirectional",
      side: "bottom",
      offsetX: 56,
      offsetY: 22
    },
    {
      id: "port_lynk_rj45",
      label: "LYNK RJ45",
      kind: "network",
      role: "bidirectional",
      side: "left",
      offsetX: -49,
      offsetY: -30
    },
    {
      id: "port_lynk_m12",
      label: "LYNK M12",
      kind: "network",
      role: "bidirectional",
      side: "left",
      offsetX: -49,
      offsetY: 1
    }
  ],
  imageUrl: "/product-images/discover_lynk_ii.svg"
};

export default product;
