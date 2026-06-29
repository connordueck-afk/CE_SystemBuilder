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
  notes: "Rebuilt as a system monitoring and control hub with explicit communication ports for VE.Bus, VE.Can, VE.Direct, and Ethernet.",
  width: 80,
  height: 60,
  terminalGroups: [
    { id: "main_iface", portId: "main", label: "System Control Interface", groupType: "signal_interface", internallyCommon: false },
  ],
  terminals: [
    {
      id: "signal",
      label: "Signal",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      connector: {
        kind: "comm",
      },
      notes: "General system control and signal interface.",
      portId: "main",
      terminalGroupId: "main_iface",
    },
  ],
  communicationPorts: [
    {
      id: "ve_bus",
      name: "VE.Bus",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Bus",
      ],
      configuredProtocol: "VE.Bus",
    },
    {
      id: "ve_can",
      name: "VE.Can",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Can",
      ],
      configuredProtocol: "VE.Can",
    },
    {
      id: "ve_direct",
      name: "VE.Direct",
      connectorType: "VE.Direct",
      supportedProtocols: [
        "VE.Direct",
      ],
      configuredProtocol: "VE.Direct",
    },
    {
      id: "ethernet",
      name: "Ethernet",
      connectorType: "RJ45",
      supportedProtocols: [
        "Ethernet",
      ],
      configuredProtocol: "Ethernet",
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
