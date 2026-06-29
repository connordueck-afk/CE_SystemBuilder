import type { Product } from '../../../../types/system';

const product: Product = {
  id: "breaker-ac-din-1p",
  manufacturer: "Generic",
  name: "AC DIN Breaker 1P",
  productType: "breaker",
  category: "AC DIN 1P",
  description: "Generic 1-pole AC DIN rail miniature circuit breaker.",
  source: "Catalog estimate: AC DIN rail breakers",
  dataQuality: "placeholder",
  imageUrl: "/product-images/breaker-ac-din-1p.svg",
  width: 48,
  height: 120,
  terminals: [
    {
      id: "l1_in",
      label: "Line In",
      polarity: "line",
      role: "pass_through",
      voltageClass: "ac_120v",
      phases: 1,
      conductorCount: 1,
      connector: {
        kind: "screw_terminal"
      },
      direction: "input",
      side: "top",
      offsetX: 0,
      offsetY: -41.666666666666664,
      notes: "Line-side AC pole 1 terminal.",
      portId: "main"
    },
    {
      id: "l1_out",
      label: "Line Out",
      polarity: "line",
      role: "pass_through",
      voltageClass: "ac_120v",
      phases: 1,
      conductorCount: 1,
      connector: {
        kind: "screw_terminal"
      },
      direction: "output",
      side: "bottom",
      offsetX: 0,
      offsetY: 42,
      notes: "Load-side AC pole 1 terminal.",
      portId: "main"
    }
  ],
  protectionRatings: {
    currentRatingA: 0,
    voltageRatingV: 277,
    interruptRatingA: 6000,
    acDcCompatibility: "ac",
    breakerStyle: "AC DIN 1P",
    protectionType: "breaker"
  },
  variants: [
    {
      id: "breaker-ac-din-1p-6a",
      currentRatingA: 6,
      msrpUsd: 14,
      oemPriceUsd: 10
    },
    {
      id: "breaker-ac-din-1p-10a",
      currentRatingA: 10,
      msrpUsd: 15,
      oemPriceUsd: 11
    },
    {
      id: "breaker-ac-din-1p-15a",
      currentRatingA: 15,
      msrpUsd: 17,
      oemPriceUsd: 12
    },
    {
      id: "breaker-ac-din-1p-16a",
      currentRatingA: 16,
      msrpUsd: 17,
      oemPriceUsd: 12
    },
    {
      id: "breaker-ac-din-1p-20a",
      currentRatingA: 20,
      msrpUsd: 19,
      oemPriceUsd: 13
    },
    {
      id: "breaker-ac-din-1p-25a",
      currentRatingA: 25,
      msrpUsd: 20,
      oemPriceUsd: 14
    },
    {
      id: "breaker-ac-din-1p-30a",
      currentRatingA: 30,
      msrpUsd: 22,
      oemPriceUsd: 15
    },
    {
      id: "breaker-ac-din-1p-32a",
      currentRatingA: 32,
      msrpUsd: 23,
      oemPriceUsd: 16
    },
    {
      id: "breaker-ac-din-1p-40a",
      currentRatingA: 40,
      msrpUsd: 25,
      oemPriceUsd: 18
    },
    {
      id: "breaker-ac-din-1p-50a",
      currentRatingA: 50,
      msrpUsd: 29,
      oemPriceUsd: 20
    },
    {
      id: "breaker-ac-din-1p-63a",
      currentRatingA: 63,
      msrpUsd: 33,
      oemPriceUsd: 23
    }
  ],
  ports: [
    {
      id: "main",
      kind: "ac",
      topology: "pass_through",
      label: "Main",
      maxCurrentA: 0,
      voltageMaxV: 277
    }
  ]
};

export default product;
