import type { Product } from '../../../../types/system';

const product: Product = {
  id: "vedirect-cable-3m",
  manufacturer: "Victron",
  name: "VE.Direct Cable 3m",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 18,
  description: "Victron VE.Direct cable 3m connects VE.Direct devices to Cerbo GX or other VE.Direct interfaces.",
  partNumber: "ASS030531130",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Rebuilt as a VE.Direct cable placeholder with a single signal port.",
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
      notes: "VE.Direct communication cable interface.",
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
