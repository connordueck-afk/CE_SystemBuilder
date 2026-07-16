import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "lynx-class-t-power-in",
  "manufacturer": "Victron",
  "name": "Lynx Class-T Power In",
  "productType": "dc_distribution",
  "category": "Distribution",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "maxCurrentA": 1000,
  "msrpUsd": 172,
  "description": "Victron Lynx Class-T Power In - DC busbar input module with integrated Class-T fuse holders.",
  "partNumber": "LYN020102010",
  "productUrl": "https://www.victronenergy.com/dc-distribution-systems/lynx-class-t-power-in",
  "imageUrl": "/product-images/victron/lynx_class_t_power_in_new.svg",
  "source": "Victron 2025",
  "notes": "Placeholder pricing/specs.",
  "dataQuality": "partial",
  "width": 180,
  "height": 106,
  "terminals": [
    {
      "id": "main_pos",
      "label": "Bat+",
      "side": "left",
      "offsetX": -82,
      "offsetY": -28,
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
      "offsetY": 28,
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
      "offsetY": -28,
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
      "offsetY": 28,
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
      "label": "F1+",
      "side": "bottom",
      "offsetX": -45,
      "offsetY": 50,
      "terminalGroupId": "slot_1_pos",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Fused tap 1 positive, Class-T fuse holder. Source or load depending on topology."
    },
    {
      "id": "out_neg_1",
      "label": "F1-",
      "side": "bottom",
      "offsetX": -15,
      "offsetY": 50,
      "terminalGroupId": "negative_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Fused tap 1 negative return."
    },
    {
      "id": "out_pos_2",
      "label": "F2+",
      "side": "bottom",
      "offsetX": 15,
      "offsetY": 50,
      "terminalGroupId": "slot_2_pos",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Fused tap 2 positive, Class-T fuse holder. Source or load depending on topology."
    },
    {
      "id": "out_neg_2",
      "label": "F2-",
      "side": "bottom",
      "offsetX": 45,
      "offsetY": 50,
      "terminalGroupId": "negative_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Fused tap 2 negative return."
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
    },
    {
      "id": "slot_1_pos",
      "portId": "slot_1",
      "label": "Class-T Fuse 1 Positive Output",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false,
      "requiresOvercurrentProtection": true,
      "maxFuseA": 600
    },
    {
      "id": "slot_2_pos",
      "portId": "slot_2",
      "label": "Class-T Fuse 2 Positive Output",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false,
      "requiresOvercurrentProtection": true,
      "maxFuseA": 600
    }
  ],
  "ports": [
    {
      "id": "main",
      "kind": "dc",
      "topology": "bus",
      "label": "Main Bus",
      "voltageClass": "dc_low_voltage",
      "nominalVoltageV": 12,
      "maxCurrentA": 1000,
      "role": "bus",
      "direction": "bidirectional"
    },
    {
      "id": "slot_1",
      "kind": "dc",
      "topology": "bus",
      "label": "Class-T Fuse 1 Output",
      "voltageClass": "dc_low_voltage",
      "nominalVoltageV": 12,
      "maxCurrentA": 600,
      "role": "bus",
      "direction": "bidirectional"
    },
    {
      "id": "slot_2",
      "kind": "dc",
      "topology": "bus",
      "label": "Class-T Fuse 2 Output",
      "voltageClass": "dc_low_voltage",
      "nominalVoltageV": 12,
      "maxCurrentA": 600,
      "role": "bus",
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
          "pass_pos"
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
          "out_neg_2"
        ],
        "maxCurrentA": 1000
      }
    ],
    "fuseSlots": [
      {
        "id": "slot_1",
        "label": "Class-T Fuse 1",
        "upstreamBusId": "positive_bus",
        "downstreamTerminalId": "out_pos_1",
        "pairedReturnTerminalId": "out_neg_1",
        "fuseStyle": "Class T",
        "protectionType": "fuse",
        "defaultInstalled": false,
        "maxFuseA": 600
      },
      {
        "id": "slot_2",
        "label": "Class-T Fuse 2",
        "upstreamBusId": "positive_bus",
        "downstreamTerminalId": "out_pos_2",
        "pairedReturnTerminalId": "out_neg_2",
        "fuseStyle": "Class T",
        "protectionType": "fuse",
        "defaultInstalled": false,
        "maxFuseA": 600
      }
    ]
  }
};

export default product;
