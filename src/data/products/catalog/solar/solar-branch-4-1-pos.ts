import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "solar-branch-4-1-pos",
  "manufacturer": "Generic",
  "name": "4-1 PV Branch Connector (Positive)",
  "productType": "solar_combiner",
  "category": "Connectors",
  "imageUrl": "/product-images/pv-branch-4-1-pos.svg",
  "maxPvVoltageV": 1000,
  "maxPvCurrentA": 60,
  "msrpUsd": 42,
  "oemPriceUsd": 29,
  "description": "4-to-1 PV branch connector, multi-male to single-female. Combines 4 same-polarity solar conductors. Wired for either PV+ or PV- depending on where it's placed in the string.",
  "source": "Estimate",
  "dataQuality": "placeholder",
  "width": 103,
  "height": 120,
  "terminalGroups": [
    {
      "id": "bus",
      "portId": "main",
      "label": "PV Branch Bus",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": true,
      "maxCurrentA": 60,
      "maxVoltageV": 1000
    }
  ],
  "terminals": [
    {
      "id": "in_1",
      "terminalGroupId": "bus",
      "label": "In 1+",
      "side": "top",
      "offsetX": -40,
      "offsetY": -59,
      "connector": {
        "kind": "mc4",
        "gender": "male"
      },
      "notes": "PV branch input 1. Polarity is selected on the component."
    },
    {
      "id": "in_2",
      "terminalGroupId": "bus",
      "label": "In 2+",
      "side": "top",
      "offsetX": -13,
      "offsetY": -59,
      "connector": {
        "kind": "mc4",
        "gender": "male"
      },
      "notes": "PV branch input 2. Polarity is selected on the component."
    },
    {
      "id": "in_3",
      "terminalGroupId": "bus",
      "label": "In 3+",
      "side": "top",
      "offsetX": 13,
      "offsetY": -59,
      "connector": {
        "kind": "mc4",
        "gender": "male"
      },
      "notes": "PV branch input 3. Polarity is selected on the component."
    },
    {
      "id": "in_4",
      "terminalGroupId": "bus",
      "label": "In 4+",
      "side": "top",
      "offsetX": 40,
      "offsetY": -59,
      "connector": {
        "kind": "mc4",
        "gender": "male"
      },
      "notes": "PV branch input 4. Polarity is selected on the component."
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
        "gender": "female"
      },
      "notes": "Combined PV branch output. Polarity is selected on the component."
    }
  ],
  "solarCombinerRatings": {
    "stringCount": 4,
    "inputCount": 4,
    "outputCount": 1,
    "maxVoltageV": 1000,
    "maxCurrentA": 60,
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
      "maxCurrentA": 60,
      "role": "bus",
      "direction": "bidirectional"
    }
  ]
};

export default product;
