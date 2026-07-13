import type { Product } from '../../../../types/system';

const product: Product = {
  id: "breaker-dc-breaker-250v",
  manufacturer: "Generic",
  name: "DC Breaker (250V)",
  productType: "breaker",
  category: "DC Breaker",
  description: "Generic 250VDC-rated DC circuit breaker for higher-voltage DC and PV protection.",
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
    voltageRatingV: 250,
    acDcCompatibility: "dc",
    breakerStyle: "DC Breaker (250V)",
    protectionType: "breaker"
  },
  breakerDefinition: {
    poleCount: 1,
    tripLinkage: "independent",
    poles: [{ id: "pole1", inputTerminalGroupId: "in", outputTerminalGroupId: "out" }],
    ratingProfiles: [
      { id: "dc-250v-1p", label: "250 VDC, 1 pole", medium: "dc", maxVoltageV: 250, polesRequired: 1, wiring: "independent_conductors" },
      { id: "pv-250v-1p", label: "250 VDC PV, 1 pole", medium: "pv", maxVoltageV: 250, polesRequired: 1, wiring: "independent_conductors" }
    ],
    mounting: "din",
    applicationTags: ["industrial", "pv"],
    resetType: "toggle"
  },
  variants: [
    {
      id: "breaker-dc-breaker-250v-5a",
      currentRatingA: 5,
      msrpUsd: 21,
      oemPriceUsd: 15
    },
    {
      id: "breaker-dc-breaker-250v-10a",
      currentRatingA: 10,
      msrpUsd: 23,
      oemPriceUsd: 16
    },
    {
      id: "breaker-dc-breaker-250v-15a",
      currentRatingA: 15,
      msrpUsd: 24,
      oemPriceUsd: 17
    },
    {
      id: "breaker-dc-breaker-250v-20a",
      currentRatingA: 20,
      msrpUsd: 25,
      oemPriceUsd: 18
    },
    {
      id: "breaker-dc-breaker-250v-25a",
      currentRatingA: 25,
      msrpUsd: 26,
      oemPriceUsd: 18
    },
    {
      id: "breaker-dc-breaker-250v-30a",
      currentRatingA: 30,
      msrpUsd: 28,
      oemPriceUsd: 20
    },
    {
      id: "breaker-dc-breaker-250v-40a",
      currentRatingA: 40,
      msrpUsd: 30,
      oemPriceUsd: 21
    },
    {
      id: "breaker-dc-breaker-250v-50a",
      currentRatingA: 50,
      msrpUsd: 33,
      oemPriceUsd: 23
    },
    {
      id: "breaker-dc-breaker-250v-60a",
      currentRatingA: 60,
      msrpUsd: 35,
      oemPriceUsd: 25
    },
    {
      id: "breaker-dc-breaker-250v-70a",
      currentRatingA: 70,
      msrpUsd: 38,
      oemPriceUsd: 27
    },
    {
      id: "breaker-dc-breaker-250v-80a",
      currentRatingA: 80,
      msrpUsd: 40,
      oemPriceUsd: 28
    },
    {
      id: "breaker-dc-breaker-250v-100a",
      currentRatingA: 100,
      msrpUsd: 45,
      oemPriceUsd: 31
    },
    {
      id: "breaker-dc-breaker-250v-125a",
      currentRatingA: 125,
      msrpUsd: 51,
      oemPriceUsd: 36
    },
    {
      id: "breaker-dc-breaker-250v-150a",
      currentRatingA: 150,
      msrpUsd: 58,
      oemPriceUsd: 41
    },
    {
      id: "breaker-dc-breaker-250v-175a",
      currentRatingA: 175,
      msrpUsd: 64,
      oemPriceUsd: 45
    },
    {
      id: "breaker-dc-breaker-250v-200a",
      currentRatingA: 200,
      msrpUsd: 70,
      oemPriceUsd: 49
    },
    {
      id: "breaker-dc-breaker-250v-250a",
      currentRatingA: 250,
      msrpUsd: 83,
      oemPriceUsd: 58
    },
    {
      id: "breaker-dc-breaker-250v-300a",
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
      voltageMaxV: 250
    }
  ]
};

export default product;
