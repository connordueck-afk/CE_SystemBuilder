import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "solar-combiner-6-string",
  "manufacturer": "Generic",
  "name": "Solar Combiner 6-string",
  "productType": "solar_combiner",
  "category": "6 strings",
  "maxPvVoltageV": 150,
  "maxPvCurrentA": 90,
  "msrpUsd": 233,
  "oemPriceUsd": 163,
  "description": "PV combiner box for 6 solar strings with combined positive and negative outputs.",
  "source": "Estimate",
  "dataQuality": "placeholder",
  "width": 140,
  "height": 100,
  "terminalGroups": [
    {
      "id": "positive_bus",
      "portId": "positive_bus",
      "label": "Positive Bus",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": true,
      "maxCurrentA": 90,
      "maxVoltageV": 150
    },
    {
      "id": "negative_bus",
      "portId": "negative_bus",
      "label": "Negative Bus",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": true,
      "maxCurrentA": 90,
      "maxVoltageV": 150
    }
  ],
  "terminals": [
    {
      "id": "string_1_pos",
      "terminalGroupId": "positive_bus",
      "label": "S1+",
      "side": "left",
      "offsetX": -70,
      "offsetY": -33,
      "connector": {
        "kind": "mc4",
        "gender": "female"
      },
      "notes": "String 1 positive input."
    },
    {
      "id": "string_1_neg",
      "terminalGroupId": "negative_bus",
      "label": "S1-",
      "side": "left",
      "offsetX": -70,
      "offsetY": -27,
      "connector": {
        "kind": "mc4",
        "gender": "male"
      },
      "notes": "String 1 negative input."
    },
    {
      "id": "string_2_pos",
      "terminalGroupId": "positive_bus",
      "label": "S2+",
      "side": "left",
      "offsetX": -70,
      "offsetY": -21,
      "connector": {
        "kind": "mc4",
        "gender": "female"
      },
      "notes": "String 2 positive input."
    },
    {
      "id": "string_2_neg",
      "terminalGroupId": "negative_bus",
      "label": "S2-",
      "side": "left",
      "offsetX": -70,
      "offsetY": -15,
      "connector": {
        "kind": "mc4",
        "gender": "male"
      },
      "notes": "String 2 negative input."
    },
    {
      "id": "string_3_pos",
      "terminalGroupId": "positive_bus",
      "label": "S3+",
      "side": "left",
      "offsetX": -70,
      "offsetY": -9,
      "connector": {
        "kind": "mc4",
        "gender": "female"
      },
      "notes": "String 3 positive input."
    },
    {
      "id": "string_3_neg",
      "terminalGroupId": "negative_bus",
      "label": "S3-",
      "side": "left",
      "offsetX": -70,
      "offsetY": -3,
      "connector": {
        "kind": "mc4",
        "gender": "male"
      },
      "notes": "String 3 negative input."
    },
    {
      "id": "string_4_pos",
      "terminalGroupId": "positive_bus",
      "label": "S4+",
      "side": "left",
      "offsetX": -70,
      "offsetY": 3,
      "connector": {
        "kind": "mc4",
        "gender": "female"
      },
      "notes": "String 4 positive input."
    },
    {
      "id": "string_4_neg",
      "terminalGroupId": "negative_bus",
      "label": "S4-",
      "side": "left",
      "offsetX": -70,
      "offsetY": 9,
      "connector": {
        "kind": "mc4",
        "gender": "male"
      },
      "notes": "String 4 negative input."
    },
    {
      "id": "string_5_pos",
      "terminalGroupId": "positive_bus",
      "label": "S5+",
      "side": "left",
      "offsetX": -70,
      "offsetY": 15,
      "connector": {
        "kind": "mc4",
        "gender": "female"
      },
      "notes": "String 5 positive input."
    },
    {
      "id": "string_5_neg",
      "terminalGroupId": "negative_bus",
      "label": "S5-",
      "side": "left",
      "offsetX": -70,
      "offsetY": 21,
      "connector": {
        "kind": "mc4",
        "gender": "male"
      },
      "notes": "String 5 negative input."
    },
    {
      "id": "string_6_pos",
      "terminalGroupId": "positive_bus",
      "label": "S6+",
      "side": "left",
      "offsetX": -70,
      "offsetY": 27,
      "connector": {
        "kind": "mc4",
        "gender": "female"
      },
      "notes": "String 6 positive input."
    },
    {
      "id": "string_6_neg",
      "terminalGroupId": "negative_bus",
      "label": "S6-",
      "side": "left",
      "offsetX": -70,
      "offsetY": 33,
      "connector": {
        "kind": "mc4",
        "gender": "male"
      },
      "notes": "String 6 negative input."
    },
    {
      "id": "out_pos",
      "terminalGroupId": "positive_bus",
      "label": "Out+",
      "side": "right",
      "offsetX": 70,
      "offsetY": -10,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "Combined PV positive output to MPPT."
    },
    {
      "id": "out_neg",
      "terminalGroupId": "negative_bus",
      "label": "Out-",
      "side": "right",
      "offsetX": 70,
      "offsetY": 10,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "Combined PV negative output to MPPT."
    }
  ],
  "solarCombinerRatings": {
    "stringCount": 6,
    "inputCount": 12,
    "outputCount": 2,
    "maxVoltageV": 150,
    "maxCurrentA": 90,
    "includedProtection": "None (add fuses per string as needed)"
  },
  "ports": [
    {
      "id": "positive_bus",
      "kind": "pv",
      "topology": "bus",
      "label": "PV Positive Bus",
      "voltageClass": "pv_high_voltage",
      "voltageMaxV": 150,
      "maxCurrentA": 90,
      "role": "bus",
      "direction": "bidirectional"
    },
    {
      "id": "negative_bus",
      "kind": "pv",
      "topology": "bus",
      "label": "PV Negative Bus",
      "voltageClass": "pv_high_voltage",
      "voltageMaxV": 150,
      "maxCurrentA": 90,
      "role": "bus",
      "direction": "bidirectional"
    }
  ]
};

export default product;
