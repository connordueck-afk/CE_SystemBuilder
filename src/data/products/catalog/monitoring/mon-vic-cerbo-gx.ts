import type { Product } from '../../../../types/system';

const product: Product = {
  id: "mon-vic-cerbo-gx",
  manufacturer: "Victron",
  name: "Cerbo GX",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 329,
  oemPriceUsd: 230,
  description: "Victron Cerbo GX system monitoring and control hub with VRM.",
  partNumber: "BPP900450100",
  productUrl: "https://www.cdnrg.com/products/vebpp900450100",
  source: "Victron 2024",
  dataQuality: "complete",
  width: 80,
  height: 60,
  terminalGroups: [
    {
      id: "signal_iface",
      portId: "main",
      label: "System Communications",
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
      label: "System Communications",
      voltageClass: "signal_low_voltage",
      role: "control",
      direction: "bidirectional"
    }
  ]
};

export default product;
