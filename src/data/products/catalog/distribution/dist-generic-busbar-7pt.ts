import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "dist-generic-busbar-7pt",
  "manufacturer": "Generic",
  "name": "Generic Busbar 7-point",
  "productType": "busbar",
  "category": "7 connection points",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "maxCurrentA": 600,
  "msrpUsd": 85,
  "oemPriceUsd": 59,
  "description": "Single-conductor DC busbar with 7 connection points. Set the bus assignment on the placed component.",
  "source": "Estimate",
  "dataQuality": "placeholder",
  "width": 154,
  "height": 80,
  "terminals": [
    {
      "id": "terminal_1",
      "label": "T1",
      "side": "bottom",
      "offsetX": -59,
      "offsetY": 30,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Bus connection point. Polarity determined by component busPolarity assignment.",
      "terminalGroupId": "bus"
    },
    {
      "id": "terminal_2",
      "label": "T2",
      "side": "bottom",
      "offsetX": -39.33,
      "offsetY": 30,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Bus connection point. Polarity determined by component busPolarity assignment.",
      "terminalGroupId": "bus"
    },
    {
      "id": "terminal_3",
      "label": "T3",
      "side": "bottom",
      "offsetX": -19.67,
      "offsetY": 30,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Bus connection point. Polarity determined by component busPolarity assignment.",
      "terminalGroupId": "bus"
    },
    {
      "id": "terminal_4",
      "label": "T4",
      "side": "bottom",
      "offsetX": 0,
      "offsetY": 30,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Bus connection point. Polarity determined by component busPolarity assignment.",
      "terminalGroupId": "bus"
    },
    {
      "id": "terminal_5",
      "label": "T5",
      "side": "bottom",
      "offsetX": 19.67,
      "offsetY": 30,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Bus connection point. Polarity determined by component busPolarity assignment.",
      "terminalGroupId": "bus"
    },
    {
      "id": "terminal_6",
      "label": "T6",
      "side": "bottom",
      "offsetX": 39.33,
      "offsetY": 30,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Bus connection point. Polarity determined by component busPolarity assignment.",
      "terminalGroupId": "bus"
    },
    {
      "id": "terminal_7",
      "label": "T7",
      "side": "bottom",
      "offsetX": 59,
      "offsetY": 30,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Bus connection point. Polarity determined by component busPolarity assignment.",
      "terminalGroupId": "bus"
    }
  ],
  "terminalGroups": [
    {
      "id": "bus",
      "portId": "main",
      "label": "Bus",
      "groupType": "power_conductor",
      "internallyCommon": true,
      "maxCurrentA": 600,
      "notes": "All studs share one internal bus node. Polarity set per placed component (busPolarity)."
    }
  ],
  "ports": [
    {
      "id": "main",
      "kind": "generic",
      "topology": "bus",
      "label": "Main",
      "nominalVoltageV": 12,
      "maxCurrentA": 600,
      "role": "bus",
      "direction": "bidirectional"
    }
  ],
  "busbarRatings": {
    "currentRatingA": 600,
    "connectionCount": 7
  }
};

export default product;
