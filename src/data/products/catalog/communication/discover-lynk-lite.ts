import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "discover-lynk-lite",
  "manufacturer": "Discover Battery",
  "name": "LYNK Lite",
  "productType": "commGateway",
  "category": "Communication",
  "msrpUsd": 0,
  "description": "Discover LYNK Lite battery communication gateway bridging BMS-Can to RS485/USB for monitoring and integration.",
  "dataQuality": "partial",
  "commAccessoryBehavior": "active-gateway",
  "commProtocolBridges": [
    {
      "fromProtocol": "BMS-Can",
      "toProtocol": "RS485"
    }
  ],
  "imageUrl": "/product-images/LynkLite.svg",
  "width": 90,
  "height": 60,
  "ports": [
    {
      "id": "port-can",
      "kind": "comm",
      "topology": "two_pole",
      "label": "CAN Out",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "VE.Can",
        "CANopen",
        "AEbus",
        "J1939",
        "Pylon LV"
      ],
      "configuredProtocol": "CANopen",
      "isConfigurable": true
    },
    {
      "id": "port-lynk",
      "kind": "comm",
      "topology": "two_pole",
      "label": "LYNK",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "AEbus"
      ],
      "configuredProtocol": "AEbus",
      "commTopology": "bus"
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
      "id": "port-lynk_iface",
      "portId": "port-lynk",
      "label": "RS485 Port Interface",
      "groupType": "communication_interface",
      "internallyCommon": false
    }
  ],
  "terminals": [
    {
      "id": "port-can",
      "terminalGroupId": "port-can_iface",
      "label": "CAN",
      "side": "right",
      "offsetX": -45,
      "offsetY": 0,
      "connector": {
        "kind": "comm"
      },
      "connectorType": "M12"
    },
    {
      "id": "port-lynk",
      "terminalGroupId": "port-lynk_iface",
      "label": "LYNK",
      "side": "bottom",
      "offsetX": 44,
      "offsetY": -4,
      "connector": {
        "kind": "comm"
      },
      "connectorType": "M12"
    }
  ]
};

export default product;
