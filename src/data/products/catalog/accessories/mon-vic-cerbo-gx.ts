import type { Product } from '../../../../types/system';

const product: Product = {
  id: "mon-vic-cerbo-gx",
  manufacturer: "Victron",
  name: "Cerbo GX",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 329,
  oemPriceUsd: 230,
  description: "Victron Cerbo GX — system monitoring and control hub with VRM",
  partNumber: "BPP900450100",
  productUrl: "https://www.cdnrg.com/products/vebpp900450100",
  source: "Victron 2024",
  dataQuality: "complete",
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
      notes: "VE.Bus / VE.Can / VE.Direct / USB signal connections."
    }
  ]
};

export default product;
