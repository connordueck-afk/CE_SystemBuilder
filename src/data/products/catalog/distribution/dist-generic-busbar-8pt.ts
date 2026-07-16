import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "dist-generic-busbar-8pt",
  "manufacturer": "Generic",
  "name": "Generic Busbar 8-point",
  "productType": "busbar",
  "category": "8 connection points",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "maxCurrentA": 600,
  "msrpUsd": 93,
  "oemPriceUsd": 65,
  "description": "Single-conductor DC busbar with 8 connection points. Set the bus assignment on the placed component.",
  "source": "Estimate",
  "dataQuality": "placeholder",
  "width": 172,
  "height": 80,
  "terminals": [
    {
      "id": "terminal_1",
      "label": "T1",
      "side": "bottom",
      "offsetX": -68,
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
      "offsetX": -48.57,
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
      "offsetX": -29.14,
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
      "offsetX": -9.71,
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
      "offsetX": 9.71,
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
      "offsetX": 29.14,
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
      "offsetX": 48.57,
      "offsetY": 30,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "notes": "Bus connection point. Polarity determined by component busPolarity assignment.",
      "terminalGroupId": "bus"
    },
    {
      "id": "terminal_8",
      "label": "T8",
      "side": "bottom",
      "offsetX": 68,
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
    "connectionCount": 8
  }
};

export default product;
