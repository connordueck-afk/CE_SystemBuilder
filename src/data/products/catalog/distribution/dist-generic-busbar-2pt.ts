import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "dist-generic-busbar-2pt",
  "manufacturer": "Generic",
  "name": "Generic Busbar 2-point",
  "productType": "busbar",
  "category": "2 connection points",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "maxCurrentA": 400,
  "msrpUsd": 45,
  "oemPriceUsd": 31,
  "description": "Single-conductor DC busbar with 2 connection points. Set the bus assignment on the placed component.",
  "source": "Estimate",
  "dataQuality": "placeholder",
  "width": 140,
  "height": 80,
  "terminals": [
    {
      "id": "terminal_1",
      "label": "T1",
      "side": "bottom",
      "offsetX": -52,
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
      "offsetX": 52,
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
      "maxCurrentA": 400,
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
      "maxCurrentA": 400,
      "role": "bus",
      "direction": "bidirectional"
    }
  ],
  "busbarRatings": {
    "currentRatingA": 400,
    "connectionCount": 2
  }
};

export default product;
