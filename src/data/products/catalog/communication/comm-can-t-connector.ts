import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "comm-can-t-connector",
  "manufacturer": "Generic",
  "name": "CAN T-Connector",
  "productType": "commAccessory",
  "category": "Communication",
  "imageUrl": "/product-images/M12_T-Connector.svg",
  "msrpUsd": 0,
  "description": "RJ45 T-connector/splitter for CAN bus networks (VE.Can, BMS-Can).",
  "dataQuality": "placeholder",
  "commAccessoryBehavior": "passive",
  "width": 70,
  "height": 50,
  "ports": [
    {
      "id": "communication",
      "kind": "comm",
      "topology": "two_pole",
      "label": "COM",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "AEbus"
      ],
      "commTopology": "bus",
      "configuredProtocol": "AEbus",
      "isConfigurable": false
    }
  ],
  "terminalGroups": [
    {
      "id": "port-a_iface",
      "portId": "communication",
      "label": "Port A Interface",
      "groupType": "communication_interface",
      "internallyCommon": false
    }
  ],
  "terminals": [
    {
      "id": "port-a",
      "terminalGroupId": "port-a_iface",
      "label": "A",
      "side": "bottom",
      "offsetX": 0,
      "offsetY": 25,
      "connector": {
        "kind": "comm"
      },
      "connectorType": "M12",
      "gender": "male"
    },
    {
      "id": "port-b",
      "terminalGroupId": "port-a_iface",
      "label": "B",
      "side": "left",
      "offsetX": -35,
      "offsetY": -12,
      "connector": {
        "kind": "comm"
      },
      "connectorType": "M12",
      "gender": "female"
    },
    {
      "id": "port-c",
      "terminalGroupId": "port-a_iface",
      "label": "C",
      "side": "right",
      "offsetX": 35,
      "offsetY": -12,
      "connector": {
        "kind": "comm"
      },
      "connectorType": "M12",
      "gender": "female"
    }
  ]
};

export default product;
