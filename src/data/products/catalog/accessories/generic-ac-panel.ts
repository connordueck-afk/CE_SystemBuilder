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
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -55,
      offsetY: -12,
      phases: 1
    },
    {
      id: "in_n",
      label: "In N",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -55,
      offsetY: 12,
    },
    {
      id: "out_l",
      label: "Out L",
      kind: "ac_power",
      polarity: "line",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 55,
      offsetY: -12,
      phases: 1
    },
    {
      id: "out_n",
      label: "Out N",
      kind: "ac_power",
      polarity: "neutral",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 55,
      offsetY: 12,
    }
  ]
};

export default product;
