import type { Product } from '../../../../types/system';

const product: Product = {
  id: "temperature-sensor-quattro",
  manufacturer: "Victron",
  name: "Temperature Sensor for MultiPlus/Quattro",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 25,
  description: "Victron battery temperature sensor for MultiPlus/Quattro â€” enables temperature-compensated charging.",
  partNumber: "ASS000100000",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 60,
  height: 40,
  terminals: [
    {
      id: "signal",
      label: "Sensor",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -30,
      offsetY: 0,
      portId: "main"
    }
  ],
  ports: [
    {
      id: "main",
      kind: "signal",
      topology: "two_pole",
      label: "Main"
    }
  ]
};

export default product;
