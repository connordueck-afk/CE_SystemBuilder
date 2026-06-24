import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-anl-350a",
  manufacturer: "Generic",
  name: "ANL Fuse 350A",
  productType: "fuse",
  category: "ANL",
  maxCurrentA: 350,
  msrpUsd: 25,
  oemPriceUsd: 18,
  description: "ANL fuse, 350A DC protection",
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
    currentRatingA: 350,
    voltageRatingV: 58,
    interruptRatingA: 6000,
    acDcCompatibility: "dc",
    fuseStyle: "ANL",
    protectionType: "fuse"
  }
};

export default product;
