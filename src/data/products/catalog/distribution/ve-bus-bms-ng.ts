import type { Product } from '../../../../types/system';

const product: Product = {
  id: "ve-bus-bms-ng",
  manufacturer: "Victron",
  name: "VE.Bus BMS NG",
  productType: "dc_distribution",
  category: "Distribution",
  nominalVoltage: [
    12,
    24,
    48
  ],
  msrpUsd: 260,
  description: "Victron VE.Bus BMS NG — battery management system for Victron Lithium NG batteries. VE.Bus / Bluetooth.",
  partNumber: "VE.Bus BMS NG",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.",
  width: 80,
  height: 60,
  terminals: [
    {
      id: "bat_pos",
      label: "Bat+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0
    },
    {
      id: "signal",
      label: "VE.Bus",
      electricalType: "signal",
      kind: "signal",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 0
    }
  ]
};

export default product;
