import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-bms",
  manufacturer: "Generic",
  name: "BMS",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 0,
  description: "Generic battery management system placeholder.",
  source: "User",
  dataQuality: "placeholder",
  width: 80,
  height: 60,
  terminalGroups: [
    {
      id: "signal_iface",
      portId: "main",
      label: "BMS Signal",
      groupType: "signal_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "signal",
      terminalGroupId: "signal_iface",
      label: "Signal",
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
      label: "BMS Signal",
      voltageClass: "signal_low_voltage",
      role: "control",
      direction: "bidirectional"
    }
  ]
};

export default product;
