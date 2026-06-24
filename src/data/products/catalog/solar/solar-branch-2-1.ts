import type { Product } from '../../../../types/system';

const product: Product = {
  id: "solar-branch-2-1",
  manufacturer: "Generic",
  name: "2-1 PV Branch Connector",
  productType: "solar_combiner",
  category: "Connectors",
  imageUrl: "/product-images/pv-branch-2-1.svg",
  maxPvVoltageV: 1000,
  maxPvCurrentA: 30,
  msrpUsd: 30,
  oemPriceUsd: 21,
  description: "2-to-1 PV branch connector for combining 2 same-polarity solar conductors. Select PV+ or PV- on the placed component.",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 70,
  height: 100,
  terminals: [
    {
      id: "in_1",
      label: "In 1+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -35,
      offsetY: -31,
      domain: "pv",
      notes: "PV branch input 1. Polarity is selected on the component."
    },
    {
      id: "in_2",
      label: "In 2+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -35,
      offsetY: 31,
      domain: "pv",
      notes: "PV branch input 2. Polarity is selected on the component."
    },
    {
      id: "out",
      label: "Out+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 35,
      offsetY: 0,
      domain: "pv",
      notes: "Combined PV branch output. Polarity is selected on the component."
    }
  ],
  solarCombinerRatings: {
    stringCount: 2,
    inputCount: 2,
    outputCount: 1,
    maxVoltageV: 1000,
    maxCurrentA: 30,
    includedProtection: "None (branch connector only)"
  }
};

export default product;
