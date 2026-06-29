import type { Product } from '../../../../types/system';

const product: Product = {
  id: "temperature-sensor-quattro",
  manufacturer: "Victron",
  name: "Temperature Sensor for MultiPlus/Quattro",
  productType: "accessory",
  category: "Accessories",
  msrpUsd: 25,
  description: "Victron battery temperature sensor for MultiPlus/Quattro enables temperature-compensated charging.",
  partNumber: "ASS000100000",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Rebuilt as a low-voltage sensor accessory placeholder with an explicit signal port.",
  width: 60,
  height: 40,
  terminalGroups: [
    { id: "main_iface", portId: "main", label: "Sensor Interface", groupType: "signal_interface", internallyCommon: false },
  ],
  terminals: [
    {
      id: "signal",
      label: "Sensor",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -30,
      offsetY: 0,
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
