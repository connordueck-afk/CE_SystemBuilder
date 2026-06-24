import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-battery-bank",
  manufacturer: "Generic",
  name: "Generic Battery Bank",
  productType: "battery",
  category: "Batteries",
  capacityWh: 1200,
  maxCurrentA: 100,
  msrpUsd: 0,
  description: "Generic battery bank placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 90,
  height: 86,
  terminals: [
    {
      id: "dc_pos",
      label: "+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: 22,
      offsetY: -43,
      domain: "dc",
      requiresOvercurrentProtection: true,
      maxCurrentA: 100
    },
    {
      id: "dc_neg",
      label: "-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: -22,
      offsetY: -43,
      domain: "dc",
      maxCurrentA: 100
    }
  ]
};

export default product;
