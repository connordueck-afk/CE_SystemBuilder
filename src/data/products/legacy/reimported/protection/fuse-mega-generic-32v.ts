import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-mega-generic-32v",
  manufacturer: "Generic",
  name: "MEGA Fuse 32V",
  productType: "fuse",
  category: "MEGA",
  description: "Generic MEGA fuse, 32V DC rating. Suitable for 12V and 24V systems.",
  source: "Estimate",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-mega.svg",
  width: 80,
  height: 34,
  terminals: [
    {
      id: "in",
      label: "A",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      portId: "main"
    },
    {
      id: "out",
      label: "B",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 0,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      portId: "main"
    }
  ],
  protectionRatings: {
    currentRatingA: 0,
    voltageRatingV: 32,
    interruptRatingA: 2000,
    acDcCompatibility: "dc",
    fuseStyle: "MEGA",
    protectionType: "fuse"
  },
  variants: [
    {
      id: "fuse-mega-generic-32v-60a",
      currentRatingA: 60,
      msrpUsd: 12,
      oemPriceUsd: 8
    },
    {
      id: "fuse-mega-generic-32v-80a",
      currentRatingA: 80,
      msrpUsd: 12,
      oemPriceUsd: 8
    },
    {
      id: "fuse-mega-generic-32v-100a",
      currentRatingA: 100,
      msrpUsd: 13,
      oemPriceUsd: 9
    },
    {
      id: "fuse-mega-generic-32v-125a",
      currentRatingA: 125,
      msrpUsd: 13,
      oemPriceUsd: 9
    },
    {
      id: "fuse-mega-generic-32v-150a",
      currentRatingA: 150,
      msrpUsd: 14,
      oemPriceUsd: 10
    },
    {
      id: "fuse-mega-generic-32v-175a",
      currentRatingA: 175,
      msrpUsd: 14,
      oemPriceUsd: 10
    },
    {
      id: "fuse-mega-generic-32v-200a",
      currentRatingA: 200,
      msrpUsd: 15,
      oemPriceUsd: 11
    },
    {
      id: "fuse-mega-generic-32v-225a",
      currentRatingA: 225,
      msrpUsd: 16,
      oemPriceUsd: 11
    },
    {
      id: "fuse-mega-generic-32v-250a",
      currentRatingA: 250,
      msrpUsd: 16,
      oemPriceUsd: 11
    },
    {
      id: "fuse-mega-generic-32v-300a",
      currentRatingA: 300,
      msrpUsd: 18,
      oemPriceUsd: 13
    },
    {
      id: "fuse-mega-generic-32v-400a",
      currentRatingA: 400,
      msrpUsd: 28,
      oemPriceUsd: 20
    },
    {
      id: "fuse-mega-generic-32v-500a",
      currentRatingA: 500,
      msrpUsd: 33,
      oemPriceUsd: 23
    }
  ],
  ports: [
    {
      id: "main",
      kind: "dc",
      topology: "pass_through",
      label: "Main",
      maxCurrentA: 0,
      voltageMaxV: 32
    }
  ]
};

export default product;
