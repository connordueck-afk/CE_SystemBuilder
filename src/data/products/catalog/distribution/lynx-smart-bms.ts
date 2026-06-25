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
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -15
    },
    {
      id: "bat_neg",
      label: "Bat-",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 15
    },
    {
      id: "load_pos",
      label: "Load+",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 70,
      offsetY: -15
    },
    {
      id: "load_neg",
      label: "Load-",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 70,
      offsetY: 15
    }
  ],
  busbarRatings: {
    voltageRatingV: 58,
    currentRatingA: 500,
    busDesignation: "combined"
  }
};

export default product;
