import type { Product } from '../../../../types/system';

const product: Product = {
  id: "lynx-smart-bms",
  manufacturer: "Victron",
  name: "Lynx Smart BMS 500",
  productType: "dc_distribution",
  imageUrl: "/product-images/victron/lynx_smart_bms_500.svg",
  category: "Distribution",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 500,
  msrpUsd: 799,
  description: "Victron Lynx Smart BMS 500A â€” battery management system for Victron Lithium batteries. VE.Can / Bluetooth.",
  partNumber: "LYN034160200",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 140,
  height: 100,
  terminals: [
    {
      id: "bat_pos",
      label: "Bat+",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -15,
      portId: "main"
    },
    {
      id: "bat_neg",
      label: "Bat-",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 15,
      portId: "main"
    },
    {
      id: "load_pos",
      label: "Load+",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 70,
      offsetY: -15,
      portId: "main"
    },
    {
      id: "load_neg",
      label: "Load-",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 70,
      offsetY: 15,
      portId: "main"
    }
  ],
  busbarRatings: {
    voltageRatingV: 58,
    currentRatingA: 500,
    busDesignation: "combined"
  },
  ports: [
    {
      id: "main",
      kind: "dc",
      topology: "bus",
      label: "Main",
      nominalVoltageV: 12,
      maxCurrentA: 500
    }
  ]
};

export default product;
