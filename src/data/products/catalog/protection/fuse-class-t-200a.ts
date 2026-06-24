import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-class-t-200a",
  manufacturer: "Generic",
  name: "Class T Fuse 200A",
  productType: "fuse",
  category: "Class T",
  maxCurrentA: 200,
  msrpUsd: 49,
  oemPriceUsd: 34,
  description: "Class T fuse, 200A DC protection",
  source: "Catalog scrape: Class T fuse ranges",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-class-t.svg",
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
    currentRatingA: 200,
    voltageRatingV: 58,
    interruptRatingA: 20000,
    acDcCompatibility: "dc",
    fuseStyle: "Class T",
    protectionType: "fuse"
  }
};

export default product;
