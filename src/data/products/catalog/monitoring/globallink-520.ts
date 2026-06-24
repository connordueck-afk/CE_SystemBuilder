import type { Product } from '../../../../types/system';

const product: Product = {
  id: "globallink-520",
  manufacturer: "Victron",
  name: "GlobalLink 520 Cellular Gateway",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 265,
  description: "Victron GlobalLink 520 — LTE-M cellular gateway for remote VRM monitoring via VE.Direct",
  partNumber: "ASS030543020",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
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
