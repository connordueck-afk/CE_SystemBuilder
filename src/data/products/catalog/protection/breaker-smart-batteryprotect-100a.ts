import type { Product } from '../../../../types/system';

const product: Product = {
  id: "breaker-smart-batteryprotect-100a",
  manufacturer: "Generic",
  name: "Smart BatteryProtect 100A",
  productType: "breaker",
  category: "Smart BatteryProtect",
  maxCurrentA: 100,
  msrpUsd: 90,
  oemPriceUsd: 63,
  description: "Smart BatteryProtect 100A DC protection",
  source: "Victron 2025",
  dataQuality: "placeholder",
  imageUrl: "/product-images/generic-breaker.svg",
  width: 80,
  height: 34,
  terminals: [
    {
      id: "in",
      label: "A",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      domain: "dc"
    },
    {
      id: "out",
      label: "B",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 0,
      domain: "dc"
    }
  ],
  protectionRatings: {
    currentRatingA: 100,
    voltageRatingV: 34,
    acDcCompatibility: "dc",
    breakerStyle: "Smart BatteryProtect",
    protectionType: "breaker"
  }
};

export default product;
