import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-class-t",
  manufacturer: "Generic",
  name: "Class T Fuse",
  productType: "fuse",
  category: "Class T",
  description: "Class T fuse for DC protection",
  source: "Catalog scrape: Class T fuse ranges",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-class-t.svg",
  width: 80,
  height: 34,
  terminals: [
    {
      id: "in",
      label: "A",
      kind: "dc_power",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      connector: { kind: 'stud', holeSize: 'M8' }
    },
    {
      id: "out",
      label: "B",
      kind: "dc_power",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 0,
      connector: { kind: 'stud', holeSize: 'M8' }
    }
  ],
  protectionRatings: {
    currentRatingA: 0,
    voltageRatingV: 58,
    interruptRatingA: 20000,
    acDcCompatibility: "dc",
    fuseStyle: "Class T",
    protectionType: "fuse"
  },
  variants: [
    { id: "fuse-class-t-110a", currentRatingA: 110, msrpUsd: 44, oemPriceUsd: 31 },
    { id: "fuse-class-t-125a", currentRatingA: 125, msrpUsd: 45, oemPriceUsd: 31 },
    { id: "fuse-class-t-150a", currentRatingA: 150, msrpUsd: 46, oemPriceUsd: 32 },
    { id: "fuse-class-t-175a", currentRatingA: 175, msrpUsd: 48, oemPriceUsd: 34 },
    { id: "fuse-class-t-200a", currentRatingA: 200, msrpUsd: 49, oemPriceUsd: 34 },
    { id: "fuse-class-t-225a", currentRatingA: 225, msrpUsd: 50, oemPriceUsd: 35 },
    { id: "fuse-class-t-250a", currentRatingA: 250, msrpUsd: 52, oemPriceUsd: 36 },
    { id: "fuse-class-t-300a", currentRatingA: 300, msrpUsd: 55, oemPriceUsd: 39 },
    { id: "fuse-class-t-350a", currentRatingA: 350, msrpUsd: 57, oemPriceUsd: 40 },
    { id: "fuse-class-t-400a", currentRatingA: 400, msrpUsd: 60, oemPriceUsd: 42 },
    { id: "fuse-class-t-450a", currentRatingA: 450, msrpUsd: 63, oemPriceUsd: 44 },
    { id: "fuse-class-t-500a", currentRatingA: 500, msrpUsd: 66, oemPriceUsd: 46 },
    { id: "fuse-class-t-600a", currentRatingA: 600, msrpUsd: 71, oemPriceUsd: 50 },
  ],
};

export default product;
