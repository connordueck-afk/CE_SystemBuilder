import type { Product } from '../../../../types/system';

const product: Product = {
  id: "temperature-sensor-quattro",
  manufacturer: "Victron",
  name: "Temperature Sensor for MultiPlus/Quattro",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 25,
  description: "Temperature sensor for Victron MultiPlus/Quattro charging compensation.",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 60,
  height: 40,
  terminalGroups: [
    {
      id: "signal_iface",
      portId: "main",
      label: "Temperature Sensor",
      groupType: "signal_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "signal",
      terminalGroupId: "signal_iface",
      label: "Sensor",
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
      label: "Temperature Sensor",
      voltageClass: "signal_low_voltage",
      role: "control",
      direction: "bidirectional"
    }
  ]
};

export default product;
