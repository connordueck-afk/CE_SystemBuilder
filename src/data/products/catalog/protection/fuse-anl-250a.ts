import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-anl-250a",
  manufacturer: "Generic",
  name: "ANL Fuse 250A",
  productType: "fuse",
  category: "ANL",
  maxCurrentA: 250,
  msrpUsd: 22,
  oemPriceUsd: 15,
  description: "ANL fuse, 250A DC protection",
  source: "Catalog scrape: ANL fuse ranges",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-anl.svg",
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
    interruptRatingA: 6000,
    acDcCompatibility: "dc",
    fuseStyle: "ANL",
    protectionType: "fuse"
  }
};

export default product;
