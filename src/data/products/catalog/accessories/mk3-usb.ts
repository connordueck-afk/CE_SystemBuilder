import type { Product } from '../../../../types/system';

const product: Product = {
  id: "mk3-usb",
  manufacturer: "Victron",
  name: "MK3-USB Interface",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 84,
  description: "Victron MK3-USB VE.Bus to USB interface for programming MultiPlus/Quattro from a PC.",
  partNumber: "ASS030140000",
  productUrl: "https://www.cdnrg.com/products/veass030140000",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
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
