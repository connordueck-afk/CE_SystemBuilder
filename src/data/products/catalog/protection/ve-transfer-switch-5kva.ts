import type { Product } from '../../../../types/system';

const product: Product = {
  id: "ve-transfer-switch-5kva",
  manufacturer: "Victron",
  name: "VE Transfer Switch 5 kVA",
  productType: "transferSwitch",
  category: "Protection",
  continuousPowerW: 5000,
  msrpUsd: 378,
  description: "Victron VE Transfer Switch 5 kVA â€” for use with MultiPlus/Quattro systems to add a second AC input.",
  partNumber: "VTS000005000",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 80,
  height: 60,
  terminals: [
    {
      id: "ac_in_l",
      label: "In L",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: -10,
    },
    {
      id: "ac_in_n",
      label: "In N",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 10,
    },
    {
      id: "ac_out_l",
      label: "Out L",
      kind: "ac_power",
      polarity: "line",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 40,
      offsetY: -10,
    },
    {
      id: "ac_out_n",
      label: "Out N",
      kind: "ac_power",
      polarity: "neutral",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 40,
      offsetY: 10,
    }
  ]
};

export default product;
