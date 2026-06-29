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
      polarity: "positive",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: 22,
      offsetY: -43,
      requiresOvercurrentProtection: true,
      maxCurrentA: 100,
      portId: "dc"
    },
    {
      id: "dc_neg",
      label: "-",
      polarity: "negative",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: -22,
      offsetY: -43,
      maxCurrentA: 100,
      portId: "dc"
    }
  ],
  ports: [
    {
      id: "dc",
      kind: "dc",
      topology: "two_pole",
      label: "DC",
      maxCurrentA: 100
    }
  ]
};

export default product;
