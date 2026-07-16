import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "breaker-blue-sea-285-surface",
  "manufacturer": "Blue Sea Systems",
  "name": "285-Series Surface Mount Circuit Breaker",
  "productType": "breaker",
  "category": "Mobile DC Breaker",
  "description": "Single-pole, weather-resistant, ignition-protected Type III manual-reset breaker for marine and mobile DC systems.",
  "source": "Blue Sea Systems 285-Series product specifications",
  "productUrl": "https://www.bluesea.com/products/7180",
  "dataQuality": "partial",
  "imageUrl": "/product-images/generic-breaker.svg",
  "width": 80,
  "height": 64,
  "terminalGroups": [
    {
      "id": "in",
      "portId": "main",
      "label": "Line",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false
    },
    {
      "id": "out",
      "portId": "main",
      "label": "Load",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false
    }
  ],
  "terminals": [
    {
      "id": "in",
      "terminalGroupId": "in",
      "label": "Line",
      "connector": {
        "kind": "stud",
        "holeSize": "M6"
      },
      "side": "left",
      "offsetX": -40,
      "offsetY": 0
    },
    {
      "id": "out",
      "terminalGroupId": "out",
      "label": "Load",
      "connector": {
        "kind": "stud",
        "holeSize": "M6"
      },
      "side": "right",
      "offsetX": 40,
      "offsetY": 0
    }
  ],
  "protectionRatings": {
    "currentRatingA": 0,
    "voltageRatingV": 48,
    "interruptRatingA": 3000,
    "breakerStyle": "Blue Sea 285 Surface Mount",
    "protectionType": "breaker"
  },
  "breakerDefinition": {
    "poleCount": 1,
    "tripLinkage": "independent",
    "poles": [
      {
        "id": "pole1",
        "inputTerminalGroupId": "in",
        "outputTerminalGroupId": "out"
      }
    ],
    "ratingProfiles": [
      {
        "id": "dc-48v-1p",
        "label": "48 VDC, 1 pole",
        "medium": "dc",
        "maxVoltageV": 48,
        "interruptRatingA": 3000,
        "polesRequired": 1,
        "wiring": "independent_conductors"
      }
    ],
    "mounting": "surface",
    "applicationTags": [
      "mobile",
      "marine",
      "rv"
    ],
    "resetType": "manual_reset"
  },
  "variants": [
    {
      "id": "breaker-blue-sea-285-25a",
      "name": "Blue Sea 285-Series 25A Surface Mount Breaker",
      "currentRatingA": 25,
      "partNumber": "7180",
      "productUrl": "https://www.bluesea.com/products/7180"
    },
    {
      "id": "breaker-blue-sea-285-30a",
      "name": "Blue Sea 285-Series 30A Surface Mount Breaker",
      "currentRatingA": 30,
      "partNumber": "7181",
      "productUrl": "https://www.bluesea.com/products/7181"
    },
    {
      "id": "breaker-blue-sea-285-40a",
      "name": "Blue Sea 285-Series 40A Surface Mount Breaker",
      "currentRatingA": 40,
      "partNumber": "7182",
      "productUrl": "https://www.bluesea.com/products/7182"
    },
    {
      "id": "breaker-blue-sea-285-50a",
      "name": "Blue Sea 285-Series 50A Surface Mount Breaker",
      "currentRatingA": 50,
      "partNumber": "7183",
      "productUrl": "https://www.bluesea.com/products/7183"
    },
    {
      "id": "breaker-blue-sea-285-60a",
      "name": "Blue Sea 285-Series 60A Surface Mount Breaker",
      "currentRatingA": 60,
      "partNumber": "7184",
      "productUrl": "https://www.bluesea.com/products/7184"
    },
    {
      "id": "breaker-blue-sea-285-70a",
      "name": "Blue Sea 285-Series 70A Surface Mount Breaker",
      "currentRatingA": 70,
      "partNumber": "7185",
      "productUrl": "https://www.bluesea.com/products/7185"
    },
    {
      "id": "breaker-blue-sea-285-80a",
      "name": "Blue Sea 285-Series 80A Surface Mount Breaker",
      "currentRatingA": 80,
      "partNumber": "7186",
      "productUrl": "https://www.bluesea.com/products/7186"
    },
    {
      "id": "breaker-blue-sea-285-100a",
      "name": "Blue Sea 285-Series 100A Surface Mount Breaker",
      "currentRatingA": 100,
      "partNumber": "7187",
      "productUrl": "https://www.bluesea.com/products/7187"
    },
    {
      "id": "breaker-blue-sea-285-120a",
      "name": "Blue Sea 285-Series 120A Surface Mount Breaker",
      "currentRatingA": 120,
      "partNumber": "7188",
      "productUrl": "https://www.bluesea.com/products/7188"
    },
    {
      "id": "breaker-blue-sea-285-150a",
      "name": "Blue Sea 285-Series 150A Surface Mount Breaker",
      "currentRatingA": 150,
      "partNumber": "7189",
      "productUrl": "https://www.bluesea.com/products/7189"
    }
  ],
  "ports": [
    {
      "id": "main",
      "kind": "dc",
      "topology": "pass_through",
      "role": "pass_through",
      "direction": "bidirectional",
      "label": "Protected DC conductor",
      "voltageClass": "dc_low_voltage",
      "maxCurrentA": 0,
      "voltageMaxV": 48
    }
  ]
};

export default product;
