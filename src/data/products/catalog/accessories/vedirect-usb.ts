import type { Product } from '../../../../types/system';

const product: Product = {
  id: "vedirect-usb",
  manufacturer: "Victron",
  name: "VE.Direct to USB Interface",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 34,
  description: "Victron VE.Direct to USB interface.",
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
