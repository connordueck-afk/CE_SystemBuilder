import type { Product } from '../../../../types/system';

const product: Product = {
  id: "solar-branch-3-1",
  manufacturer: "Generic",
  name: "3-1 PV Branch Connector",
  productType: "solar_combiner",
  category: "Connectors",
  imageUrl: "/product-images/pv-branch-3-1.svg",
  maxPvVoltageV: 1000,
  maxPvCurrentA: 45,
  msrpUsd: 36,
  oemPriceUsd: 25,
  description: "3-to-1 PV branch connector for combining 3 same-polarity solar conductors. Select PV+ or PV- on the placed component.",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 52,
  height: 144,
  terminals: [
    {
      id: "in_1",
      label: "In 1+",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -26,
      offsetY: -44.64,
      connector: {
        kind: "mc4",
        gender: "female"
      },
      notes: "PV branch input 1. Polarity is selected on the component.",
      portId: "main"
    },
    {
      id: "in_2",
      label: "In 2+",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -26,
      offsetY: 0,
      connector: {
        kind: "mc4",
        gender: "female"
      },
      notes: "PV branch input 2. Polarity is selected on the component.",
      portId: "main"
    },
    {
      id: "in_3",
      label: "In 3+",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -26,
      offsetY: 44.64,
      connector: {
        kind: "mc4",
        gender: "female"
      },
      notes: "PV branch input 3. Polarity is selected on the component.",
      portId: "main"
    },
    {
      id: "out",
      label: "Out+",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 26,
      offsetY: 0,
      connector: {
        kind: "mc4",
        gender: "male"
      },
      notes: "Combined PV branch output. Polarity is selected on the component.",
      portId: "main"
    }
  ],
  solarCombinerRatings: {
    stringCount: 3,
    inputCount: 3,
    outputCount: 1,
    maxVoltageV: 1000,
    maxCurrentA: 45,
    includedProtection: "None (branch connector only)"
  },
  ports: [
    {
      id: "main",
      kind: "pv",
      topology: "bus",
      label: "Main",
      maxCurrentA: 45
    }
  ]
};

export default product;
