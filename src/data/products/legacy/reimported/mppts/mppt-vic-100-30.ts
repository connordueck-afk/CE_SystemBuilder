import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "mppt-vic-100-30",
  "manufacturer": "Victron",
  "name": "SmartSolar MPPT 100/30 TR",
  "productType": "mppt",
  "category": "Charging",
  "nominalVoltage": [
    12,
    24
  ],
  "maxCurrentA": 30,
  "maxPvVoltageV": 100,
  "maxPvCurrentA": 35,
  "continuousPowerW": 880,
  "description": "Victron SmartSolar MPPT TR solar charge controller with TR-type connectors and Bluetooth",
  "source": "Victron 2024",
  "dataQuality": "complete",
  "imageUrl": "/product-images/victron/smartsolar_mppt_large_tr.svg",
  "partNumber": "SCC110030210",
  "productUrl": "https://www.cdnrg.com/products/vescc110030210",
  "msrpUsd": 199,
  "oemPriceUsd": 139,
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
      "maxCurrentA": 30,
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
      "maxCurrentA": 30,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "Battery negative terminal.",
      "portId": "dc_out"
    },
    {
      "id": "ve_can",
      "label": "VE.Can",
      "role": "bidirectional",
      "side": "top",
      "offsetX": -40,
      "offsetY": -56,
      "portId": "ve_can"
    },
    {
      "id": "ve_direct",
      "label": "VE.Direct",
      "role": "bidirectional",
      "side": "top",
      "offsetX": 40,
      "offsetY": -56,
      "portId": "ve_direct"
    }
  ],
  "mpptRatings": {
    "batteryVoltagesV": [
      12,
      24
    ],
    "maxPvVoltageV": 100,
    "maxPvCurrentA": 35,
    "maxOutputCurrentA": 30,
    "maxPvPowerW": 880,
    "maxPvPowerByVoltageW": {
      "12": 440,
      "24": 880
    },
    "efficiencyPct": 98
  },
  "communicationPorts": [
    {
      "id": "ve_can",
      "name": "VE.Can",
      "connectorType": "RJ45",
      "supportedProtocols": [
        "VE.Can"
      ],
      "configuredProtocol": "VE.Can"
    },
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
      "maxCurrentA": 35,
      "maxPowerW": 880,
      "maxPowerByVoltageW": {
        "12": 440,
        "24": 880
      },
      "requiresOvercurrentProtection": false
    },
    {
      "id": "dc_out",
      "kind": "dc",
      "topology": "two_pole",
      "label": "DC Output",
      "maxCurrentA": 30,
      "requiresOvercurrentProtection": true
    },
    {
      "id": "ve_can",
      "kind": "comm",
      "label": "VE.Can",
      "topology": "two_pole"
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
