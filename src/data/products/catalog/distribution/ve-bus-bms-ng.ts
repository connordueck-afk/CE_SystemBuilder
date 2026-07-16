import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "ve-bus-bms-ng",
  "manufacturer": "Victron",
  "name": "VE.Bus BMS NG",
  "productType": "dc_distribution",
  "category": "Distribution",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "msrpUsd": 260,
  "description": "Victron VE.Bus BMS NG - battery management system for Victron Lithium NG batteries. VE.Bus / Bluetooth.",
  "partNumber": "VE.Bus BMS NG",
  "imageUrl": "/product-images/victron/ve_bus_bms_ng.svg",
  "source": "Victron 2025",
  "notes": "Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.",
  "dataQuality": "partial",
  "width": 116,
  "height": 96,
  "terminals": [
    {
      "id": "bat_pos",
      "label": "Bat+",
      "side": "left",
      "offsetX": -54,
      "offsetY": 0,
      "terminalGroupId": "bat_pos_sense",
      "connector": {
        "kind": "comm"
      },
      "maxCurrentA": 1,
      "notes": "Low-current battery positive sense/control reference."
    },
    {
      "id": "signal",
      "label": "VE.Bus",
      "side": "right",
      "offsetX": 54,
      "offsetY": 0,
      "terminalGroupId": "ve_bus_iface",
      "connector": {
        "kind": "comm"
      },
      "connectorType": "RJ45"
    }
  ],
  "terminalGroups": [
    {
      "id": "bat_pos_sense",
      "portId": "dc_sense",
      "label": "Battery Positive Sense",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": false,
      "maxCurrentA": 1
    },
    {
      "id": "ve_bus_iface",
      "portId": "ve_bus",
      "label": "VE.Bus Interface",
      "groupType": "communication_interface",
      "internallyCommon": false
    }
  ],
  "ports": [
    {
      "id": "dc_sense",
      "kind": "dc",
      "topology": "bus",
      "label": "Battery Sense",
      "voltageClass": "dc_low_voltage",
      "nominalVoltageV": 12,
      "maxCurrentA": 1,
      "role": "sense",
      "direction": "input"
    },
    {
      "id": "ve_bus",
      "kind": "comm",
      "topology": "two_pole",
      "label": "VE.Bus",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "VE.Bus"
      ],
      "configuredProtocol": "VE.Bus"
    }
  ]
};

export default product;
