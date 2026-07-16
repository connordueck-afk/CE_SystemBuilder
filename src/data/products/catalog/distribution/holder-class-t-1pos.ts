import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "holder-class-t-1pos",
  "manufacturer": "Blue Sea Systems",
  "name": "Class T Fuse Holder 1-Position",
  "productType": "fuse_holder",
  "category": "Fuse Holders",
  "maxCurrentA": 400,
  "msrpUsd": 55,
  "oemPriceUsd": 38.5,
  "description": "Blue Sea Systems Class T fuse holder, 1-position. M10 studs for high-current battery circuits.",
  "partNumber": "5502100",
  "productUrl": "https://www.bluesea.com/products/5502100/Class_T_Fuse_Block",
  "imageUrl": "/product-images/holder-class-t-1pos.svg",
  "source": "Blue Sea Systems catalog",
  "dataQuality": "partial",
  "width": 150,
  "height": 60,
  "terminals": [
    {
      "id": "in_pos",
      "label": "IN+",
      "side": "left",
      "offsetX": -45,
      "offsetY": 0,
      "terminalGroupId": "positive_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M10"
      },
      "notes": "Input positive stud, M10."
    },
    {
      "id": "out_pos",
      "label": "OUT+",
      "side": "right",
      "offsetX": 45,
      "offsetY": 0,
      "terminalGroupId": "slot_out",
      "connector": {
        "kind": "stud",
        "holeSize": "M10"
      },
      "notes": "Fused output positive stud, M10."
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
      "maxCurrentA": 400
    },
    {
      "id": "slot_out",
      "portId": "slot_1",
      "label": "Fuse Output",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false,
      "maxCurrentA": 400
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
      "maxCurrentA": 400,
      "role": "bus",
      "direction": "bidirectional"
    },
    {
      "id": "slot_1",
      "kind": "dc",
      "topology": "bus",
      "label": "Fuse Output",
      "voltageClass": "dc_low_voltage",
      "nominalVoltageV": 12,
      "maxCurrentA": 400,
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
        "maxCurrentA": 400
      }
    ],
    "fuseSlots": [
      {
        "id": "slot_1",
        "label": "Class T Fuse",
        "upstreamBusId": "positive_bus",
        "downstreamTerminalId": "out_pos",
        "fuseStyle": "Class T",
        "protectionType": "fuse",
        "defaultInstalled": false,
        "maxFuseA": 400
      }
    ]
  }
};

export default product;
