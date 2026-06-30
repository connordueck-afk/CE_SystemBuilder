import type { Product } from '../../../../types/system';

const product: Product = {
  id: "gx-touch-50",
  manufacturer: "Victron",
  name: "GX Touch 50 Display",
  productType: "accessory",
  category: "Monitoring",
  msrpUsd: 269,
  description: "Victron GX Touch 50 5-inch touchscreen display for Cerbo GX using HDMI/USB connection.",
  partNumber: "BPP900455050",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs from legacy catalog. Requires Cerbo GX.",
  width: 80,
  height: 60,
  terminalGroups: [
    { id: "display_iface", portId: "display", label: "Display Interface", groupType: "signal_interface", internallyCommon: false }
  ],
  terminals: [
    { id: "display", terminalGroupId: "display_iface", label: "Display", side: "left", offsetX: -40, offsetY: 0, connector: { kind: "comm" }, notes: "HDMI/USB display connection to a GX device." }
  ],
  ports: [
    { id: "display", kind: "signal", topology: "two_pole", label: "Display", voltageClass: "signal_low_voltage", role: "control", direction: "bidirectional" }
  ]
};

export default product;
