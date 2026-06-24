import type { Product } from '../../../../types/system';

const product: Product = {
  id: "breaker-ac-din-3p-25a",
  manufacturer: "Generic",
  name: "AC DIN Breaker 3P 25A",
  productType: "breaker",
  category: "AC DIN 3P",
  maxCurrentA: 25,
  msrpUsd: 48,
  oemPriceUsd: 34,
  description: "Generic 3-pole AC DIN rail miniature circuit breaker, 25A.",
  source: "Catalog estimate: AC DIN rail breakers",
  dataQuality: "placeholder",
  imageUrl: "/product-images/breaker-ac-din-3p.svg",
  width: 120,
  height: 120,
  terminals: [
    {
      id: "l1_in",
      label: "L1 In",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "pass_through",
      voltageClass: "ac_120v",
      domain: "ac",
      phases: 3,
      conductorCount: 3,
      maxCurrentA: 25,
      connector: {
        kind: "screw_terminal"
      },
      direction: "input",
      side: "top",
      offsetX: -27.333333333333336,
      offsetY: -40.66666666666667,
      notes: "Line-side AC pole 1 terminal."
    },
    {
      id: "l1_out",
      label: "L1 Out",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "pass_through",
      voltageClass: "ac_120v",
      domain: "ac",
      phases: 3,
      conductorCount: 3,
      maxCurrentA: 25,
      connector: {
        kind: "screw_terminal"
      },
      direction: "output",
      side: "bottom",
      offsetX: -27.333333333333336,
      offsetY: 38.666666666666664,
      notes: "Load-side AC pole 1 terminal."
    },
    {
      id: "l2_in",
      label: "L2 In",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "pass_through",
      voltageClass: "ac_120v",
      domain: "ac",
      phases: 3,
      conductorCount: 3,
      maxCurrentA: 25,
      connector: {
        kind: "screw_terminal"
      },
      direction: "input",
      side: "top",
      offsetX: 0,
      offsetY: -40.66666666666667,
      notes: "Line-side AC pole 2 terminal."
    },
    {
      id: "l2_out",
      label: "L2 Out",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "pass_through",
      voltageClass: "ac_120v",
      domain: "ac",
      phases: 3,
      conductorCount: 3,
      maxCurrentA: 25,
      connector: {
        kind: "screw_terminal"
      },
      direction: "output",
      side: "bottom",
      offsetX: 0,
      offsetY: 38.666666666666664,
      notes: "Load-side AC pole 2 terminal."
    },
    {
      id: "l3_in",
      label: "L3 In",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "pass_through",
      voltageClass: "ac_120v",
      domain: "ac",
      phases: 3,
      conductorCount: 3,
      maxCurrentA: 25,
      connector: {
        kind: "screw_terminal"
      },
      direction: "input",
      side: "top",
      offsetX: 27.33333333333333,
      offsetY: -40.66666666666667,
      notes: "Line-side AC pole 3 terminal."
    },
    {
      id: "l3_out",
      label: "L3 Out",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "pass_through",
      voltageClass: "ac_120v",
      domain: "ac",
      phases: 3,
      conductorCount: 3,
      maxCurrentA: 25,
      connector: {
        kind: "screw_terminal"
      },
      direction: "output",
      side: "bottom",
      offsetX: 27.33333333333333,
      offsetY: 38.666666666666664,
      notes: "Load-side AC pole 3 terminal."
    }
  ],
  protectionRatings: {
    currentRatingA: 25,
    voltageRatingV: 480,
    interruptRatingA: 6000,
    acDcCompatibility: "ac",
    breakerStyle: "AC DIN 3P",
    protectionType: "breaker"
  }
};

export default product;
