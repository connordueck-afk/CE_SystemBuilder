import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-bms",
  manufacturer: "Generic",
  name: "BMS",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 0,
  description: "Generic battery management system placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 80,
  height: 60,
  terminals: [
    {
      id: "signal",
      label: "Signal",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -40,
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
