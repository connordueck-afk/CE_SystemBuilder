import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-agm-battery",
  manufacturer: "Generic",
  name: "AGM Battery",
  productType: "battery",
  category: "Batteries",
  capacityWh: 1200,
  maxCurrentA: 100,
  msrpUsd: 0,
  description: "Generic AGM battery placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 90,
  height: 86,
  terminals: [
    {
      id: "dc_pos",
      label: "+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: 22,
      offsetY: -43,
      domain: "dc",
      requiresOvercurrentProtection: true,
      maxCurrentA: 100
    },
    {
      id: "dc_neg",
      label: "-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: -22,
      offsetY: -43,
      domain: "dc",
      maxCurrentA: 100
    }
  ],
  batteryRatings: {
    nominalVoltageV: 12,
    capacityAh: 100,
    capacityWh: 1200,
    capacityKwh: 1.2,
    chemistry: "AGM",
    hasInternalBms: false,
    seriesAllowed: true,
    maxSeriesCount: 4,
    parallelAllowed: true
  }
};

export default product;
