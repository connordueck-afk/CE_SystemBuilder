import type { Product } from '../../../../types/system';

const product: Product = {
  id: "vedirect-usb",
  manufacturer: "Victron",
  name: "VE.Direct to USB Interface",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 34,
  description: "Victron VE.Direct to USB interface â€” connect VE.Direct devices (MPPTs, BMVs) to a computer for monitoring and configuration.",
  partNumber: "ASS030530010",
  productUrl: "https://www.cdnrg.com/products/veass030530010",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 60,
  height: 40,
  terminals: [
    {
      id: "signal",
      label: "VE.Direct",
      kind: "signal",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -30,
      offsetY: 0,
    }
  ]
};

export default product;
