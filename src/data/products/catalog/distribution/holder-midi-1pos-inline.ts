import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "holder-midi-1pos-inline",
  "manufacturer": "Littelfuse",
  "name": "MIDI Fuse Holder 1-Position",
  "productType": "fuse_holder",
  "category": "Fuse Holders",
  "maxCurrentA": 200,
  "msrpUsd": 15,
  "oemPriceUsd": 10.5,
  "description": "Littelfuse 1-position inline MIDI fuse holder. M6 studs for cable connection.",
  "partNumber": "TBD",
  "productUrl": "https://www.littelfuse.com/products/fuse-blocks-fuseholders-and-fuse-accessories/fuseholders.aspx",
  "imageUrl": "/product-images/holder-midi-1pos.svg",
  "source": "Littelfuse catalog 2024",
  "dataQuality": "placeholder",
  "width": 70,
  "height": 32,
  "terminals": [
    {
      "id": "in_pos",
      "label": "IN+",
      "side": "left",
      "offsetX": -20,
      "offsetY": 0,
      "terminalGroupId": "positive_bus",
      "connector": {
        "kind": "stud",
        "holeSize": "M6"
      },
      "notes": "Input positive stud, M6."
    },
    {
      "id": "out_pos",
      "label": "OUT+",
      "side": "right",
      "offsetX": 20,
      "offsetY": 0,
      "terminalGroupId": "slot_out",
      "connector": {
        "kind": "stud",
        "holeSize": "M6"
      },
      "notes": "Fused output positive stud, M6."
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
      "maxCurrentA": 200
    },
    {
      "id": "slot_out",
      "portId": "slot_1",
      "label": "Fuse Output",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false,
      "maxCurrentA": 200
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
      "maxCurrentA": 200,
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
      "maxCurrentA": 200,
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
        "maxCurrentA": 200
      }
    ],
    "fuseSlots": [
      {
        "id": "slot_1",
        "label": "MIDI Fuse",
        "upstreamBusId": "positive_bus",
        "downstreamTerminalId": "out_pos",
        "fuseStyle": "MIDI",
        "protectionType": "fuse",
        "defaultInstalled": false,
        "maxFuseA": 200
      }
    ]
  }
};

export default product;
