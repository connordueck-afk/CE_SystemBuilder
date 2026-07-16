import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "discover-aes-rackmount-48-42-5120",
  "manufacturer": "Discover Battery",
  "name": "AES Rackmount 51.2V/100Ah",
  "productType": "battery",
  "category": "Batteries",
  "nominalVoltage": 48,
  "capacityWh": 5120,
  "maxCurrentA": 100,
  "msrpUsd": 3400,
  "description": "Discover AES Rackmount LiFePO4 battery 51.2V/100Ah with CAN/RS485 communication. Confirm communication profile and closed-loop compatibility per inverter setup.",
  "partNumber": "48-42-5120",
  "productUrl": "https://www.cdnrg.com/products/48-48-5120-h",
  "source": "Discover Battery 2025",
  "notes": "Placeholder pricing/specs. Confirm communication profile and closed-loop compatibility per inverter setup.",
  "dataQuality": "partial",
  "width": 291,
  "height": 102,
  "terminals": [
    {
      "id": "dc_pos",
      "label": "+",
      "side": "top",
      "offsetX": -116,
      "offsetY": 17,
      "maxCurrentA": 100,
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
      "offsetX": -116,
      "offsetY": -18,
      "maxCurrentA": 100,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "terminalGroupId": "dc_neg",
      "notes": "DC negative terminal."
    },
    {
      "id": "LYNK_2",
      "label": "LYNK",
      "side": "top",
      "offsetX": 91,
      "offsetY": 25,
      "terminalGroupId": "lynk_group",
      "connectorType": "RJ45",
      "gender": "female",
      "maxConnections": 1
    },
    {
      "id": "LYNK_1",
      "label": "LYNK",
      "side": "top",
      "offsetX": 102,
      "offsetY": 25,
      "terminalGroupId": "lynk_group",
      "gender": "female",
      "maxConnections": 1
    }
  ],
  "ports": [
    {
      "id": "dc",
      "kind": "dc",
      "topology": "two_pole",
      "label": "DC",
      "nominalVoltageV": 51.2,
      "voltageClass": "dc_low_voltage",
      "maxCurrentA": 100,
      "role": "bidirectional",
      "direction": "bidirectional"
    },
    {
      "id": "lynk_port",
      "label": "LYNK",
      "kind": "comm",
      "topology": "two_pole",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "AEbus"
      ],
      "configuredProtocol": "AEbus"
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
      "maxCurrentA": 100,
      "requiresOvercurrentProtection": true,
      "notes": "Battery positive conductor group."
    },
    {
      "id": "dc_neg",
      "portId": "dc",
      "label": "DC Negative",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": true,
      "maxCurrentA": 100,
      "notes": "Battery negative conductor group."
    },
    {
      "id": "lynk_group",
      "portId": "lynk_port",
      "groupType": "communication_interface",
      "internallyCommon": false
    }
  ],
  "batteryRatings": {
    "nominalVoltageV": 51.2,
    "capacityAh": 100,
    "capacityWh": 5120,
    "capacityKwh": 5.12,
    "maxDischargeCurrentA": 100,
    "chemistry": "LiFePO4",
    "communicationInterfaces": [
      "CAN",
      "RS485"
    ],
    "hasInternalBms": true,
    "seriesAllowed": false,
    "parallelAllowed": true
  },
  "imageUrl": "/product-images/DES_Rackmount.svg"
};

export default product;
