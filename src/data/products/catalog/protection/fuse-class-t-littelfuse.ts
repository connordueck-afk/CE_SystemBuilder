import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-class-t-littelfuse",
  manufacturer: "Littelfuse",
  name: "Littelfuse Class T Fuse",
  productType: "fuse",
  category: "Class T",
  description: "Littelfuse Class T high-interrupt DC fuse. Ideal for battery banks and high-current DC systems.",
  source: "TBD - Littelfuse Class T datasheet",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-class-t.svg",
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
    interruptRatingA: 20000,
    acDcCompatibility: "dc",
    fuseStyle: "Class T",
    protectionType: "fuse"
  },
  variants: [
    {
      id: "fuse-class-t-littelfuse-110a",
      currentRatingA: 110,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-125a",
      currentRatingA: 125,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-150a",
      currentRatingA: 150,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-175a",
      currentRatingA: 175,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-200a",
      currentRatingA: 200,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-225a",
      currentRatingA: 225,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-250a",
      currentRatingA: 250,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-300a",
      currentRatingA: 300,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-350a",
      currentRatingA: 350,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-400a",
      currentRatingA: 400,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-450a",
      currentRatingA: 450,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-500a",
      currentRatingA: 500,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-class-t-littelfuse-600a",
      currentRatingA: 600,
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
