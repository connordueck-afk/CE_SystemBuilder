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
  notes: "Rebuilt as a low-voltage signal interface placeholder for battery management functions.",
  width: 80,
  height: 60,
  terminalGroups: [
    { id: "signal_iface", portId: "main", label: "Signal Interface", groupType: "signal_interface", internallyCommon: false },
  ],
  terminals: [
    {
      id: "signal",
      terminalGroupId: "signal_iface",
      label: "Signal",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      portId: "main",
      notes: "Low-voltage control / sense signal connection.",
    },
  ],
  ports: [
    {
      id: "main",
      kind: "signal",
      topology: "two_pole",
      label: "Main",
      voltageClass: "signal_low_voltage",
    },
  ],
};

export default product;
