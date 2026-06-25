import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-alternator-source",
  manufacturer: "Generic",
  name: "DC Source",
  productType: "accessory",
  category: "Charging",
  nominalVoltage: [
    12,
    24
  ],
  maxCurrentA: 120,
  continuousPowerW: 1440,
  msrpUsd: 0,
  description: "Generic DC source placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 90,
  height: 64,
  terminals: [
    {
      id: "dc_pos",
      label: "B+",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 45,
      offsetY: -10,
      requiresOvercurrentProtection: true,
      maxCurrentA: 120
    },
    {
      id: "dc_neg",
      label: "B-",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 45,
      offsetY: 10,
      maxCurrentA: 120
    }
  ]
};

export default product;
