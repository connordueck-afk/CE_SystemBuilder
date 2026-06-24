import type { Product } from '../../../../types/system';

const product: Product = {
  id: "lynx-smart-bms-ng-500",
  manufacturer: "Victron",
  name: "Lynx Smart BMS NG 500",
  productType: "dc_distribution",
  category: "Distribution",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 500,
  msrpUsd: 950,
  description: "Victron Lynx Smart BMS NG 500A — next-generation BMS for Victron Lithium NG batteries. VE.Can / Bluetooth.",
  partNumber: "Lynx Smart BMS NG 500",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.",
  width: 140,
  height: 100,
  terminals: [
    {
      id: "bat_pos",
      label: "Bat+",
      electricalType: "dc_pos",
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
      electricalType: "dc_neg",
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
      electricalType: "dc_pos",
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
      electricalType: "dc_neg",
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
