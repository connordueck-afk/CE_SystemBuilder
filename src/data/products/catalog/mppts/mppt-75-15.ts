import type { Product } from '../../../../types/system';

const product: Product = {
  id: "mppt-75-15",
  manufacturer: "Victron",
  name: "SmartSolar MPPT 75/15",
  productType: "mppt",
  category: "Charging",
  nominalVoltage: [
    12,
    24
  ],
  maxCurrentA: 15,
  maxPvVoltageV: 75,
  continuousPowerW: 440,
  msrpUsd: 78,
  description: "Victron SmartSolar MPPT 75V/15A charge controller with Bluetooth",
  partNumber: "SCC075015060R",
  productUrl: "https://www.cdnrg.com/products/vescc075015060r",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  imageUrl: "/product-images/victron-smartsolar-mppt.svg",
  width: 80,
  height: 112,
  terminals: [
    {
      id: "pv_neg",
      label: "PV-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: -28,
      offsetY: 38,
      domain: "pv",
      maxCurrentA: 15,
      notes: "PV array negative input."
    },
    {
      id: "pv_pos",
      label: "PV+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: -9,
      offsetY: 38,
      domain: "pv",
      maxCurrentA: 15,
      requiresOvercurrentProtection: false,
      notes: "PV array positive input. Do not connect negative PV conductor to chassis."
    },
    {
      id: "bat_pos",
      label: "BAT+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 9,
      offsetY: 38,
      domain: "dc",
      maxCurrentA: 15,
      maxPowerW: 440,
      requiresOvercurrentProtection: true,
      notes: "Battery positive terminal. Requires fuse on positive conductor between MPPT and busbar."
    },
    {
      id: "bat_neg",
      label: "BAT-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 28,
      offsetY: 38,
      domain: "dc",
      maxCurrentA: 15,
      maxPowerW: 440,
      notes: "Battery negative terminal."
    },
    {
      id: "ve_can",
      label: "VE.Can",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: -40,
      offsetY: -56
    },
    {
      id: "ve_direct",
      label: "VE.Direct",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: 40,
      offsetY: -56
    }
  ],
  mpptRatings: {
    batteryVoltagesV: [
      12,
      24
    ],
    maxPvVoltageV: 75,
    maxPvCurrentA: 15,
    maxOutputCurrentA: 15,
    maxPvPowerW: 440,
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
  ]
};

export default product;
