import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-mega-80a",
  manufacturer: "Generic",
  name: "MEGA Fuse 80A",
  productType: "fuse",
  category: "MEGA",
  maxCurrentA: 80,
  msrpUsd: 14,
  oemPriceUsd: 10,
  description: "MEGA fuse, 80A DC protection",
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
    currentRatingA: 80,
    voltageRatingV: 58,
    interruptRatingA: 2000,
    acDcCompatibility: "dc",
    fuseStyle: "MEGA",
    protectionType: "fuse"
  }
};

export default product;
