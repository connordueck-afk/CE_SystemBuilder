import type { Product } from '../../../../types/system';

const product: Product = {
  id: "breaker-dc-breaker",
  manufacturer: "Generic",
  name: "DC Breaker",
  productType: "breaker",
  category: "DC Breaker",
  description: "Generic DC circuit breaker for DC protection.",
  source: "Catalog estimate: DC circuit breakers",
  dataQuality: "placeholder",
  imageUrl: "/product-images/breaker-dc-breaker.svg",
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
        kind: "screw_terminal"
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
        kind: "screw_terminal"
      },
    }
  ],
  protectionRatings: {
    currentRatingA: 0,
    voltageRatingV: 48,
    acDcCompatibility: "dc",
    breakerStyle: "DC Breaker",
    protectionType: "breaker"
  },
  variants: [
    {
      id: "breaker-dc-breaker-5a",
      currentRatingA: 5,
      msrpUsd: 21,
      oemPriceUsd: 15
    },
    {
      id: "breaker-dc-breaker-10a",
      currentRatingA: 10,
      msrpUsd: 23,
      oemPriceUsd: 16
    },
    {
      id: "breaker-dc-breaker-15a",
      currentRatingA: 15,
      msrpUsd: 24,
      oemPriceUsd: 17
    },
    {
      id: "breaker-dc-breaker-20a",
      currentRatingA: 20,
      msrpUsd: 25,
      oemPriceUsd: 18
    },
    {
      id: "breaker-dc-breaker-25a",
      currentRatingA: 25,
      msrpUsd: 26,
      oemPriceUsd: 18
    },
    {
      id: "breaker-dc-breaker-30a",
      currentRatingA: 30,
      msrpUsd: 28,
      oemPriceUsd: 20
    },
    {
      id: "breaker-dc-breaker-40a",
      currentRatingA: 40,
      msrpUsd: 30,
      oemPriceUsd: 21
    },
    {
      id: "breaker-dc-breaker-50a",
      currentRatingA: 50,
      msrpUsd: 33,
      oemPriceUsd: 23
    },
    {
      id: "breaker-dc-breaker-60a",
      currentRatingA: 60,
      msrpUsd: 35,
      oemPriceUsd: 25
    },
    {
      id: "breaker-dc-breaker-70a",
      currentRatingA: 70,
      msrpUsd: 38,
      oemPriceUsd: 27
    },
    {
      id: "breaker-dc-breaker-80a",
      currentRatingA: 80,
      msrpUsd: 40,
      oemPriceUsd: 28
    },
    {
      id: "breaker-dc-breaker-100a",
      currentRatingA: 100,
      msrpUsd: 45,
      oemPriceUsd: 31
    },
    {
      id: "breaker-dc-breaker-125a",
      currentRatingA: 125,
      msrpUsd: 51,
      oemPriceUsd: 36
    },
    {
      id: "breaker-dc-breaker-150a",
      currentRatingA: 150,
      msrpUsd: 58,
      oemPriceUsd: 41
    },
    {
      id: "breaker-dc-breaker-175a",
      currentRatingA: 175,
      msrpUsd: 64,
      oemPriceUsd: 45
    },
    {
      id: "breaker-dc-breaker-200a",
      currentRatingA: 200,
      msrpUsd: 70,
      oemPriceUsd: 49
    },
    {
      id: "breaker-dc-breaker-250a",
      currentRatingA: 250,
      msrpUsd: 83,
      oemPriceUsd: 58
    },
    {
      id: "breaker-dc-breaker-300a",
      currentRatingA: 300,
      msrpUsd: 95,
      oemPriceUsd: 67
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
      voltageMaxV: 48
    }
  ]
};

export default product;
