import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "mppt-150-35",
  "manufacturer": "Victron",
  "name": "SmartSolar MPPT 150/35",
  "productType": "mppt",
  "category": "Charging",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "maxCurrentA": 35,
  "maxPvVoltageV": 150,
  "maxPvCurrentA": 35,
  "continuousPowerW": 2000,
  "description": "Victron SmartSolar MPPT solar charge controller with Bluetooth",
  "source": "Victron 2025",
  "dataQuality": "complete",
  "imageUrl": "/product-images/victron/smartsolar_mppt_large_mc4.svg",
  "partNumber": "SCC115035210",
  "productUrl": "https://www.cdnrg.com/products/vescc115035210",
  "msrpUsd": 226,
  "width": 80,
  "height": 112,
  "terminals": [
    {
      "id": "pv_neg",
      "label": "PV-",
      "polarity": "negative",
      "role": "sink",
      "direction": "input",
      "voltageClass": "pv_high_voltage",
      "side": "bottom",
      "offsetX": -28,
      "offsetY": 38,
      "maxCurrentA": 35,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "PV array negative input.",
      "portId": "pv"
    },
    {
      "id": "pv_pos",
      "label": "PV+",
      "polarity": "positive",
      "role": "sink",
      "direction": "input",
      "voltageClass": "pv_high_voltage",
      "side": "bottom",
      "offsetX": -9,
      "offsetY": 38,
      "maxCurrentA": 35,
      "requiresOvercurrentProtection": false,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "PV array positive input. Do not connect negative PV conductor to chassis.",
      "portId": "pv"
    },
    {
      "id": "bat_pos",
      "label": "BAT+",
      "polarity": "positive",
      "role": "source",
      "direction": "output",
      "voltageClass": "dc_low_voltage",
      "side": "bottom",
      "offsetX": 9,
      "offsetY": 38,
      "maxCurrentA": 35,
      "requiresOvercurrentProtection": true,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "Battery positive terminal. Requires fuse on positive conductor between MPPT and busbar.",
      "portId": "dc_out"
    },
    {
      "id": "bat_neg",
      "label": "BAT-",
      "polarity": "negative",
      "role": "source",
      "direction": "output",
      "voltageClass": "dc_low_voltage",
      "side": "bottom",
      "offsetX": 28,
      "offsetY": 38,
      "maxCurrentA": 35,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "Battery negative terminal.",
      "portId": "dc_out"
    },
    {
      "id": "ve_direct",
      "label": "VE.Direct",
      "role": "bidirectional",
      "side": "top",
      "offsetX": 0,
      "offsetY": -56,
      "portId": "ve_direct"
    }
  ],
  "mpptRatings": {
    "batteryVoltagesV": [
      12,
      24,
      48
    ],
    "maxPvVoltageV": 150,
    "maxPvCurrentA": 35,
    "maxOutputCurrentA": 35,
    "maxPvPowerW": 2000,
    "maxPvPowerByVoltageW": {
      "12": 500,
      "24": 1000,
      "48": 2000
    },
    "efficiencyPct": 98
  },
  "communicationPorts": [
    {
      "id": "ve_direct",
      "name": "VE.Direct",
      "connectorType": "VE.Direct",
      "supportedProtocols": [
        "VE.Direct"
      ],
      "configuredProtocol": "VE.Direct"
    }
  ],
  "ports": [
    {
      "id": "pv",
      "kind": "pv",
      "topology": "two_pole",
      "label": "PV",
      "voltageMaxV": 150,
      "maxCurrentA": 35,
      "maxPowerW": 2000,
      "maxPowerByVoltageW": {
        "12": 500,
        "24": 1000,
        "48": 2000
      },
      "requiresOvercurrentProtection": false
    },
    {
      "id": "dc_out",
      "kind": "dc",
      "topology": "two_pole",
      "label": "DC Output",
      "maxCurrentA": 35,
      "requiresOvercurrentProtection": true
    },
    {
      "id": "ve_direct",
      "kind": "comm",
      "label": "VE.Direct",
      "topology": "two_pole"
    }
  ]
};

export default product;
