import type { Product } from '../../../../types/system';

const product: Product = {
  id: "breaker-dc-breaker-25a",
  manufacturer: "Generic",
  name: "DC Breaker 25A",
  productType: "breaker",
  category: "DC Breaker",
  maxCurrentA: 25,
  msrpUsd: 26,
  oemPriceUsd: 18,
  description: "DC Breaker 25A DC protection",
  source: "Catalog estimate: DC circuit breakers",
  dataQuality: "placeholder",
  imageUrl: "/product-images/breaker-dc-breaker.svg",
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
    currentRatingA: 25,
    voltageRatingV: 48,
    acDcCompatibility: "dc",
    breakerStyle: "DC Breaker",
    protectionType: "breaker"
  }
};

export default product;
