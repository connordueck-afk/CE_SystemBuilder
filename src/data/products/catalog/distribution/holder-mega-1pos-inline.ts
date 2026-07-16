import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "holder-mega-1pos-inline",
  "manufacturer": "Littelfuse",
  "name": "MEGA Fuse Holder 1-Position",
  "productType": "fuse_holder",
  "category": "Fuse Holders",
  "maxCurrentA": 500,
  "msrpUsd": 25,
  "oemPriceUsd": 17.5,
  "description": "Littelfuse 1-position inline MEGA fuse holder. M8 studs for cable connection.",
  "partNumber": "TBD",
  "productUrl": "https://www.littelfuse.com/products/fuse-blocks-fuseholders-and-fuse-accessories/fuseholders.aspx",
  "imageUrl": "/product-images/holder-mega-1pos.svg",
  "source": "Littelfuse catalog 2024",
  "dataQuality": "placeholder",
  "width": 92,
  "height": 40,
  "terminals": [
    {
      "id": "in_pos",
      "label": "IN+",
      "side": "left",
      "offsetX": -26,
      "offsetY": 0,
      "terminalGroupId": "positive_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Input positive stud, M8. Connect from source (battery, busbar, etc.)."
    },
    {
      "id": "out_pos",
      "label": "OUT+",
      "side": "right",
      "offsetX": 26,
      "offsetY": 0,
      "terminalGroupId": "slot_out",
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Fused output positive stud, M8. Connect to load or downstream distribution."
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
        "label": "MEGA Fuse",
        "upstreamBusId": "positive_bus",
        "downstreamTerminalId": "out_pos",
        "fuseStyle": "MEGA",
        "protectionType": "fuse",
        "defaultInstalled": false,
        "maxFuseA": 500
      }
    ]
  }
};

export default product;
