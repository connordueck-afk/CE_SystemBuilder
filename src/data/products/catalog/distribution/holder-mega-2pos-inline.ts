import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "holder-mega-2pos-inline",
  "manufacturer": "Littelfuse",
  "name": "MEGA Fuse Holder 2-Position",
  "productType": "fuse_holder",
  "category": "Fuse Holders",
  "maxCurrentA": 500,
  "msrpUsd": 45,
  "oemPriceUsd": 31.5,
  "description": "Littelfuse 2-position inline MEGA fuse holder. Common input, two independently fused outputs. M8 studs.",
  "partNumber": "TBD",
  "productUrl": "https://www.littelfuse.com/products/fuse-blocks-fuseholders-and-fuse-accessories/fuseholders.aspx",
  "imageUrl": "/product-images/holder-mega-2pos.svg",
  "source": "Littelfuse catalog 2024",
  "dataQuality": "placeholder",
  "width": 140,
  "height": 70,
  "terminals": [
    {
      "id": "in_pos",
      "label": "IN+",
      "side": "left",
      "offsetX": -50,
      "offsetY": -15,
      "terminalGroupId": "positive_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Common input positive stud, M8."
    },
    {
      "id": "in_neg",
      "label": "IN-",
      "side": "left",
      "offsetX": -50,
      "offsetY": 15,
      "terminalGroupId": "negative_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Common input negative stud, M8."
    },
    {
      "id": "out_pos_1",
      "label": "F1+",
      "side": "right",
      "offsetX": -6,
      "offsetY": -15,
      "terminalGroupId": "slot_1_out",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Fused output 1 positive stud, M8."
    },
    {
      "id": "out_neg_1",
      "label": "F1-",
      "side": "right",
      "offsetX": -6,
      "offsetY": 15,
      "terminalGroupId": "negative_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Output 1 negative return stud, M8."
    },
    {
      "id": "out_pos_2",
      "label": "F2+",
      "side": "right",
      "offsetX": 36,
      "offsetY": -15,
      "terminalGroupId": "slot_2_out",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Fused output 2 positive stud, M8."
    },
    {
      "id": "out_neg_2",
      "label": "F2-",
      "side": "right",
      "offsetX": 36,
      "offsetY": 15,
      "terminalGroupId": "negative_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Output 2 negative return stud, M8."
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
      "maxCurrentA": 500
    },
    {
      "id": "negative_bus",
      "portId": "main",
      "label": "Negative Bus",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": true,
      "maxCurrentA": 500
    },
    {
      "id": "slot_1_out",
      "portId": "slot_1",
      "label": "Fuse 1 Output",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false,
      "maxCurrentA": 500
    },
    {
      "id": "slot_2_out",
      "portId": "slot_2",
      "label": "Fuse 2 Output",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false,
      "maxCurrentA": 500
    }
  ],
  "ports": [
    {
      "id": "main",
      "kind": "dc",
      "topology": "bus",
      "label": "Main Circuit",
      "voltageClass": "dc_low_voltage",
      "nominalVoltageV": 12,
      "maxCurrentA": 500,
      "role": "bus",
      "direction": "bidirectional"
    },
    {
      "id": "slot_1",
      "kind": "dc",
      "topology": "bus",
      "label": "Fuse 1 Output",
      "voltageClass": "dc_low_voltage",
      "nominalVoltageV": 12,
      "maxCurrentA": 500,
      "role": "bus",
      "direction": "bidirectional"
    },
    {
      "id": "slot_2",
      "kind": "dc",
      "topology": "bus",
      "label": "Fuse 2 Output",
      "voltageClass": "dc_low_voltage",
      "nominalVoltageV": 12,
      "maxCurrentA": 500,
      "role": "bus",
      "direction": "bidirectional"
    }
  ],
  "distributionTopology": {
    "buses": [
      {
        "id": "positive_bus",
        "label": "Positive Bus",
        "busType": "dc_pos",
        "terminalIds": [
          "in_pos"
        ],
        "maxCurrentA": 500
      },
      {
        "id": "negative_bus",
        "label": "Negative Bus",
        "busType": "dc_neg",
        "terminalIds": [
          "in_neg",
          "out_neg_1",
          "out_neg_2"
        ],
        "maxCurrentA": 500
      }
    ],
    "fuseSlots": [
      {
        "id": "slot_1",
        "label": "Fuse 1",
        "upstreamBusId": "positive_bus",
        "downstreamTerminalId": "out_pos_1",
        "pairedReturnTerminalId": "out_neg_1",
        "fuseStyle": "MEGA",
        "protectionType": "fuse",
        "defaultInstalled": false,
        "maxFuseA": 500
      },
      {
        "id": "slot_2",
        "label": "Fuse 2",
        "upstreamBusId": "positive_bus",
        "downstreamTerminalId": "out_pos_2",
        "pairedReturnTerminalId": "out_neg_2",
        "fuseStyle": "MEGA",
        "protectionType": "fuse",
        "defaultInstalled": false,
        "maxFuseA": 500
      }
    ]
  }
};

export default product;
