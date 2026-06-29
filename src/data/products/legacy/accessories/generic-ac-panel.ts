import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-ac-panel",
  manufacturer: "Generic",
  name: "AC Panel",
  productType: "ac_distribution",
  category: "AC Equipment",
  maxCurrentA: 30,
  msrpUsd: 0,
  description: "Generic AC distribution panel placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 110,
  height: 80,
  terminals: [
    {
      id: "in_l",
      label: "In L",
      polarity: "line",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -55,
      offsetY: -12,
      phases: 1,
      portId: "main"
    },
    {
      id: "in_n",
      label: "In N",
      polarity: "neutral",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -55,
      offsetY: 12,
      portId: "main"
    },
    {
      id: "out_l",
      label: "Out L",
      polarity: "line",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 55,
      offsetY: -12,
      phases: 1,
      portId: "main"
    },
    {
      id: "out_n",
      label: "Out N",
      polarity: "neutral",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 55,
      offsetY: 12,
      portId: "main"
    }
  ],
  ports: [
    {
      id: "main",
      kind: "ac",
      topology: "bus",
      label: "Main",
      maxCurrentA: 30
    }
  ]
};

export default product;
