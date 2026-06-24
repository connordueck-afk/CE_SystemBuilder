import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-mega-250a",
  manufacturer: "Generic",
  name: "MEGA Fuse 250A",
  productType: "fuse",
  category: "MEGA",
  maxCurrentA: 250,
  msrpUsd: 18,
  oemPriceUsd: 13,
  description: "MEGA fuse, 250A DC protection",
  source: "Catalog scrape: MEGA fuse ranges",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-mega.svg",
  width: 80,
  height: 34,
  terminals: [
    {
      id: "in",
      label: "A",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      domain: "dc"
    },
    {
      id: "out",
      label: "B",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 0,
      domain: "dc"
    }
  ],
  protectionRatings: {
    currentRatingA: 250,
    voltageRatingV: 58,
    interruptRatingA: 2000,
    acDcCompatibility: "dc",
    fuseStyle: "MEGA",
    protectionType: "fuse"
  }
};

export default product;
