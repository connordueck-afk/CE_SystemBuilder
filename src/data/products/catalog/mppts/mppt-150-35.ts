import type { Product } from '../../../../types/system';

const product: Product = {
  id: "mppt-150-35",
  manufacturer: "Victron",
  name: "SmartSolar MPPT 150/35",
  productType: "mppt",
  category: "Charging",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 35,
  maxPvVoltageV: 150,
  continuousPowerW: 2000,
  msrpUsd: 226,
  description: "Victron SmartSolar MPPT 150V/35A charge controller with Bluetooth",
  partNumber: "SCC115035210",
  productUrl: "https://www.cdnrg.com/products/vescc115035210",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  imageUrl: "/product-images/victron/smartsolar_mppt_large_mc4.svg",
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
      maxCurrentA: 35,
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
      maxCurrentA: 35,
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
      maxCurrentA: 35,
      maxPowerW: 2000,
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
      maxCurrentA: 35,
      maxPowerW: 2000,
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
      24,
      48
    ],
    maxPvVoltageV: 150,
    maxPvCurrentA: 35,
    maxOutputCurrentA: 35,
    maxPvPowerW: 2000,
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
