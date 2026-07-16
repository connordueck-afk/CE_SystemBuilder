import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "solar-branch-2-1-neg",
  "manufacturer": "Generic",
  "name": "2-1 PV Branch Connector (Negative)",
  "productType": "solar_combiner",
  "category": "Connectors",
  "imageUrl": "/product-images/pv-branch-2-1-neg.svg",
  "maxPvVoltageV": 1000,
  "maxPvCurrentA": 30,
  "msrpUsd": 30,
  "oemPriceUsd": 21,
  "description": "2-to-1 PV branch connector, multi-female to single-male. Combines 2 same-polarity solar conductors. Wired for either PV+ or PV- depending on where it's placed in the string.",
  "source": "Estimate",
  "dataQuality": "placeholder",
  "width": 50,
  "height": 120,
  "terminalGroups": [
    {
      "id": "bus",
      "portId": "main",
      "label": "PV Branch Bus",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": true,
      "maxCurrentA": 30,
      "maxVoltageV": 1000
    }
  ],
  "terminals": [
    {
      "id": "in_1",
      "terminalGroupId": "bus",
      "label": "In 1+",
      "side": "top",
      "offsetX": -13,
      "offsetY": -59,
      "connector": {
        "kind": "mc4",
        "gender": "female"
      },
      "notes": "PV branch input 1. Polarity is selected on the component."
    },
    {
      "id": "in_2",
      "terminalGroupId": "bus",
      "label": "In 2+",
      "side": "top",
      "offsetX": 13,
      "offsetY": -59,
      "connector": {
        "kind": "mc4",
        "gender": "female"
      },
      "notes": "PV branch input 2. Polarity is selected on the component."
    },
    {
      "id": "out",
      "terminalGroupId": "bus",
      "label": "Out+",
      "side": "bottom",
      "offsetX": 0,
      "offsetY": 59,
      "connector": {
        "kind": "mc4",
        "gender": "male"
      },
      "notes": "Combined PV branch output. Polarity is selected on the component."
    }
  ],
  "solarCombinerRatings": {
    "stringCount": 2,
    "inputCount": 2,
    "outputCount": 1,
    "maxVoltageV": 1000,
    "maxCurrentA": 30,
    "includedProtection": "None (branch connector only)"
  },
  "ports": [
    {
      "id": "main",
      "kind": "pv",
      "topology": "bus",
      "label": "Main",
      "voltageClass": "pv_high_voltage",
      "voltageMaxV": 1000,
      "maxCurrentA": 30,
      "role": "bus",
      "direction": "bidirectional"
    }
  ]
};

export default product;
