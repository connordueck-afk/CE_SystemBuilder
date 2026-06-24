import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-generator-source",
  manufacturer: "Generic",
  name: "Generator Source",
  productType: "shorePowerInlet",
  category: "AC Equipment",
  continuousPowerW: 3000,
  msrpUsd: 0,
  description: "Generic AC generator source placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 90,
  height: 64,
  terminals: [
    {
      id: "ac_l",
      label: "L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 45,
      offsetY: -10,
      domain: "ac",
      phases: 1
    },
    {
      id: "ac_n",
      label: "N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 45,
      offsetY: 10,
      domain: "ac"
    }
  ]
};

export default product;
