import type { Product } from '../../../../types/system';

const product: Product = {
  id: "breaker-ac-din-2p",
  manufacturer: "Generic",
  name: "AC DIN Breaker 2P",
  productType: "breaker",
  category: "AC DIN 2P",
  description: "Generic 2-pole AC DIN rail miniature circuit breaker.",
  source: "Catalog estimate: AC DIN rail breakers",
  dataQuality: "placeholder",
  imageUrl: "/product-images/breaker-ac-din-2p.svg",
  width: 84,
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
      offsetX: -12.6,
      offsetY: -41.666666666666664,
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
      offsetX: -12.6,
      offsetY: 42,
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
      offsetX: 12.6,
      offsetY: -41.666666666666664,
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
      offsetX: 12.6,
      offsetY: 42,
      notes: "Load-side AC pole 2 terminal.",
    }
  ],
  protectionRatings: {
    currentRatingA: 0,
    voltageRatingV: 480,
    interruptRatingA: 6000,
    acDcCompatibility: "ac",
    breakerStyle: "AC DIN 2P",
    protectionType: "breaker"
  },
  variants: [
    {
      id: "breaker-ac-din-2p-6a",
      currentRatingA: 6,
      msrpUsd: 26,
      oemPriceUsd: 18
    },
    {
      id: "breaker-ac-din-2p-10a",
      currentRatingA: 10,
      msrpUsd: 28,
      oemPriceUsd: 20
    },
    {
      id: "breaker-ac-din-2p-15a",
      currentRatingA: 15,
      msrpUsd: 30,
      oemPriceUsd: 21
    },
    {
      id: "breaker-ac-din-2p-16a",
      currentRatingA: 16,
      msrpUsd: 31,
      oemPriceUsd: 22
    },
    {
      id: "breaker-ac-din-2p-20a",
      currentRatingA: 20,
      msrpUsd: 32,
      oemPriceUsd: 22
    },
    {
      id: "breaker-ac-din-2p-25a",
      currentRatingA: 25,
      msrpUsd: 34,
      oemPriceUsd: 24
    },
    {
      id: "breaker-ac-din-2p-30a",
      currentRatingA: 30,
      msrpUsd: 36,
      oemPriceUsd: 25
    },
    {
      id: "breaker-ac-din-2p-32a",
      currentRatingA: 32,
      msrpUsd: 37,
      oemPriceUsd: 26
    },
    {
      id: "breaker-ac-din-2p-40a",
      currentRatingA: 40,
      msrpUsd: 40,
      oemPriceUsd: 28
    },
    {
      id: "breaker-ac-din-2p-50a",
      currentRatingA: 50,
      msrpUsd: 45,
      oemPriceUsd: 31
    },
    {
      id: "breaker-ac-din-2p-63a",
      currentRatingA: 63,
      msrpUsd: 50,
      oemPriceUsd: 35
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
