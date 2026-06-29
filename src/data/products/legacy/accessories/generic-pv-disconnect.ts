import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-pv-disconnect",
  manufacturer: "Generic",
  name: "PV Disconnect",
  productType: "dcDisconnect",
  category: "Protection",
  maxPvVoltageV: 600,
  maxPvCurrentA: 30,
  msrpUsd: 0,
  description: "Generic solar PV disconnect placeholder",
  source: "User",
  dataQuality: "placeholder",
  imageUrl: "/product-images/pv-disconnect.svg",
  width: 78,
  height: 90,
  terminals: [
    {
      id: "in_pos",
      label: "In+",
      polarity: "positive",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: -12,
      offsetY: 45,
      portId: "main"
    },
    {
      id: "out_pos",
      label: "Out+",
      polarity: "positive",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: 4,
      offsetY: 45,
      portId: "main"
    },
    {
      id: "in_neg",
      label: "In-",
      polarity: "negative",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: -4,
      offsetY: 45,
      portId: "main"
    },
    {
      id: "out_neg",
      label: "Out-",
      polarity: "negative",
      role: "pass_through",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: 12,
      offsetY: 45,
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
