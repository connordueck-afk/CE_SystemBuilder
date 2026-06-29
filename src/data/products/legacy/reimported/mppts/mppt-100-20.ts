import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "mppt-100-20",
  "manufacturer": "Victron",
  "name": "SmartSolar MPPT 100/20",
  "productType": "mppt",
  "category": "Charging",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "maxCurrentA": 20,
  "maxPvVoltageV": 100,
  "maxPvCurrentA": 20,
  "continuousPowerW": 1160,
  "description": "Victron SmartSolar MPPT solar charge controller with Bluetooth",
  "source": "Victron 2025",
  "dataQuality": "complete",
  "imageUrl": "/product-images/victron/smartsolar_mppt_medium_screw_terminal.svg",
  "partNumber": "SCC110020160R",
  "productUrl": "https://www.cdnrg.com/products/vescc110020160r",
  "msrpUsd": 110,
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
      "maxCurrentA": 20,
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
      "maxCurrentA": 20,
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
      "maxCurrentA": 20,
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
      "maxCurrentA": 20,
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
    "maxPvVoltageV": 100,
    "maxPvCurrentA": 20,
    "maxOutputCurrentA": 20,
    "maxPvPowerW": 1160,
    "maxPvPowerByVoltageW": {
      "12": 290,
      "24": 580,
      "48": 1160
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
      "voltageMaxV": 100,
      "maxCurrentA": 20,
      "maxPowerW": 1160,
      "maxPowerByVoltageW": {
        "12": 290,
        "24": 580,
        "48": 1160
      },
      "requiresOvercurrentProtection": false
    },
    {
      "id": "dc_out",
      "kind": "dc",
      "topology": "two_pole",
      "label": "DC Output",
      "maxCurrentA": 20,
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
