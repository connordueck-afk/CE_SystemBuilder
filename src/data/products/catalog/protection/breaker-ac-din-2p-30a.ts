import type { Product } from '../../../../types/system';

const product: Product = {
  id: "breaker-ac-din-2p-30a",
  manufacturer: "Generic",
  name: "AC DIN Breaker 2P 30A",
  productType: "breaker",
  category: "AC DIN 2P",
  maxCurrentA: 30,
  msrpUsd: 36,
  oemPriceUsd: 25,
  description: "Generic 2-pole AC DIN rail miniature circuit breaker, 30A.",
  source: "Catalog estimate: AC DIN rail breakers",
  dataQuality: "placeholder",
  imageUrl: "/product-images/breaker-ac-din-2p.svg",
  width: 84,
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
      phases: 2,
      conductorCount: 2,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      },
      direction: "input",
      side: "top",
      offsetX: -12.600000000000001,
      offsetY: -41.666666666666664,
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
      phases: 2,
      conductorCount: 2,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      },
      direction: "output",
      side: "bottom",
      offsetX: -12.600000000000001,
      offsetY: 42,
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
      phases: 2,
      conductorCount: 2,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      },
      direction: "input",
      side: "top",
      offsetX: 12.600000000000001,
      offsetY: -41.666666666666664,
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
      phases: 2,
      conductorCount: 2,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      },
      direction: "output",
      side: "bottom",
      offsetX: 12.600000000000001,
      offsetY: 42,
      notes: "Load-side AC pole 2 terminal."
    }
  ],
  protectionRatings: {
    currentRatingA: 30,
    voltageRatingV: 480,
    interruptRatingA: 6000,
    acDcCompatibility: "ac",
    breakerStyle: "AC DIN 2P",
    protectionType: "breaker"
  }
};

export default product;
