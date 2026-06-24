import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-dlp-lithium-48-30",
  manufacturer: "Discover Battery",
  name: "DLP-GC2 51.2V/30Ah",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 48,
  capacityWh: 1536,
  maxCurrentA: 30,
  msrpUsd: 1250,
  description: "Discover DLP-GC2 battery 51.2V/30Ah with CAN communication",
  partNumber: "DLP-GC2-48V",
  productUrl: "https://www.cdnrg.com/products/dlp-gc2-48v",
  source: "Discover Battery 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 92,
  height: 98,
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
      offsetY: -45,
      domain: "dc",
      maxCurrentA: 30,
      requiresOvercurrentProtection: true,
      notes: "DC positive terminal. Requires overcurrent protection (fuse/breaker) on the positive conductor."
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
      offsetX: -26,
      offsetY: -45,
      domain: "dc",
      maxCurrentA: 30,
      notes: "DC negative terminal."
    }
  ],
  batteryRatings: {
    nominalVoltageV: 51.2,
    capacityAh: 30,
    capacityWh: 1536,
    capacityKwh: 1.54,
    maxDischargeCurrentA: 30,
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
