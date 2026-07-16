import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "smartshunt-1000",
  "manufacturer": "Victron",
  "name": "SmartShunt 1000A/50mV",
  "productType": "monitor",
  "imageUrl": "/product-images/victron/smartshunt.svg",
  "category": "Monitoring",
  "maxCurrentA": 1000,
  "msrpUsd": 203,
  "description": "Victron SmartShunt 1000A Bluetooth battery monitor with integrated 1000A/50mV shunt.",
  "partNumber": "SHU050210050",
  "source": "Victron 2025",
  "dataQuality": "partial",
  "notes": "Simplified as a 1000A negative-leg pass-through shunt with VE.Direct communication.",
  "width": 130,
  "height": 50,
  "terminalGroups": [
    {
      "id": "shunt_batt_side",
      "portId": "main",
      "label": "Battery Minus",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": false,
      "maxCurrentA": 1000
    },
    {
      "id": "shunt_bus_side",
      "portId": "main",
      "label": "System Minus",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": false,
      "maxCurrentA": 1000
    },
    {
      "id": "ve_direct_iface",
      "portId": "ve_direct",
      "label": "VE.Direct Interface",
      "groupType": "communication_interface",
      "internallyCommon": false
    }
  ],
  "terminals": [
    {
      "id": "shunt_pos",
      "terminalGroupId": "shunt_batt_side",
      "label": "BATT-",
      "side": "top",
      "offsetX": -31,
      "offsetY": -23,
      "maxCurrentA": 1000,
      "connector": {
        "kind": "stud",
        "holeSize": "M10"
      },
      "notes": "Battery negative side of the 1000A shunt."
    },
    {
      "id": "shunt_neg",
      "terminalGroupId": "shunt_bus_side",
      "label": "SYS-",
      "side": "top",
      "offsetX": 31,
      "offsetY": -23,
      "maxCurrentA": 1000,
      "connector": {
        "kind": "stud",
        "holeSize": "M10"
      },
      "notes": "System/load negative side of the 1000A shunt."
    },
    {
      "id": "ve_direct",
      "terminalGroupId": "ve_direct_iface",
      "label": "VE.Direct",
      "side": "bottom",
      "offsetX": -34,
      "offsetY": 18,
      "connector": {
        "kind": "comm",
        "holeSize": "VE.Direct"
      },
      "connectorType": "VE.Direct"
    }
  ],
  "ports": [
    {
      "id": "main",
      "kind": "dc",
      "topology": "pass_through",
      "label": "Main",
      "voltageClass": "dc_low_voltage",
      "maxCurrentA": 1000,
      "role": "pass_through",
      "direction": "bidirectional"
    },
    {
      "id": "ve_direct",
      "kind": "comm",
      "label": "VE.Direct",
      "topology": "pass_through",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "VE.Direct"
      ],
      "configuredProtocol": "VE.Direct"
    }
  ]
};

export default product;
