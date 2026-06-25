import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-mc4-connector",
  manufacturer: "Generic",
  name: "MC4 Connector Pair",
  productType: "accessory",
  category: "Solar",
  maxPvVoltageV: 1000,
  maxPvCurrentA: 30,
  msrpUsd: 0,
  description: "Generic solar connector pair placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 70,
  height: 46,
  terminals: [
    {
      id: "in_pos",
      label: "In+",
      kind: "pv_power",
      polarity: "positive",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -35,
      offsetY: -8,
    },
    {
      id: "out_pos",
      label: "Out+",
      kind: "pv_power",
      polarity: "positive",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 35,
      offsetY: -8,
    },
    {
      id: "in_neg",
      label: "In-",
      kind: "pv_power",
      polarity: "negative",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -35,
      offsetY: 8,
    },
    {
      id: "out_neg",
      label: "Out-",
      kind: "pv_power",
      polarity: "negative",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 35,
      offsetY: 8,
    }
  ]
};

export default product;
