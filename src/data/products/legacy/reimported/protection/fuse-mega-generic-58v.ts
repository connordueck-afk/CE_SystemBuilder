import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-mega-generic-58v",
  manufacturer: "Generic",
  name: "MEGA Fuse 58V",
  productType: "fuse",
  category: "MEGA",
  description: "Generic MEGA fuse, 58V DC rating. Suitable for 12V, 24V, and 48V systems.",
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
    voltageRatingV: 58,
    interruptRatingA: 2000,
    acDcCompatibility: "dc",
    fuseStyle: "MEGA",
    protectionType: "fuse"
  },
  variants: [
    {
      id: "fuse-mega-generic-58v-60a",
      currentRatingA: 60,
      msrpUsd: 14,
      oemPriceUsd: 10
    },
    {
      id: "fuse-mega-generic-58v-80a",
      currentRatingA: 80,
      msrpUsd: 14,
      oemPriceUsd: 10
    },
    {
      id: "fuse-mega-generic-58v-100a",
      currentRatingA: 100,
      msrpUsd: 15,
      oemPriceUsd: 11
    },
    {
      id: "fuse-mega-generic-58v-125a",
      currentRatingA: 125,
      msrpUsd: 15,
      oemPriceUsd: 11
    },
    {
      id: "fuse-mega-generic-58v-150a",
      currentRatingA: 150,
      msrpUsd: 16,
      oemPriceUsd: 11
    },
    {
      id: "fuse-mega-generic-58v-175a",
      currentRatingA: 175,
      msrpUsd: 16,
      oemPriceUsd: 11
    },
    {
      id: "fuse-mega-generic-58v-200a",
      currentRatingA: 200,
      msrpUsd: 17,
      oemPriceUsd: 12
    },
    {
      id: "fuse-mega-generic-58v-225a",
      currentRatingA: 225,
      msrpUsd: 18,
      oemPriceUsd: 13
    },
    {
      id: "fuse-mega-generic-58v-250a",
      currentRatingA: 250,
      msrpUsd: 18,
      oemPriceUsd: 13
    },
    {
      id: "fuse-mega-generic-58v-300a",
      currentRatingA: 300,
      msrpUsd: 20,
      oemPriceUsd: 14
    },
    {
      id: "fuse-mega-generic-58v-400a",
      currentRatingA: 400,
      msrpUsd: 32,
      oemPriceUsd: 22
    },
    {
      id: "fuse-mega-generic-58v-500a",
      currentRatingA: 500,
      msrpUsd: 37,
      oemPriceUsd: 26
    }
  ],
  ports: [
    {
      id: "main",
      kind: "dc",
      topology: "pass_through",
      label: "Main",
      maxCurrentA: 0,
      voltageMaxV: 58
    }
  ]
};

export default product;
