import type { Product } from '../../../../types/system';

const product: Product = {
  id: "vedirect-cable-3m",
  manufacturer: "Victron",
  name: "VE.Direct Cable 3m",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 18,
  description: "Victron VE.Direct cable 3m — connects VE.Direct devices to Cerbo GX or other VE.Direct interfaces.",
  partNumber: "ASS030531130",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 60,
  height: 40,
  terminals: [
    {
      id: "signal",
      label: "VE.Direct",
      electricalType: "signal",
      kind: "signal",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -30,
      offsetY: 0,
      domain: "communication"
    }
  ]
};

export default product;
