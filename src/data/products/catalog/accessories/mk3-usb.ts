import type { Product } from '../../../../types/system';

const product: Product = {
  id: "mk3-usb",
  manufacturer: "Victron",
  name: "MK3-USB Interface",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 84,
  description: "Victron MK3-USB — VE.Bus to USB interface for programming MultiPlus/Quattro from a PC.",
  partNumber: "ASS030140000",
  productUrl: "https://www.cdnrg.com/products/veass030140000",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 60,
  height: 40,
  terminals: [
    {
      id: "signal",
      label: "VE.Bus",
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
