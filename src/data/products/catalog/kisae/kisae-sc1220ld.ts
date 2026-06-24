import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-sc1220ld",
  manufacturer: "KISAE",
  name: "SC1220LD Solar Charge Controller",
  productType: "mppt",
  category: "Charging",
  nominalVoltage: [
    12,
    24
  ],
  maxCurrentA: 20,
  maxPvCurrentA: 20,
  capabilities: [
    "mppt",
    "pv-input",
    "battery-charger"
  ],
  description: "KISAE solar charge controller, 20A.",
  partNumber: "SC1220LD",
  productUrl: "https://www.cdnrg.com/products/sc1220ld",
  source: "Canadian Energy product index",
  dataQuality: "partial",
  width: 96,
  height: 72,
  terminals: [
    {
      id: "pv_pos",
      label: "PV+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -48,
      offsetY: -16,
      domain: "pv"
    },
    {
      id: "pv_neg",
      label: "PV-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -48,
      offsetY: 16,
      domain: "pv"
    },
    {
      id: "bat_pos",
      label: "Bat+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 48,
      offsetY: -16,
      domain: "dc",
      requiresOvercurrentProtection: true
    },
    {
      id: "bat_neg",
      label: "Bat-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 48,
      offsetY: 16,
      domain: "dc"
    },
    {
      id: "ve_can",
      label: "VE.Can",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: -48,
      offsetY: -36
    },
    {
      id: "ve_direct",
      label: "VE.Direct",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: 48,
      offsetY: -36
    }
  ],
  imageUrl: "/product-images/kisae-mppt.svg",
  mpptRatings: {
    batteryVoltagesV: [
      12,
      24
    ],
    maxPvVoltageV: 100,
    maxPvCurrentA: 20,
    maxOutputCurrentA: 20,
    efficiencyPct: 95
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
