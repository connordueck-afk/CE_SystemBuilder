import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-ic121040",
  manufacturer: "KISAE",
  name: "ABSO Inverter Charger 12V 1000W/40A",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 12,
  continuousPowerW: 1000,
  maxCurrentA: 85,
  capabilities: [
    "inverter-charger",
    "battery-charger"
  ],
  description: "KISAE ABSO sine wave inverter/charger, 12V 1000W with 40A charger.",
  partNumber: "IC121040",
  productUrl: "https://www.cdnrg.com/products/ic121040",
  source: "Canadian Energy product index",
  dataQuality: "partial",
  width: 140,
  height: 100,
  terminals: [
    {
      id: "dc_pos",
      label: "DC+",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -18,
      requiresOvercurrentProtection: true
    },
    {
      id: "dc_neg",
      label: "DC-",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 18,
    },
    {
      id: "ac_in_l",
      label: "AC In L",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 70,
      offsetY: -30,
    },
    {
      id: "ac_in_n",
      label: "AC In N",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 70,
      offsetY: -10,
    },
    {
      id: "ac_out_l",
      label: "AC Out L",
      kind: "ac_power",
      polarity: "line",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 70,
      offsetY: 10,
    },
    {
      id: "ac_out_n",
      label: "AC Out N",
      kind: "ac_power",
      polarity: "neutral",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 70,
      offsetY: 30,
    },
    {
      id: "ve_bus",
      label: "VE.Bus",
      kind: "network",
      role: "bidirectional",
      side: "top",
      offsetX: 0,
      offsetY: -50
    }
  ],
  inverterChargerRatings: {
    dcVoltageV: 12,
    continuousInverterW: 1000,
    chargerCurrentA: 40,
    acInputVoltageV: 120,
    acOutputVoltageV: 120
  },
  imageUrl: "/product-images/kisae-inverter-charger.svg",
  communicationPorts: [
    {
      id: "ve_bus",
      name: "VE.Bus",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Bus"
      ],
      configuredProtocol: "VE.Bus"
    }
  ]
};

export default product;
