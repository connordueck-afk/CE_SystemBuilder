import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "vic-bluesolar-mppt-150-45",
  "manufacturer": "Victron",
  "name": "BlueSolar MPPT 150/45",
  "productType": "mppt",
  "category": "Charging",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "maxCurrentA": 45,
  "maxPvVoltageV": 150,
  "maxPvCurrentA": 45,
  "continuousPowerW": 2600,
  "description": "Victron BlueSolar MPPT solar charge controller",
  "source": "Victron 2025",
  "dataQuality": "partial",
  "imageUrl": "/product-images/victron/smartsolar_mppt_large_mc4.svg",
  "msrpUsd": 215,
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
      "maxCurrentA": 45,
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
      "maxCurrentA": 45,
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
      "maxCurrentA": 45,
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
      "maxCurrentA": 45,
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
    "maxPvCurrentA": 45,
    "maxOutputCurrentA": 45,
    "maxPvPowerW": 2600,
    "maxPvPowerByVoltageW": {
      "12": 650,
      "24": 1300,
      "48": 2600
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
      "maxCurrentA": 45,
      "maxPowerW": 2600,
      "maxPowerByVoltageW": {
        "12": 650,
        "24": 1300,
        "48": 2600
      },
      "requiresOvercurrentProtection": false
    },
    {
      "id": "dc_out",
      "kind": "dc",
      "topology": "two_pole",
      "label": "DC Output",
      "maxCurrentA": 45,
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
