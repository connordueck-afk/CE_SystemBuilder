import type { Product } from '../../../../types/system';

const product: Product = {
  id: "mppt-vic-150-100",
  manufacturer: "Victron",
  name: "SmartSolar MPPT 150/100 TR",
  productType: "mppt",
  category: "Charging",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 100,
  maxPvVoltageV: 150,
  maxPvCurrentA: 70,
  continuousPowerW: 5800,
  description: "Victron SmartSolar MPPT TR solar charge controller with TR-type connectors and Bluetooth",
  source: "Victron 2024",
  dataQuality: "complete",
  imageUrl: "/product-images/victron/smartsolar_mppt_large_tr.svg",
  partNumber: "SCC115110210",
  productUrl: "https://www.victronenergy.com/solar-charge-controllers/smartsolar-mppt-150-100",
  msrpUsd: 549,
  oemPriceUsd: 384,
  width: 80,
  height: 112,
  terminalGroups: [
    {
      id: "pv_neg",
      portId: "pv",
      label: "PV Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 70
    },
    {
      id: "pv_pos",
      portId: "pv",
      label: "PV Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 70
    },
    {
      id: "dc_out_pos",
      portId: "dc_out",
      label: "DC Output Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: true,
      maxCurrentA: 100,
      requiresOvercurrentProtection: true,
      recommendedFuseA: 125,
      maxFuseA: 125
    },
    {
      id: "dc_out_neg",
      portId: "dc_out",
      label: "DC Output Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 100
    },
    {
      id: "ve_can_iface",
      portId: "ve_can",
      label: "VE.Can Interface",
      groupType: "communication_interface",
      internallyCommon: false
    },
    {
      id: "ve_direct_iface",
      portId: "ve_direct",
      label: "VE.Direct Interface",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "pv_neg",
      terminalGroupId: "pv_neg",
      label: "PV-",
      side: "bottom",
      offsetX: -28,
      offsetY: 38,
      maxCurrentA: 70,
      connector: {
        kind: "screw_terminal"
      },
      notes: "PV array negative input."
    },
    {
      id: "pv_pos",
      terminalGroupId: "pv_pos",
      label: "PV+",
      side: "bottom",
      offsetX: -9,
      offsetY: 38,
      maxCurrentA: 70,
      connector: {
        kind: "screw_terminal"
      },
      notes: "PV array positive input. Do not connect negative PV conductor to chassis."
    },
    {
      id: "bat_pos",
      terminalGroupId: "dc_out_pos",
      label: "BAT+",
      side: "bottom",
      offsetX: 9,
      offsetY: 38,
      maxCurrentA: 100,
      connector: {
        kind: "screw_terminal"
      },
      notes: "Battery positive terminal. Requires fuse on positive conductor between MPPT and busbar."
    },
    {
      id: "bat_neg",
      terminalGroupId: "dc_out_neg",
      label: "BAT-",
      side: "bottom",
      offsetX: 28,
      offsetY: 38,
      maxCurrentA: 100,
      connector: {
        kind: "screw_terminal"
      },
      notes: "Battery negative terminal."
    },
    {
      id: "ve_can",
      terminalGroupId: "ve_can_iface",
      label: "VE.Can",
      side: "top",
      offsetX: -40,
      offsetY: -56
    },
    {
      id: "ve_direct",
      terminalGroupId: "ve_direct_iface",
      label: "VE.Direct",
      side: "top",
      offsetX: 40,
      offsetY: -56
    }
  ],
  mpptRatings: {
    batteryVoltagesV: [
      12,
      24,
      48
    ],
    maxPvVoltageV: 150,
    maxPvCurrentA: 70,
    maxOutputCurrentA: 100,
    maxPvPowerW: 5800,
    maxPvPowerByVoltageW: {
      "12": 1450,
      "24": 2900,
      "48": 5800
    },
    efficiencyPct: 98
  },
  communicationPorts: [
    {
      id: "ve_can",
      name: "VE.Can",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Can"
      ],
      configuredProtocol: "VE.Can"
    },
    {
      id: "ve_direct",
      name: "VE.Direct",
      connectorType: "VE.Direct",
      supportedProtocols: [
        "VE.Direct"
      ],
      configuredProtocol: "VE.Direct"
    }
  ],
  ports: [
    {
      id: "pv",
      kind: "pv",
      topology: "two_pole",
      label: "PV",
      voltageClass: "pv_high_voltage",
      voltageMaxV: 150,
      maxCurrentA: 70,
      maxPowerW: 5800,
      maxPowerByVoltageW: {
        "12": 1450,
        "24": 2900,
        "48": 5800
      },
      role: "sink",
      direction: "input"
    },
    {
      id: "dc_out",
      kind: "dc",
      topology: "two_pole",
      label: "DC Output",
      voltageClass: "dc_low_voltage",
      maxCurrentA: 100,
      role: "source",
      direction: "output"
    },
    {
      id: "ve_can",
      kind: "comm",
      label: "VE.Can",
      topology: "two_pole",
      role: "bidirectional",
      direction: "bidirectional"
    },
    {
      id: "ve_direct",
      kind: "comm",
      label: "VE.Direct",
      topology: "two_pole",
      role: "bidirectional",
      direction: "bidirectional"
    }
  ]
};

export default product;
