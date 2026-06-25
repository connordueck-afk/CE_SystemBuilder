import type { Product } from '../../../../types/system';

const product: Product = {
  id: "buck-boost-100",
  manufacturer: "Victron",
  name: "Buck-Boost 100A DC-DC Converter",
  productType: "dc_dc_charger",
  category: "Charging",
  nominalVoltage: [
    12,
    24
  ],
  maxCurrentA: 100,
  continuousPowerW: 1200,
  msrpUsd: 1440,
  description: "Victron 100A Buck-Boost bi-directional DC-DC converter � CAN-bus",
  partNumber: "ORI303100000",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 86,
  height: 80,
  terminals: [
    {
      id: "in_pos",
      label: "In+",
      kind: "dc_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -16,
      offsetY: 24,
      requiresOvercurrentProtection: true,
      connector: { kind: 'screw_terminal' },
      notes: "DC input positive. Fuse required on input positive conductor."
    },
    {
      id: "in_neg",
      label: "In-",
      kind: "dc_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -5,
      offsetY: 24,
      connector: { kind: 'screw_terminal' },
      notes: "DC input negative."
    },
    {
      id: "out_pos",
      label: "Out+",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 5,
      offsetY: 24,
      requiresOvercurrentProtection: true,
      maxCurrentA: 100,
      connector: { kind: 'screw_terminal' },
      notes: "DC output positive. Fuse required on output positive conductor."
    },
    {
      id: "out_neg",
      label: "Out-",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 16,
      offsetY: 24,
      maxCurrentA: 100,
      connector: { kind: 'screw_terminal' },
      notes: "DC output negative."
    }
  ],
  dcDcChargerRatings: {
    outputCurrentA: 100,
    outputPowerW: 1200,
    isolated: false
  }
};

export default product;
