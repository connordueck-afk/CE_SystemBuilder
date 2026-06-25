import type { Product } from '../../../../types/system';

const product: Product = {
  id: "ve-bus-smart-dongle",
  manufacturer: "Victron",
  name: "VE.Bus Smart Dongle",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 115,
  description: "Victron VE.Bus Smart Dongle â€” adds Bluetooth monitoring to MultiPlus/Quattro inverter-chargers without a GX device.",
  partNumber: "ASS030537010",
  productUrl: "https://www.cdnrg.com/products/veass030537010",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 60,
  height: 40,
  terminals: [
    {
      id: "signal",
      label: "VE.Bus",
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
