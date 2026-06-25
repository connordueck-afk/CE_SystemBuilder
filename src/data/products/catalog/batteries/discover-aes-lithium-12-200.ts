import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-aes-lithium-12-200",
  manufacturer: "Discover Battery",
  name: "AES-B LiFePO4 12.8V/200Ah",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 12,
  capacityWh: 2560,
  maxCurrentA: 200,
  msrpUsd: 1495,
  description: "Discover AES-B LiFePO4 battery 12.8V/200Ah",
  partNumber: "AES-B-GC2-12V-H",
  productUrl: "https://www.cdnrg.com/products/aes-b-gc12-12v-h",
  source: "Discover Battery 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 112,
  height: 98,
  terminals: [
    {
      id: "dc_pos",
      label: "+",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: 44,
      offsetY: -47,
      maxCurrentA: 200,
      requiresOvercurrentProtection: true,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "DC positive terminal. Requires overcurrent protection (fuse/breaker) on the positive conductor."
    },
    {
      id: "dc_neg",
      label: "-",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: -44,
      offsetY: -47,
      maxCurrentA: 200,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "DC negative terminal."
    }
  ],
  batteryRatings: {
    nominalVoltageV: 12.8,
    capacityAh: 200,
    capacityWh: 2560,
    capacityKwh: 2.56,
    maxDischargeCurrentA: 200,
    chemistry: "LiFePO4",
    hasInternalBms: true,
    seriesAllowed: false,
    parallelAllowed: true
  }
};

export default product;
