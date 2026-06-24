import type { Product } from '../../../../types/system';

const product: Product = {
  id: "filax-2",
  manufacturer: "Victron",
  name: "Filax 2 Transfer Switch",
  productType: "transferSwitch",
  category: "Protection",
  msrpUsd: 316,
  description: "Victron Filax 2 — ultra-fast (<20ms) automatic transfer switch for shore power / generator changeover.",
  partNumber: "FIL000020000",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 80,
  height: 60,
  terminals: [
    {
      id: "ac_in_1_l",
      label: "In1 L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: -20,
      domain: "ac"
    },
    {
      id: "ac_in_1_n",
      label: "In1 N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      domain: "ac"
    },
    {
      id: "ac_in_2_l",
      label: "In2 L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 20,
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
