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
      polarity: "line",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      portId: "ac_in"
    },
    {
      id: "ac_in_n",
      label: "In N",
      polarity: "neutral",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      portId: "ac_in"
    },
    {
      id: "ac_out_l",
      label: "Out L",
      polarity: "line",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 40,
      offsetY: -10,
      portId: "ac_out"
    },
    {
      id: "ac_out_n",
      label: "Out N",
      polarity: "neutral",
      role: "source",
      voltageClass: "ac_120v",
      side: "right",
      offsetX: 40,
      offsetY: 10,
      portId: "ac_out"
    }
  ],
  ports: [
    {
      id: "ac_in",
      kind: "ac",
      topology: "two_pole",
      label: "AC Input"
    },
    {
      id: "ac_out",
      kind: "ac",
      topology: "two_pole",
      label: "AC Output"
    }
  ]
};

export default product;
