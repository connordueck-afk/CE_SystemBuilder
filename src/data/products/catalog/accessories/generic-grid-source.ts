import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-grid-source",
  manufacturer: "Generic",
  name: "AC Source",
  productType: "shorePowerInlet",
  category: "AC Equipment",
  continuousPowerW: 3600,
  msrpUsd: 0,
  description: "Generic AC source placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 90,
  height: 64,
  terminals: [
    {
      id: "ac_l",
      label: "L",
      kind: "ac_power",
      polarity: "line",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 45,
      offsetY: -10,
      phases: 1
    },
    {
      id: "ac_n",
      label: "N",
      kind: "ac_power",
      polarity: "neutral",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 45,
      offsetY: 10,
    }
  ]
};

export default product;
