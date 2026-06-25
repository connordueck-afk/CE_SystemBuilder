import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-dlp-lithium-24-60",
  manufacturer: "Discover Battery",
  name: "DLP-GC2 25.6V/60Ah",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 24,
  capacityWh: 1536,
  maxCurrentA: 60,
  msrpUsd: 1250,
  description: "Discover DLP-GC2 battery 25.6V/60Ah with CAN communication",
  partNumber: "DLP-GC2-24V",
  productUrl: "https://www.cdnrg.com/products/dlp-gc2-24v",
  source: "Discover Battery 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 92,
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
      offsetX: 22,
      offsetY: -45,
      maxCurrentA: 60,
      requiresOvercurrentProtection: true,
      connector: { kind: 'stud', holeSize: 'M6' },
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
      offsetX: -26,
      offsetY: -45,
      maxCurrentA: 60,
      connector: { kind: 'stud', holeSize: 'M6' },
      notes: "DC negative terminal."
    }
  ],
  batteryRatings: {
    nominalVoltageV: 25.6,
    capacityAh: 60,
    capacityWh: 1536,
    capacityKwh: 1.54,
    maxDischargeCurrentA: 60,
    chemistry: "LiFePO4",
    communicationInterfaces: [
      "CAN"
    ],
    hasInternalBms: true,
    seriesAllowed: false,
    parallelAllowed: true
  }
};

export default product;
