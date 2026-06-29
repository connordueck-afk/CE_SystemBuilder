import type { Product } from '../../../../types/system';

const product: Product = {
  id: "lynx-smart-bms-ng-1000",
  manufacturer: "Victron",
  name: "Lynx Smart BMS NG 1000",
  productType: "dc_distribution",
  imageUrl: "/product-images/victron/lynx_smart_bms_1000.svg",
  category: "Distribution",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 1000,
  msrpUsd: 1300,
  description: "Victron Lynx Smart BMS NG 1000A â€” next-generation BMS for large Victron Lithium NG battery banks. VE.Can / Bluetooth.",
  partNumber: "Lynx Smart BMS NG 1000",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.",
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
    currentRatingA: 1000,
    busDesignation: "combined"
  },
  ports: [
    {
      id: "main",
      kind: "dc",
      topology: "bus",
      label: "Main",
      nominalVoltageV: 12,
      maxCurrentA: 1000
    }
  ]
};

export default product;
