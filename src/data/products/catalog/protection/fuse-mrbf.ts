import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-mrbf",
  manufacturer: "Generic",
  name: "MRBF Fuse",
  productType: "fuse",
  category: "MRBF",
  description: "MRBF terminal fuse for DC protection",
  source: "Catalog scrape: MRBF terminal fuse ranges",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-mrbf.svg",
  width: 80,
  height: 34,
  terminalGroups: [
    {
      id: "in",
      portId: "main",
      label: "A",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false
    },
    {
      id: "out",
      portId: "main",
      label: "B",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "in",
      terminalGroupId: "in",
      label: "A",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
    },
    {
      id: "out",
      terminalGroupId: "out",
      label: "B",
      side: "right",
      offsetX: 40,
      offsetY: 0,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
    }
  ],
  protectionRatings: {
    currentRatingA: 0,
    voltageRatingV: 58,
    interruptRatingA: 2000,
    acDcCompatibility: "dc",
    fuseStyle: "MRBF",
    protectionType: "fuse"
  },
  variants: [
    {
      id: "fuse-mrbf-30a",
      currentRatingA: 30,
      msrpUsd: 19,
      oemPriceUsd: 13
    },
    {
      id: "fuse-mrbf-40a",
      currentRatingA: 40,
      msrpUsd: 19,
      oemPriceUsd: 13
    },
    {
      id: "fuse-mrbf-50a",
      currentRatingA: 50,
      msrpUsd: 19,
      oemPriceUsd: 13
    },
    {
      id: "fuse-mrbf-60a",
      currentRatingA: 60,
      msrpUsd: 20,
      oemPriceUsd: 14
    },
    {
      id: "fuse-mrbf-75a",
      currentRatingA: 75,
      msrpUsd: 20,
      oemPriceUsd: 14
    },
    {
      id: "fuse-mrbf-80a",
      currentRatingA: 80,
      msrpUsd: 20,
      oemPriceUsd: 14
    },
    {
      id: "fuse-mrbf-100a",
      currentRatingA: 100,
      msrpUsd: 21,
      oemPriceUsd: 15
    },
    {
      id: "fuse-mrbf-125a",
      currentRatingA: 125,
      msrpUsd: 21,
      oemPriceUsd: 15
    },
    {
      id: "fuse-mrbf-150a",
      currentRatingA: 150,
      msrpUsd: 22,
      oemPriceUsd: 15
    },
    {
      id: "fuse-mrbf-175a",
      currentRatingA: 175,
      msrpUsd: 22,
      oemPriceUsd: 15
    },
    {
      id: "fuse-mrbf-200a",
      currentRatingA: 200,
      msrpUsd: 23,
      oemPriceUsd: 16
    },
    {
      id: "fuse-mrbf-225a",
      currentRatingA: 225,
      msrpUsd: 24,
      oemPriceUsd: 17
    },
    {
      id: "fuse-mrbf-250a",
      currentRatingA: 250,
      msrpUsd: 24,
      oemPriceUsd: 17
    },
    {
      id: "fuse-mrbf-300a",
      currentRatingA: 300,
      msrpUsd: 26,
      oemPriceUsd: 18
    }
  ],
  ports: [
    {
      id: "main",
      kind: "dc",
      topology: "pass_through",
      role: "pass_through",
      direction: "bidirectional",
      label: "Main",
      voltageClass: "dc_low_voltage",
      maxCurrentA: 0,
      voltageMaxV: 58
    }
  ]
};

export default product;
