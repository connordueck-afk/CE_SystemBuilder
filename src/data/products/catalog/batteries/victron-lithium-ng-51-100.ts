import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "victron-lithium-ng-51-100",
  "manufacturer": "Victron",
  "name": "Lithium Battery NG 51.2V/100Ah",
  "productType": "battery",
  "category": "Batteries",
  "nominalVoltage": 48,
  "capacityWh": 5120,
  "maxCurrentA": 200,
  "msrpUsd": 4200,
  "description": "Lithium NG battery 51.2V/100Ah - next-generation Victron lithium with VE.Bus BMS NG / Lynx Smart BMS NG integration",
  "partNumber": "BAT548110610",
  "source": "Victron 2025",
  "notes": "Placeholder pricing/specs.",
  "dataQuality": "partial",
  "width": 128,
  "height": 98,
  "terminals": [
    {
      "id": "dc_pos",
      "label": "+",
      "side": "top",
      "offsetX": 35,
      "offsetY": -45,
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
      "offsetX": -41,
      "offsetY": -45,
      "maxCurrentA": 200,
      "connector": {
        "kind": "stud",
        "holeSize": "M8"
      },
      "terminalGroupId": "dc_neg",
      "notes": "DC negative terminal."
    },
    {
      "id": "bms_can",
      "label": "BMS-Can",
      "side": "top",
      "offsetX": 0,
      "offsetY": -49,
      "terminalGroupId": "bms_can",
      "connector": {
        "kind": "comm"
      },
      "connectorType": "RJ45"
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
      "maxCurrentA": 200,
      "role": "bidirectional",
      "direction": "bidirectional"
    },
    {
      "id": "bms_can",
      "kind": "comm",
      "label": "BMS-Can",
      "topology": "two_pole",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "BMS-Can"
      ],
      "configuredProtocol": "BMS-Can"
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
    },
    {
      "id": "bms_can",
      "portId": "bms_can",
      "label": "BMS-Can",
      "groupType": "communication_interface",
      "internallyCommon": true
    }
  ],
  "batteryRatings": {
    "nominalVoltageV": 51.2,
    "capacityAh": 100,
    "capacityWh": 5120,
    "capacityKwh": 5.12,
    "maxDischargeCurrentA": 200,
    "chemistry": "LiFePO4",
    "communicationInterfaces": [
      "VE.Bus BMS NG",
      "Lynx Smart BMS NG"
    ],
    "hasInternalBms": true,
    "seriesAllowed": false,
    "parallelAllowed": true
  }
};

export default product;
