import type { Product } from '../../../../types/system';

const product: Product = {
  id: "gx-touch-70",
  manufacturer: "Victron",
  name: "GX Touch 70 Display",
  productType: "accessory",
  category: "Monitoring",
  msrpUsd: 397,
  description: "Victron GX Touch 70 â€” 7-inch touchscreen display for Cerbo GX (HDMI/USB connection)",
  partNumber: "BPP900455070",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs. Requires Cerbo GX.",
  width: 80,
  height: 60,
  terminals: [
    {
      id: "signal",
      label: "Signal",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      notes: "VE.Bus / VE.Can / VE.Direct system communications.",
      portId: "main"
    }
  ],
  ports: [
    {
      id: "main",
      kind: "signal",
      topology: "two_pole",
      label: "Main"
    }
  ]
};

export default product;
