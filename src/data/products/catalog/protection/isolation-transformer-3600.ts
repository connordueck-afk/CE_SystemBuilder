import type { Product } from '../../../../types/system';

const product: Product = {
  id: "isolation-transformer-3600",
  manufacturer: "Victron",
  name: "Isolation Transformer 3600W",
  productType: "transferSwitch",
  category: "Protection",
  continuousPowerW: 3600,
  msrpUsd: 731,
  description: "Victron Isolation Transformer 3600W — galvanic isolation for shore power, eliminates stray currents.",
  partNumber: "ITR000003600",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 80,
  height: 60,
  terminals: [
    {
      id: "ac_in_l",
      label: "In L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      domain: "ac"
    },
    {
      id: "ac_in_n",
      label: "In N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      domain: "ac"
    },
    {
      id: "ac_out_l",
      label: "Out L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 40,
      offsetY: -10,
      domain: "ac"
    },
    {
      id: "ac_out_n",
      label: "Out N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 40,
      offsetY: 10,
      domain: "ac"
    }
  ]
};

export default product;
