import type { Product } from '../../../../types/system';

const product: Product = {
  id: "ve-bus-smart-dongle",
  manufacturer: "Victron",
  name: "VE.Bus Smart Dongle",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 115,
  description: "Victron VE.Bus Smart Dongle for Bluetooth monitoring/configuration.",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 60,
  height: 40,
  terminalGroups: [
    {
      id: "signal_iface",
      portId: "main",
      label: "VE.Bus Interface",
      groupType: "signal_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "signal",
      terminalGroupId: "signal_iface",
      label: "VE.Bus",
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
      label: "VE.Bus Interface",
      voltageClass: "signal_low_voltage",
      role: "control",
      direction: "bidirectional"
    }
  ]
};

export default product;
