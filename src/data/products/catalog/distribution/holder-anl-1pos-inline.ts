import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "holder-anl-1pos-inline",
  "manufacturer": "Blue Sea Systems",
  "name": "ANL Fuse Holder 1-Position",
  "productType": "fuse_holder",
  "category": "Fuse Holders",
  "maxCurrentA": 500,
  "msrpUsd": 30,
  "oemPriceUsd": 21,
  "description": "Blue Sea Systems ANL fuse holder, 1-position, M8 studs. 500A max.",
  "partNumber": "5005100",
  "productUrl": "https://www.bluesea.com/products/5005100/ANL_Fuse_Block",
  "imageUrl": "/product-images/holder-anl-1pos.svg",
  "source": "Blue Sea Systems catalog",
  "dataQuality": "partial",
  "width": 130,
  "height": 50,
  "terminals": [
    {
      "id": "in_pos",
      "label": "IN+",
      "side": "left",
      "offsetX": -42,
      "offsetY": 0,
      "terminalGroupId": "positive_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Input positive stud, M8."
    },
    {
      "id": "out_pos",
      "label": "OUT+",
      "side": "right",
      "offsetX": 42,
      "offsetY": 0,
      "terminalGroupId": "slot_out",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Fused output positive stud, M8."
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
      "id": "slot_out",
      "portId": "slot_1",
      "label": "Fuse Output",
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
      "label": "Fuse Output",
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
      }
    ],
    "fuseSlots": [
      {
        "id": "slot_1",
        "label": "ANL Fuse",
        "upstreamBusId": "positive_bus",
        "downstreamTerminalId": "out_pos",
        "fuseStyle": "ANL",
        "protectionType": "fuse",
        "defaultInstalled": false,
        "maxFuseA": 500
      }
    ]
  }
};

export default product;
