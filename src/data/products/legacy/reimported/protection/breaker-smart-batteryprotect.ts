import type { Product } from '../../../../types/system';

const product: Product = {
  id: "breaker-smart-batteryprotect",
  manufacturer: "Generic",
  name: "Smart BatteryProtect",
  productType: "breaker",
  category: "Smart BatteryProtect",
  description: "Smart BatteryProtect DC protection device.",
  source: "Victron 2025",
  dataQuality: "placeholder",
  imageUrl: "/product-images/generic-breaker.svg",
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
        kind: "screw_terminal"
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
        kind: "screw_terminal"
      },
      portId: "main"
    }
  ],
  protectionRatings: {
    currentRatingA: 0,
    voltageRatingV: 34,
    acDcCompatibility: "dc",
    breakerStyle: "Smart BatteryProtect",
    protectionType: "breaker"
  },
  variants: [
    {
      id: "breaker-smart-batteryprotect-65a",
      currentRatingA: 65,
      msrpUsd: 80,
      oemPriceUsd: 56
    },
    {
      id: "breaker-smart-batteryprotect-100a",
      currentRatingA: 100,
      msrpUsd: 90,
      oemPriceUsd: 63
    },
    {
      id: "breaker-smart-batteryprotect-220a",
      currentRatingA: 220,
      msrpUsd: 126,
      oemPriceUsd: 88
    }
  ],
  ports: [
    {
      id: "main",
      kind: "dc",
      topology: "pass_through",
      label: "Main",
      maxCurrentA: 0,
      voltageMaxV: 34
    }
  ]
};

export default product;
