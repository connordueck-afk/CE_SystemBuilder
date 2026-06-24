import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-mrbf-125a",
  manufacturer: "Generic",
  name: "MRBF Fuse 125A",
  productType: "fuse",
  category: "MRBF",
  maxCurrentA: 125,
  msrpUsd: 21,
  oemPriceUsd: 15,
  description: "MRBF fuse, 125A DC protection",
  source: "Catalog scrape: MRBF terminal fuse ranges",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-mrbf.svg",
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
    currentRatingA: 125,
    voltageRatingV: 58,
    interruptRatingA: 2000,
    acDcCompatibility: "dc",
    fuseStyle: "MRBF",
    protectionType: "fuse"
  }
};

export default product;
