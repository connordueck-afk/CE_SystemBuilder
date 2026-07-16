import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "bat-vic-smart-12-200",
  "manufacturer": "Victron",
  "name": "SmartLithium 12.8V/200Ah",
  "productType": "battery",
  "category": "Batteries",
  "nominalVoltage": 12,
  "capacityWh": 2560,
  "maxCurrentA": 300,
  "msrpUsd": 2199,
  "oemPriceUsd": 1539,
  "description": "Victron SmartLithium 12.8V 200Ah LiFePO4 battery with integrated BMS",
  "partNumber": "BAT512120410",
  "productUrl": "https://www.victronenergy.com/batteries/lithium-battery-12-8v",
  "source": "Victron 2024",
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
      "maxCurrentA": 300,
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
      "maxCurrentA": 300,
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
      "nominalVoltageV": 12.8,
      "voltageClass": "dc_low_voltage",
      "maxCurrentA": 300,
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
      "maxCurrentA": 300,
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
      "maxCurrentA": 300,
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
    "nominalVoltageV": 12.8,
    "capacityAh": 200,
    "capacityWh": 2560,
    "capacityKwh": 2.56,
    "maxChargeCurrentA": 200,
    "maxDischargeCurrentA": 300,
    "peakDischargeCurrentA": 600,
    "chargeVoltageV": 14.2,
    "cutoffVoltageV": 10,
    "chemistry": "LiFePO4",
    "communicationInterfaces": [
      "VE.Bus",
      "CANbus"
    ],
    "hasInternalBms": true,
    "seriesAllowed": false,
    "parallelAllowed": true
  }
};

export default product;
