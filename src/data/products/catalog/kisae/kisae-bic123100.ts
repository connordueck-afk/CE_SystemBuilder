import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-bic123100",
  manufacturer: "KISAE",
  name: "BIC Inverter Charger 12V 3000W/100A",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 12,
  continuousPowerW: 3000,
  maxCurrentA: 250,
  capabilities: [
    "inverter-charger",
    "battery-charger"
  ],
  description: "KISAE BIC bidirectional true sine inverter/charger, 12V 3000W with 100A charger and CAN bus.",
  partNumber: "BIC123100",
  productUrl: "https://www.kisaepower.com/products/inverter-chargers",
  source: "kisaepower.com",
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
    continuousInverterW: 3000,
    chargerCurrentA: 100,
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
