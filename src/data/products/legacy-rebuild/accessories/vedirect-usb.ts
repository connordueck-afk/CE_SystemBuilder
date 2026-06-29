import type { Product } from '../../../../types/system';

const product: Product = {
  id: "vedirect-usb",
  manufacturer: "Victron",
  name: "VE.Direct to USB Interface",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 34,
  description: "Victron VE.Direct to USB interface connects VE.Direct devices to a computer for monitoring and configuration.",
  partNumber: "ASS030530010",
  productUrl: "https://www.cdnrg.com/products/veass030530010",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Rebuilt as a VE.Direct to USB accessory placeholder with a single signal port.",
  width: 60,
  height: 40,
  terminalGroups: [
    { id: "main_iface", portId: "main", label: "VE.Direct Interface", groupType: "signal_interface", internallyCommon: false },
  ],
  terminals: [
    {
      id: "signal",
      label: "VE.Direct",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -30,
      offsetY: 0,
      connector: {
        kind: "comm",
      },
      notes: "VE.Direct communication adapter interface.",
      portId: "main",
      terminalGroupId: "main_iface",
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
