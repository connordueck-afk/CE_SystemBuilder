import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "dist-vic-lynx-power-in",
  "manufacturer": "Victron",
  "name": "Lynx Power In",
  "productType": "dc_distribution",
  "category": "Distribution",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "maxCurrentA": 1000,
  "msrpUsd": 249,
  "oemPriceUsd": 174,
  "description": "Victron Lynx Power In - unfused DC busbar module (same housing as the Lynx Distributor, no fuses)",
  "partNumber": "LYN040102000",
  "productUrl": "https://www.victronenergy.com/dc-distribution-systems/lynx-power-in",
  "imageUrl": "/product-images/victron/lynx_power_in_m8.svg",
  "source": "Victron 2024",
  "dataQuality": "partial",
  "width": 180,
  "height": 110,
  "terminals": [
    {
      "id": "main_pos",
      "label": "Bat+",
      "side": "left",
      "offsetX": -82,
      "offsetY": -30,
      "terminalGroupId": "positive_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx",
      "notes": "Main positive input (battery side). Bidirectional."
    },
    {
      "id": "main_neg",
      "label": "Bat-",
      "side": "left",
      "offsetX": -82,
      "offsetY": 30,
      "terminalGroupId": "negative_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx",
      "notes": "Main negative input (battery side). Bidirectional."
    },
    {
      "id": "pass_pos",
      "label": "Bus+",
      "side": "right",
      "offsetX": 82,
      "offsetY": -30,
      "terminalGroupId": "positive_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx",
      "notes": "Unfused positive pass-through to the next Lynx module. Bidirectional."
    },
    {
      "id": "pass_neg",
      "label": "Bus-",
      "side": "right",
      "offsetX": 82,
      "offsetY": 30,
      "terminalGroupId": "negative_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "busLinkStandard": "victron-lynx",
      "notes": "Unfused negative pass-through to the next Lynx module. Bidirectional."
    },
    {
      "id": "out_pos_1",
      "label": "+1",
      "side": "bottom",
      "offsetX": -54,
      "offsetY": 50,
      "terminalGroupId": "positive_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Unfused positive bus connection. Source or load depending on topology."
    },
    {
      "id": "out_neg_1",
      "label": "-1",
      "side": "bottom",
      "offsetX": -42,
      "offsetY": 50,
      "terminalGroupId": "negative_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Unfused negative bus connection. Source or load depending on topology."
    },
    {
      "id": "out_pos_2",
      "label": "+2",
      "side": "bottom",
      "offsetX": -18,
      "offsetY": 50,
      "terminalGroupId": "positive_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Unfused positive bus connection. Source or load depending on topology."
    },
    {
      "id": "out_neg_2",
      "label": "-2",
      "side": "bottom",
      "offsetX": -6,
      "offsetY": 50,
      "terminalGroupId": "negative_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Unfused negative bus connection. Source or load depending on topology."
    },
    {
      "id": "out_pos_3",
      "label": "+3",
      "side": "bottom",
      "offsetX": 18,
      "offsetY": 50,
      "terminalGroupId": "positive_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Unfused positive bus connection. Source or load depending on topology."
    },
    {
      "id": "out_neg_3",
      "label": "-3",
      "side": "bottom",
      "offsetX": 30,
      "offsetY": 50,
      "terminalGroupId": "negative_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Unfused negative bus connection. Source or load depending on topology."
    },
    {
      "id": "out_pos_4",
      "label": "+4",
      "side": "bottom",
      "offsetX": 54,
      "offsetY": 50,
      "terminalGroupId": "positive_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Unfused positive bus connection. Source or load depending on topology."
    },
    {
      "id": "out_neg_4",
      "label": "-4",
      "side": "bottom",
      "offsetX": 66,
      "offsetY": 50,
      "terminalGroupId": "negative_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Unfused negative bus connection. Source or load depending on topology."
    }
  ],
  "terminalGroups": [
    {
      "id": "positive_bus",
      "portId": "main",
      "label": "Positive Bus",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": true,
      "maxCurrentA": 1000
    },
    {
      "id": "negative_bus",
      "portId": "main",
      "label": "Negative Bus",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": true,
      "maxCurrentA": 1000
    }
  ],
  "ports": [
    {
      "id": "main",
      "kind": "dc",
      "topology": "bus",
      "label": "Main",
      "voltageClass": "dc_low_voltage",
      "nominalVoltageV": 12,
      "maxCurrentA": 1000,
      "role": "bus",
      "direction": "bidirectional"
    }
  ],
  "busbarRatings": {
    "voltageRatingV": 58,
    "currentRatingA": 1000,
    "connectionCount": 4,
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
          "pass_pos",
          "out_pos_1",
          "out_pos_2",
          "out_pos_3",
          "out_pos_4"
        ],
        "maxCurrentA": 1000
      },
      {
        "id": "negative_bus",
        "label": "Negative Bus",
        "busType": "dc_neg",
        "terminalIds": [
          "main_neg",
          "pass_neg",
          "out_neg_1",
          "out_neg_2",
          "out_neg_3",
          "out_neg_4"
        ],
        "maxCurrentA": 1000
      }
    ]
  }
};

export default product;
