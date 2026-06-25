import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-lynk-lite",
  manufacturer: "Discover Battery",
  name: "LYNK Lite",
  productType: "commGateway",
  category: "Communication",
  description: "Discover LYNK Lite — battery communication gateway bridging BMS-CAN to RS485/USB for monitoring and integration.",
  commAccessoryBehavior: "active-gateway",
  commProtocolBridges: [
    {
      fromProtocol: "BMS-Can",
      toProtocol: "RS485"
    }
  ],
  width: 90,
  height: 60,
  communicationPorts: [
    {
      id: "port-can",
      name: "BMS-CAN Port",
      connectorType: "M12",
      supportedProtocols: [
        "VE.Can",
        "CANopen",
        "AEbus",
        "J1939"
      ],
      configuredProtocol: "CANopen",
      isConfigurable: true
    },
    {
      id: "port-lynk",
      name: "RS485 Port",
      connectorType: "M12",
      supportedProtocols: [
        "AEbus"
      ],
      configuredProtocol: "AEbus",
      isConfigurable: false
    }
  ],
  terminals: [
    {
      id: "port-can",
      label: "CAN",
      kind: "network",
      role: "bidirectional",
      side: "right",
      offsetX: -31,
      offsetY: -1
    },
    {
      id: "port-lynk",
      label: "LYNK",
      kind: "network",
      role: "bidirectional",
      side: "bottom",
      offsetX: 31,
      offsetY: 0
    }
  ],
  imageUrl: "/product-images/discover_lynk_lite.svg",
  msrpUsd: 300
};

export default product;
