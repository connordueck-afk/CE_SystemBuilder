import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "vic-bluesolar-mppt-100-50",
  "manufacturer": "Victron",
  "name": "BlueSolar MPPT 100/50",
  "productType": "mppt",
  "category": "Charging",
  "nominalVoltage": [
    12,
    24
  ],
  "maxCurrentA": 50,
  "maxPvVoltageV": 100,
  "maxPvCurrentA": 60,
  "continuousPowerW": 1400,
  "description": "Victron BlueSolar MPPT solar charge controller",
  "source": "Victron 2025",
  "dataQuality": "partial",
  "imageUrl": "/product-images/victron/smartsolar_mppt_large_mc4.svg",
  "partNumber": "BlueSolar MPPT 100/50",
  "msrpUsd": 185,
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
      maxCurrentA: 60
    },
    {
      id: "pv_pos",
      portId: "pv",
      label: "PV+",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 60
    },
    {
      id: "bat_pos",
      portId: "dc_out",
      label: "BAT+",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 50,
      requiresOvercurrentProtection: true
    },
    {
      id: "bat_neg",
      portId: "dc_out",
      label: "BAT-",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 50
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
      "maxCurrentA": 60,
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
      "maxCurrentA": 60,
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
      "maxCurrentA": 50,
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
      "maxCurrentA": 50,
      "connector": {
        "kind": "screw_terminal"
      },
      "notes": "Battery negative terminal.",
    },
    {
      "id": "ve_direct",
      "terminalGroupId": "ve_direct",
      "label": "VE.Direct",
      "side": "top",
      "offsetX": 0,
      "offsetY": -56,
    }
  ],
  "mpptRatings": {
    "batteryVoltagesV": [
      12,
      24
    ],
    "maxPvVoltageV": 100,
    "maxPvCurrentA": 60,
    "maxOutputCurrentA": 50,
    "maxPvPowerW": 1400,
    "maxPvPowerByVoltageW": {
      "12": 700,
      "24": 1400
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
      "role": "sink",
      "direction": "input",
      "label": "PV",
      "voltageClass": "pv_high_voltage",
      "voltageMaxV": 100,
      "maxCurrentA": 60,
      "maxPowerW": 1400,
      "maxPowerByVoltageW": {
        "12": 700,
        "24": 1400
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
      "maxCurrentA": 50,
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
