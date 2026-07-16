import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "lynx-shunt-ve-can",
  "manufacturer": "Victron",
  "name": "Lynx Shunt VE.Can",
  "productType": "dc_distribution",
  "category": "Distribution",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "maxCurrentA": 1000,
  "msrpUsd": 420,
  "description": "Victron Lynx Shunt VE.Can - precision 1000A current measurement module for the Lynx system. VE.Can communication.",
  "partNumber": "LYN040102100",
  "productUrl": "https://www.cdnrg.com/products/velyn040102100",
  "imageUrl": "/product-images/victron/lynx_shunt_ve_can_m8.svg",
  "source": "Victron 2025",
  "notes": "Placeholder pricing/specs.",
  "dataQuality": "partial",
  "width": 125,
  "height": 110,
  "terminals": [
    {
      "id": "main_pos",
      "label": "Main+",
      "side": "left",
      "offsetX": -70,
      "offsetY": -15,
      "terminalGroupId": "main_pos",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx"
    },
    {
      "id": "main_neg",
      "label": "Main-",
      "side": "left",
      "offsetX": -70,
      "offsetY": 15,
      "terminalGroupId": "main_neg",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx"
    },
    {
      "id": "out_pos",
      "label": "Out+",
      "side": "right",
      "offsetX": 70,
      "offsetY": -15,
      "terminalGroupId": "out_pos",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx"
    },
    {
      "id": "out_neg",
      "label": "Out-",
      "side": "right",
      "offsetX": 70,
      "offsetY": 15,
      "terminalGroupId": "out_neg",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx"
    }
  ],
  "terminalGroups": [
    {
      "id": "main_pos",
      "portId": "main",
      "label": "Main Positive",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false,
      "maxCurrentA": 1000
    },
    {
      "id": "out_pos",
      "portId": "main",
      "label": "Output Positive",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false,
      "maxCurrentA": 1000
    },
    {
      "id": "main_neg",
      "portId": "main",
      "label": "Main Negative",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": false,
      "maxCurrentA": 1000
    },
    {
      "id": "out_neg",
      "portId": "main",
      "label": "Output Negative",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": false,
      "maxCurrentA": 1000
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
      "maxCurrentA": 1000,
      "role": "pass_through",
      "direction": "bidirectional"
    }
  ],
  "busbarRatings": {
    "voltageRatingV": 58,
    "currentRatingA": 1000,
    "busDesignation": "combined"
  },
  "distributionTopology": {
    "buses": [
      {
        "id": "positive_bus",
        "label": "Positive Bus",
        "busType": "dc_pos",
        "terminalIds": [
          "main_pos",
          "out_pos"
        ],
        "maxCurrentA": 1000
      },
      {
        "id": "negative_shunt",
        "label": "Negative Shunt",
        "busType": "dc_neg",
        "terminalIds": [
          "main_neg",
          "out_neg"
        ],
        "maxCurrentA": 1000
      }
    ]
  }
};

export default product;
