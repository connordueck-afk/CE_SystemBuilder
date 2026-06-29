import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-mrbf-blue-sea",
  manufacturer: "Blue Sea Systems",
  name: "Blue Sea Systems MRBF Fuse",
  productType: "fuse",
  category: "MRBF",
  description: "Blue Sea Systems MRBF terminal fuse for DC protection. Mounts directly to battery terminal.",
  source: "TBD - Blue Sea Systems MRBF datasheet",
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
      id: "fuse-mrbf-blue-sea-30a",
      currentRatingA: 30,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-40a",
      currentRatingA: 40,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-50a",
      currentRatingA: 50,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-60a",
      currentRatingA: 60,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-75a",
      currentRatingA: 75,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-80a",
      currentRatingA: 80,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-100a",
      currentRatingA: 100,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-125a",
      currentRatingA: 125,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-150a",
      currentRatingA: 150,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-175a",
      currentRatingA: 175,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-200a",
      currentRatingA: 200,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-225a",
      currentRatingA: 225,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-250a",
      currentRatingA: 250,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-mrbf-blue-sea-300a",
      currentRatingA: 300,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
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
