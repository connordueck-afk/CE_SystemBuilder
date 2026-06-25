import type { Product } from '../../../../types/system';

const product: Product = {
  id: "lynx-shunt-ve-can",
  manufacturer: "Victron",
  name: "Lynx Shunt VE.Can",
  productType: "dc_distribution",
  imageUrl: "/product-images/victron/lynx_shunt_ve_can.svg",
  category: "Distribution",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 1000,
  msrpUsd: 420,
  description: "Victron Lynx Shunt VE.Can â€” precision 1000A current measurement module for the Lynx system. VE.Can communication.",
  partNumber: "LYN040102100",
  productUrl: "https://www.cdnrg.com/products/velyn040102100",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 140,
  height: 100,
  terminals: [
    {
      id: "main_pos",
      label: "Main+",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -15
    },
    {
      id: "main_neg",
      label: "Main-",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 15
    },
    {
      id: "out_pos",
      label: "Out+",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 70,
      offsetY: -15
    },
    {
      id: "out_neg",
      label: "Out-",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 70,
      offsetY: 15
    }
  ],
  busbarRatings: {
    voltageRatingV: 58,
    currentRatingA: 1000,
    busDesignation: "combined"
  }
};

export default product;
