import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-aes-rackmount-48-42-5120",
  manufacturer: "Discover Battery",
  name: "AES Rackmount 51.2V/100Ah",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 48,
  capacityWh: 5120,
  maxCurrentA: 100,
  msrpUsd: 3400,
  description: "Discover AES Rackmount LiFePO4 battery 51.2V/100Ah â€” CAN/RS485 communication. Confirm communication profile and closed-loop compatibility per inverter setup.",
  partNumber: "48-42-5120",
  productUrl: "https://www.cdnrg.com/products/48-48-5120-h",
  source: "Discover Battery 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs. Confirm communication profile and closed-loop compatibility per inverter setup.",
  width: 80,
  height: 100,
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
      offsetX: 20,
      offsetY: -50,
      maxCurrentA: 100,
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
      offsetX: -20,
      offsetY: -50,
      maxCurrentA: 100,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "DC negative terminal."
    }
  ],
  batteryRatings: {
    nominalVoltageV: 51.2,
    capacityAh: 100,
    capacityWh: 5120,
    capacityKwh: 5.12,
    maxDischargeCurrentA: 100,
    chemistry: "LiFePO4",
    communicationInterfaces: [
      "CAN",
      "RS485"
    ],
    hasInternalBms: true,
    seriesAllowed: false,
    parallelAllowed: true
  }
};

export default product;
