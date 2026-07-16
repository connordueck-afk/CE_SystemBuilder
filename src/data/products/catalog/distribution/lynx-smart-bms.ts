import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "lynx-smart-bms",
  "manufacturer": "Victron",
  "name": "Lynx Smart BMS 500",
  "productType": "dc_distribution",
  "category": "Distribution",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "maxCurrentA": 500,
  "msrpUsd": 799,
  "description": "Victron Lynx Smart BMS 500A - battery management system for Victron Lithium batteries. VE.Can / Bluetooth.",
  "partNumber": "LYN034160200",
  "imageUrl": "/product-images/victron/lynx_smart_bms_new.svg",
  "source": "Victron 2025",
  "notes": "Placeholder pricing/specs.",
  "dataQuality": "partial",
  "width": 135,
  "height": 112,
  "terminals": [
    {
      "id": "bat_pos",
      "label": "Bat+",
      "side": "left",
      "offsetX": -62,
      "offsetY": -27,
      "terminalGroupId": "bat_pos",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx"
    },
    {
      "id": "bat_neg",
      "label": "Bat-",
      "side": "left",
      "offsetX": -62,
      "offsetY": 27,
      "terminalGroupId": "bat_neg",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx"
    },
    {
      "id": "load_pos",
      "label": "Load+",
      "side": "right",
      "offsetX": 62,
      "offsetY": -27,
      "terminalGroupId": "load_pos",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx"
    },
    {
      "id": "load_neg",
      "label": "Load-",
      "side": "right",
      "offsetX": 62,
      "offsetY": 27,
      "terminalGroupId": "load_neg",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx"
    },
    {
      "id": "ve_can",
      "label": "VE.Can",
      "side": "top",
      "offsetX": 0,
      "offsetY": -54,
      "terminalGroupId": "ve_can_iface",
      "connector": {
        "kind": "comm"
      },
      "connectorType": "RJ45"
    }
  ],
  "terminalGroups": [
    {
      "id": "bat_pos",
      "portId": "main",
      "label": "Battery Positive",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false,
      "maxCurrentA": 500
    },
    {
      "id": "load_pos",
      "portId": "main",
      "label": "Load Positive",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false,
      "maxCurrentA": 500
    },
    {
      "id": "bat_neg",
      "portId": "main",
      "label": "Battery Negative",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": false,
      "maxCurrentA": 500
    },
    {
      "id": "load_neg",
      "portId": "main",
      "label": "Load Negative",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": false,
      "maxCurrentA": 500
    },
    {
      "id": "ve_can_iface",
      "portId": "ve_can",
      "label": "VE.Can Interface",
      "groupType": "communication_interface",
      "internallyCommon": false
    }
  ],
  "ports": [
    {
      "id": "main",
      "kind": "dc",
      "topology": "pass_through",
      "label": "Main",
      "voltageClass": "dc_low_voltage",
      "nominalVoltageV": 12,
      "maxCurrentA": 500,
      "role": "pass_through",
      "direction": "bidirectional"
    },
    {
      "id": "ve_can",
      "kind": "comm",
      "topology": "two_pole",
      "label": "VE.Can",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "VE.Can"
      ],
      "configuredProtocol": "VE.Can"
    }
  ],
  "busbarRatings": {
    "voltageRatingV": 58,
    "currentRatingA": 500,
    "busDesignation": "combined"
  },
  "distributionTopology": {
    "buses": [
      {
        "id": "positive_path",
        "label": "Positive Path",
        "busType": "dc_pos",
        "terminalIds": [
          "bat_pos",
          "load_pos"
        ],
        "maxCurrentA": 500
      },
      {
        "id": "negative_path",
        "label": "Negative Path",
        "busType": "dc_neg",
        "terminalIds": [
          "bat_neg",
          "load_neg"
        ],
        "maxCurrentA": 500
      }
    ]
  }
};

export default product;
