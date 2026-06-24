import type { Product } from '../../../../types/system';

const product: Product = {
  id: "breaker-ac-din-1p-10a",
  manufacturer: "Generic",
  name: "AC DIN Breaker 1P 10A",
  productType: "breaker",
  category: "AC DIN 1P",
  maxCurrentA: 10,
  msrpUsd: 15,
  oemPriceUsd: 11,
  description: "Generic 1-pole AC DIN rail miniature circuit breaker, 10A.",
  source: "Catalog estimate: AC DIN rail breakers",
  dataQuality: "placeholder",
  imageUrl: "/product-images/breaker-ac-din-1p.svg",
  width: 48,
  height: 120,
  terminals: [
    {
      id: "l1_in",
      label: "Line In",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "pass_through",
      voltageClass: "ac_120v",
      domain: "ac",
      phases: 1,
      conductorCount: 1,
      maxCurrentA: 10,
      connector: {
        kind: "screw_terminal"
      },
      direction: "input",
      side: "top",
      offsetX: 0,
      offsetY: -41.666666666666664,
      notes: "Line-side AC pole 1 terminal."
    },
    {
      id: "l1_out",
      label: "Line Out",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "pass_through",
      voltageClass: "ac_120v",
      domain: "ac",
      phases: 1,
      conductorCount: 1,
      maxCurrentA: 10,
      connector: {
        kind: "screw_terminal"
      },
      direction: "output",
      side: "bottom",
      offsetX: 0,
      offsetY: 42,
      notes: "Load-side AC pole 1 terminal."
    }
  ],
  protectionRatings: {
    currentRatingA: 10,
    voltageRatingV: 277,
    interruptRatingA: 6000,
    acDcCompatibility: "ac",
    breakerStyle: "AC DIN 1P",
    protectionType: "breaker"
  }
};

export default product;
