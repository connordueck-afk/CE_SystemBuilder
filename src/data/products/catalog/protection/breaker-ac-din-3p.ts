import type { Product } from '../../../../types/system';

const product: Product = {
  id: "breaker-ac-din-3p",
  manufacturer: "Generic",
  name: "AC DIN Breaker 3P",
  productType: "breaker",
  category: "AC DIN 3P",
  description: "Generic 3-pole AC DIN rail miniature circuit breaker.",
  source: "Catalog estimate: AC DIN rail breakers",
  dataQuality: "placeholder",
  imageUrl: "/product-images/breaker-ac-din-3p.svg",
  width: 120,
  height: 120,
  terminalGroups: [
    {
      id: "l1_in",
      portId: "main",
      label: "L1 In",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    },
    {
      id: "l1_out",
      portId: "main",
      label: "L1 Out",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    },
    {
      id: "l2_in",
      portId: "main",
      label: "L2 In",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    },
    {
      id: "l2_out",
      portId: "main",
      label: "L2 Out",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    },
    {
      id: "l3_in",
      portId: "main",
      label: "L3 In",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    },
    {
      id: "l3_out",
      portId: "main",
      label: "L3 Out",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "l1_in",
      terminalGroupId: "l1_in",
      label: "L1 In",
      connector: {
        kind: "screw_terminal"
      },
      side: "top",
      offsetX: -27.333333333333336,
      offsetY: -40.66666666666667,
      notes: "Line-side AC pole 1 terminal.",
    },
    {
      id: "l1_out",
      terminalGroupId: "l1_out",
      label: "L1 Out",
      connector: {
        kind: "screw_terminal"
      },
      side: "bottom",
      offsetX: -27.333333333333336,
      offsetY: 38.666666666666664,
      notes: "Load-side AC pole 1 terminal.",
    },
    {
      id: "l2_in",
      terminalGroupId: "l2_in",
      label: "L2 In",
      connector: {
        kind: "screw_terminal"
      },
      side: "top",
      offsetX: 0,
      offsetY: -40.66666666666667,
      notes: "Line-side AC pole 2 terminal.",
    },
    {
      id: "l2_out",
      terminalGroupId: "l2_out",
      label: "L2 Out",
      connector: {
        kind: "screw_terminal"
      },
      side: "bottom",
      offsetX: 0,
      offsetY: 38.666666666666664,
      notes: "Load-side AC pole 2 terminal.",
    },
    {
      id: "l3_in",
      terminalGroupId: "l3_in",
      label: "L3 In",
      connector: {
        kind: "screw_terminal"
      },
      side: "top",
      offsetX: 27.33333333333333,
      offsetY: -40.66666666666667,
      notes: "Line-side AC pole 3 terminal.",
    },
    {
      id: "l3_out",
      terminalGroupId: "l3_out",
      label: "L3 Out",
      connector: {
        kind: "screw_terminal"
      },
      side: "bottom",
      offsetX: 27.33333333333333,
      offsetY: 38.666666666666664,
      notes: "Load-side AC pole 3 terminal.",
    }
  ],
  protectionRatings: {
    currentRatingA: 0,
    voltageRatingV: 480,
    interruptRatingA: 6000,
    acDcCompatibility: "ac",
    breakerStyle: "AC DIN 3P",
    protectionType: "breaker"
  },
  variants: [
    {
      id: "breaker-ac-din-3p-6a",
      currentRatingA: 6,
      msrpUsd: 39,
      oemPriceUsd: 27
    },
    {
      id: "breaker-ac-din-3p-10a",
      currentRatingA: 10,
      msrpUsd: 41,
      oemPriceUsd: 29
    },
    {
      id: "breaker-ac-din-3p-15a",
      currentRatingA: 15,
      msrpUsd: 43,
      oemPriceUsd: 30
    },
    {
      id: "breaker-ac-din-3p-16a",
      currentRatingA: 16,
      msrpUsd: 44,
      oemPriceUsd: 31
    },
    {
      id: "breaker-ac-din-3p-20a",
      currentRatingA: 20,
      msrpUsd: 46,
      oemPriceUsd: 32
    },
    {
      id: "breaker-ac-din-3p-25a",
      currentRatingA: 25,
      msrpUsd: 48,
      oemPriceUsd: 34
    },
    {
      id: "breaker-ac-din-3p-30a",
      currentRatingA: 30,
      msrpUsd: 51,
      oemPriceUsd: 36
    },
    {
      id: "breaker-ac-din-3p-32a",
      currentRatingA: 32,
      msrpUsd: 52,
      oemPriceUsd: 36
    },
    {
      id: "breaker-ac-din-3p-40a",
      currentRatingA: 40,
      msrpUsd: 56,
      oemPriceUsd: 39
    },
    {
      id: "breaker-ac-din-3p-50a",
      currentRatingA: 50,
      msrpUsd: 61,
      oemPriceUsd: 43
    },
    {
      id: "breaker-ac-din-3p-63a",
      currentRatingA: 63,
      msrpUsd: 67,
      oemPriceUsd: 47
    }
  ],
  ports: [
    {
      id: "main",
      kind: "ac",
      topology: "pass_through",
      role: "pass_through",
      direction: "bidirectional",
      label: "Main",
      voltageClass: "ac_120v",
      maxCurrentA: 0,
      voltageMaxV: 480
    }
  ]
};

export default product;
