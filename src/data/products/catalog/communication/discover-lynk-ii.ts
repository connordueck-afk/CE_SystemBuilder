import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "discover-lynk-ii",
  "manufacturer": "Discover Battery",
  "name": "LYNK II",
  "productType": "commGateway",
  "category": "Communication",
  "msrpUsd": 0,
  "description": "Discover LYNK II battery communication gateway bridging BMS-Can to Ethernet and RS485 for multi-protocol integration and remote monitoring.",
  "dataQuality": "partial",
  "commAccessoryBehavior": "active-gateway",
  "commProtocolBridges": [
    {
      "fromProtocol": "BMS-Can",
      "toProtocol": "Ethernet"
    },
    {
      "fromProtocol": "BMS-Can",
      "toProtocol": "RS485"
    }
  ],
  "imageUrl": "/product-images/LYNK_II.svg",
  "width": 134,
  "height": 128,
  "ports": [
    {
      "id": "port-can",
      "kind": "comm",
      "topology": "two_pole",
      "label": "CAN",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "CANopen",
        "VE.Can",
        "AEbus",
        "J1939"
      ],
      "configuredProtocol": "CANopen",
      "isConfigurable": true
    },
    {
      "id": "port_lynk",
      "kind": "comm",
      "topology": "two_pole",
      "label": "LYNK",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "AEbus"
      ],
      "configuredProtocol": "AEbus"
    }
  ],
  "terminalGroups": [
    {
      "id": "port-can_iface",
      "portId": "port-can",
      "label": "CAN Interface",
      "groupType": "communication_interface",
      "internallyCommon": false
    },
    {
      "id": "port_lynk_iface",
      "portId": "port_lynk",
      "label": "LYNK RJ45 Interface",
      "groupType": "communication_interface",
      "internallyCommon": false
    }
  ],
  "terminals": [
    {
      "id": "port-can",
      "terminalGroupId": "port-can_iface",
      "label": "CAN",
      "side": "bottom",
      "offsetX": 66,
      "offsetY": 19,
      "connector": {
        "kind": "comm"
      },
      "connectorType": "RJ45"
    },
    {
      "id": "port_lynk_rj45",
      "terminalGroupId": "port_lynk_iface",
      "label": "LYNK RJ45",
      "side": "left",
      "offsetX": -53,
      "offsetY": 35,
      "connector": {
        "kind": "comm"
      },
      "connectorType": "RJ45"
    },
    {
      "id": "port_lynk_m12",
      "terminalGroupId": "port_lynk_iface",
      "label": "LYNK M12",
      "side": "left",
      "offsetX": -64,
      "offsetY": -14,
      "connector": {
        "kind": "comm"
      },
      "connectorType": "M12"
    }
  ]
};

export default product;
