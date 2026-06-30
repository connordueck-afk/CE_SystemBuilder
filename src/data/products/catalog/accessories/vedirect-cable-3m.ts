import type { Product } from '../../../../types/system';

const product: Product = {
  id: "vedirect-cable-3m",
  manufacturer: "Victron",
  name: "VE.Direct Cable 3m",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 18,
  description: "Victron VE.Direct cable, 3 m.",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 60,
  height: 40,
  terminalGroups: [
    {
      id: "signal_iface",
      portId: "main",
      label: "VE.Direct Interface",
      groupType: "signal_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "signal",
      terminalGroupId: "signal_iface",
      label: "VE.Direct",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      connector: {
        kind: "comm"
      }
    }
  ],
  ports: [
    {
      id: "main",
      kind: "signal",
      topology: "two_pole",
      label: "VE.Direct Interface",
      voltageClass: "signal_low_voltage",
      role: "control",
      direction: "bidirectional"
    }
  ]
};

export default product;
