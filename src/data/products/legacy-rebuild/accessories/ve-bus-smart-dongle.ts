import type { Product } from '../../../../types/system';

const product: Product = {
  id: "ve-bus-smart-dongle",
  manufacturer: "Victron",
  name: "VE.Bus Smart Dongle",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 115,
  description: "Victron VE.Bus Smart Dongle adds Bluetooth monitoring to MultiPlus/Quattro inverter-chargers without a GX device.",
  partNumber: "ASS030537010",
  productUrl: "https://www.cdnrg.com/products/veass030537010",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Rebuilt as a VE.Bus communication accessory placeholder with a single signal port.",
  width: 60,
  height: 40,
  terminalGroups: [
    { id: "main_iface", portId: "main", label: "VE.Bus Interface", groupType: "signal_interface", internallyCommon: false },
  ],
  terminals: [
    {
      id: "signal",
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
