import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "discover-aes-lithium-12-200",
  "manufacturer": "Discover Battery",
  "name": "AES-B LiFePO4 12.8V/200Ah",
  "productType": "battery",
  "category": "Batteries",
  "nominalVoltage": 12,
  "capacityWh": 2560,
  "maxCurrentA": 200,
  "msrpUsd": 1495,
  "description": "Discover AES-B LiFePO4 battery 12.8V/200Ah",
  "partNumber": "AES-B-GC2-12V-H",
  "productUrl": "https://www.cdnrg.com/products/aes-b-gc12-12v-h",
  "source": "Discover Battery 2025",
  "notes": "Placeholder pricing/specs.",
  "dataQuality": "partial",
  "width": 112,
  "height": 98,
  "terminals": [
    {
      "id": "dc_pos",
      "label": "+",
      "side": "top",
      "offsetX": 44,
      "offsetY": -47,
      "maxCurrentA": 200,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "terminalGroupId": "dc_pos",
      "notes": "DC positive terminal. Requires overcurrent protection (fuse/breaker) on the positive conductor."
    },
    {
      "id": "dc_neg",
      "label": "-",
      "side": "top",
      "offsetX": -44,
      "offsetY": -47,
      "maxCurrentA": 200,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "terminalGroupId": "dc_neg",
      "notes": "DC negative terminal."
    }
  ],
  "ports": [
    {
      "id": "dc",
      "kind": "dc",
      "topology": "two_pole",
      "label": "DC",
      "nominalVoltageV": 12.8,
      "voltageClass": "dc_low_voltage",
      "maxCurrentA": 200,
      "role": "bidirectional",
      "direction": "bidirectional"
    }
  ],
  "terminalGroups": [
    {
      "id": "dc_pos",
      "portId": "dc",
      "label": "DC Positive",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": true,
      "maxCurrentA": 200,
      "requiresOvercurrentProtection": true,
      "integratedProtection": {
        "protectionType": "fuse",
        "currentRatingA": 200,
        "label": "Integrated DC+ fuse",
        "notes": "Built into the battery positive post; no separate source fuse is required when the conductor is sized for this protection."
      },
      "notes": "Battery positive conductor group."
    },
    {
      "id": "dc_neg",
      "portId": "dc",
      "label": "DC Negative",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": true,
      "maxCurrentA": 200,
      "notes": "Battery negative conductor group."
    }
  ],
  "batteryRatings": {
    "nominalVoltageV": 12.8,
    "capacityAh": 200,
    "capacityWh": 2560,
    "capacityKwh": 2.56,
    "maxDischargeCurrentA": 200,
    "chemistry": "LiFePO4",
    "hasInternalBms": true,
    "seriesAllowed": false,
    "parallelAllowed": true
  }
};

export default product;
