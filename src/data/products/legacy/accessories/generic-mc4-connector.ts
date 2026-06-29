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
      polarity: "positive",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -35,
      offsetY: -8,
      portId: "main"
    },
    {
      id: "out_pos",
      label: "Out+",
      polarity: "positive",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 35,
      offsetY: -8,
      portId: "main"
    },
    {
      id: "in_neg",
      label: "In-",
      polarity: "negative",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -35,
      offsetY: 8,
      portId: "main"
    },
    {
      id: "out_neg",
      label: "Out-",
      polarity: "negative",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 35,
      offsetY: 8,
      portId: "main"
    }
  ],
  ports: [
    {
      id: "main",
      kind: "pv",
      topology: "pass_through",
      label: "Main"
    }
  ]
};

export default product;
