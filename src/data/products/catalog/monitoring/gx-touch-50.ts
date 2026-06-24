import type { Product } from '../../../../types/system';

const product: Product = {
  id: "gx-touch-50",
  manufacturer: "Victron",
  name: "GX Touch 50 Display",
  productType: "accessory",
  category: "Monitoring",
  msrpUsd: 269,
  description: "Victron GX Touch 50 — 5-inch touchscreen display for Cerbo GX (HDMI/USB connection)",
  partNumber: "BPP900455050",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs. Requires Cerbo GX.",
  width: 80,
  height: 60,
  terminals: [
    {
      id: "signal",
      label: "Signal",
      electricalType: "signal",
      kind: "signal",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      domain: "communication",
      notes: "VE.Bus / VE.Can / VE.Direct system communications."
    }
  ]
};

export default product;
