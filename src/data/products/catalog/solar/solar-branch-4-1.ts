import type { Product } from '../../../../types/system';

const product: Product = {
  id: "solar-branch-4-1",
  manufacturer: "Generic",
  name: "4-1 PV Branch Connector",
  productType: "solar_combiner",
  category: "Connectors",
  imageUrl: "/product-images/pv-branch-4-1.svg",
  maxPvVoltageV: 1000,
  maxPvCurrentA: 60,
  msrpUsd: 42,
  oemPriceUsd: 29,
  description: "4-to-1 PV branch connector for combining 4 same-polarity solar conductors. Select PV+ or PV- on the placed component.",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 120,
  height: 76,
  terminals: [
    {
      id: "in_1",
      label: "In 1+",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -60,
      offsetY: -23.56,
      connector: { kind: 'mc4', gender: 'female' },
      notes: "PV branch input 1. Polarity is selected on the component."
    },
    {
      id: "in_2",
      label: "In 2+",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -60,
      offsetY: -7.8533333333333335,
      connector: { kind: 'mc4', gender: 'female' },
      notes: "PV branch input 2. Polarity is selected on the component."
    },
    {
      id: "in_3",
      label: "In 3+",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -60,
      offsetY: 7.853333333333332,
      connector: { kind: 'mc4', gender: 'female' },
      notes: "PV branch input 3. Polarity is selected on the component."
    },
    {
      id: "in_4",
      label: "In 4+",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -60,
      offsetY: 23.56,
      connector: { kind: 'mc4', gender: 'female' },
      notes: "PV branch input 4. Polarity is selected on the component."
    },
    {
      id: "out",
      label: "Out+",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 60,
      offsetY: 0,
      connector: { kind: 'mc4', gender: 'male' },
      notes: "Combined PV branch output. Polarity is selected on the component."
    }
  ],
  solarCombinerRatings: {
    stringCount: 4,
    inputCount: 4,
    outputCount: 1,
    maxVoltageV: 1000,
    maxCurrentA: 60,
    includedProtection: "None (branch connector only)"
  }
};

export default product;
