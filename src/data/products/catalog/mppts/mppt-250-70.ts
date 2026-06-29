import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "mppt-250-70",
  "manufacturer": "Victron",
  "name": "SmartSolar MPPT 250/70",
  "productType": "mppt",
  "category": "Charging",
  "nominalVoltage": [
    12,
    24,
    48
  ],
  "maxCurrentA": 70,
  "maxPvVoltageV": 250,
  "maxPvCurrentA": 70,
  "continuousPowerW": 4000,
  "description": "Victron SmartSolar MPPT solar charge controller with Bluetooth",
  "source": "Victron 2025",
  "dataQuality": "complete",
  "imageUrl": "/product-images/victron/smartsolar_mppt_large_mc4.svg",
  "partNumber": "SCC125070421",
  "productUrl": "https://www.cdnrg.com/products/vescc125070421",
  "msrpUsd": 625,
  "width": 80,
  "height": 112,
  "terminalGroups": [
    {
      id: "pv_neg",
      portId: "pv",
      label: "PV-",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 70
    },
    {
      id: "pv_pos",
      portId: "pv",
      label: "PV+",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 70
    },
    {
      id: "bat_pos",
      portId: "dc_out",
      label: "BAT+",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 70,
      requiresOvercurrentProtection: true
    },
    {
      id: "bat_neg",
      portId: "dc_out",
      label: "BAT-",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 70
    },
    {
      id: "ve_can",
      portId: "ve_can",
      label: "VE.Can",
      groupType: "communication_interface",
      internallyCommon: false
    },
    {
      id: "ve_direct",
      portId: "ve_direct",
      label: "VE.Direct",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  "terminals": [
    {
      "id": "pv_neg",
      "terminalGroupId": "pv_neg",
      "label": "PV-",
      "side": "bottom",
      "offsetX": -28,
      "offsetY": 38,
      "maxCurrentA": 70,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "PV array negative input.",
    },
    {
      "id": "pv_pos",
      "terminalGroupId": "pv_pos",
      "label": "PV+",
      "side": "bottom",
      "offsetX": -9,
      "offsetY": 38,
      "maxCurrentA": 70,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "PV array positive input. Do not connect negative PV conductor to chassis.",
    },
    {
      "id": "bat_pos",
      "terminalGroupId": "bat_pos",
      "label": "BAT+",
      "side": "bottom",
      "offsetX": 9,
      "offsetY": 38,
      "maxCurrentA": 70,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "Battery positive terminal. Requires fuse on positive conductor between MPPT and busbar.",
    },
    {
      "id": "bat_neg",
      "terminalGroupId": "bat_neg",
      "label": "BAT-",
      "side": "bottom",
      "offsetX": 28,
      "offsetY": 38,
      "maxCurrentA": 70,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "Battery negative terminal.",
    },
    {
      "id": "ve_can",
      "terminalGroupId": "ve_can",
      "label": "VE.Can",
      "side": "top",
      "offsetX": -40,
      "offsetY": -56,
    },
    {
      "id": "ve_direct",
      "terminalGroupId": "ve_direct",
      "label": "VE.Direct",
      "side": "top",
      "offsetX": 40,
      "offsetY": -56,
    }
  ],
  "mpptRatings": {
    "batteryVoltagesV": [
      12,
      24,
      48
    ],
    "maxPvVoltageV": 250,
    "maxPvCurrentA": 70,
    "maxOutputCurrentA": 70,
    "maxPvPowerW": 4000,
    "maxPvPowerByVoltageW": {
      "12": 1000,
      "24": 2000,
      "48": 4000
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
      "role": "sink",
      "direction": "input",
      "label": "PV",
      "voltageClass": "pv_high_voltage",
      "voltageMaxV": 250,
      "maxCurrentA": 70,
      "maxPowerW": 4000,
      "maxPowerByVoltageW": {
        "12": 1000,
        "24": 2000,
        "48": 4000
      },
    },
    {
      "id": "dc_out",
      "kind": "dc",
      "topology": "two_pole",
      "role": "source",
      "direction": "output",
      "label": "DC Output",
      "voltageClass": "dc_low_voltage",
      "maxCurrentA": 70,
    },
    {
      "id": "ve_can",
      "kind": "comm",
      "label": "VE.Can",
      "topology": "two_pole",
      "role": "bidirectional",
      "direction": "bidirectional",
    },
    {
      "id": "ve_direct",
      "kind": "comm",
      "label": "VE.Direct",
      "topology": "two_pole",
      "role": "bidirectional",
      "direction": "bidirectional",
    }
  ]
};

export default product;
