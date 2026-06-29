import type { Product } from '../../../../types/system';

const product: Product = {
  id: "mk3-usb",
  manufacturer: "Victron",
  name: "MK3-USB Interface",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 84,
  description: "Victron MK3-USB interface for programming VE.Bus inverter-chargers from a PC.",
  partNumber: "ASS030140000",
  productUrl: "https://www.cdnrg.com/products/veass030140000",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Rebuilt as a single low-voltage communication interface for VE.Bus equipment.",
  width: 60,
  height: 40,
  terminalGroups: [
    { id: "main_iface", portId: "main", label: "VE.Bus Interface", groupType: "signal_interface", internallyCommon: false },
  ],
  terminals: [
    {
      id: "signal",
      terminalGroupId: "main_iface",
      label: "VE.Bus",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -30,
      offsetY: 0,
      connector: {
        kind: "comm",
      },
      notes: "VE.Bus communication interface.",
      portId: "main",
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
