import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-anl",
  manufacturer: "Generic",
  name: "ANL Fuse",
  productType: "fuse",
  category: "ANL",
  description: "ANL fuse for DC protection",
  source: "Catalog scrape: ANL fuse ranges",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-anl.svg",
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
      }
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
      }
    }
  ],
  protectionRatings: {
    currentRatingA: 0,
    voltageRatingV: 58,
    interruptRatingA: 6000,
    acDcCompatibility: "dc",
    fuseStyle: "ANL",
    protectionType: "fuse"
  },
  variants: [
    {
      id: "fuse-anl-35a",
      currentRatingA: 35,
      msrpUsd: 17,
      oemPriceUsd: 12
    },
    {
      id: "fuse-anl-40a",
      currentRatingA: 40,
      msrpUsd: 17,
      oemPriceUsd: 12
    },
    {
      id: "fuse-anl-50a",
      currentRatingA: 50,
      msrpUsd: 17,
      oemPriceUsd: 12
    },
    {
      id: "fuse-anl-60a",
      currentRatingA: 60,
      msrpUsd: 18,
      oemPriceUsd: 13
    },
    {
      id: "fuse-anl-80a",
      currentRatingA: 80,
      msrpUsd: 18,
      oemPriceUsd: 13
    },
    {
      id: "fuse-anl-100a",
      currentRatingA: 100,
      msrpUsd: 19,
      oemPriceUsd: 13
    },
    {
      id: "fuse-anl-130a",
      currentRatingA: 130,
      msrpUsd: 19,
      oemPriceUsd: 13
    },
    {
      id: "fuse-anl-150a",
      currentRatingA: 150,
      msrpUsd: 20,
      oemPriceUsd: 14
    },
    {
      id: "fuse-anl-175a",
      currentRatingA: 175,
      msrpUsd: 20,
      oemPriceUsd: 14
    },
    {
      id: "fuse-anl-200a",
      currentRatingA: 200,
      msrpUsd: 21,
      oemPriceUsd: 15
    },
    {
      id: "fuse-anl-225a",
      currentRatingA: 225,
      msrpUsd: 22,
      oemPriceUsd: 15
    },
    {
      id: "fuse-anl-250a",
      currentRatingA: 250,
      msrpUsd: 22,
      oemPriceUsd: 15
    },
    {
      id: "fuse-anl-300a",
      currentRatingA: 300,
      msrpUsd: 24,
      oemPriceUsd: 17
    },
    {
      id: "fuse-anl-325a",
      currentRatingA: 325,
      msrpUsd: 24,
      oemPriceUsd: 17
    },
    {
      id: "fuse-anl-350a",
      currentRatingA: 350,
      msrpUsd: 25,
      oemPriceUsd: 18
    },
    {
      id: "fuse-anl-400a",
      currentRatingA: 400,
      msrpUsd: 36,
      oemPriceUsd: 25
    },
    {
      id: "fuse-anl-500a",
      currentRatingA: 500,
      msrpUsd: 41,
      oemPriceUsd: 29
    },
    {
      id: "fuse-anl-600a",
      currentRatingA: 600,
      msrpUsd: 46,
      oemPriceUsd: 32
    },
    {
      id: "fuse-anl-750a",
      currentRatingA: 750,
      msrpUsd: 54,
      oemPriceUsd: 38
    }
  ],
  ports: [
    {
      id: "main",
      kind: "dc",
      topology: "pass_through",
      label: "Main",
      maxCurrentA: 0,
      voltageClass: "dc_low_voltage",
      voltageMaxV: 58,
      role: "pass_through"
    }
  ]
};

export default product;
