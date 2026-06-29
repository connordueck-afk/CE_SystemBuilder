import type { Product } from '../../../../types/system';

const product: Product = {
  id: "acc-dc-load-generic",
  manufacturer: "Generic",
  name: "DC Load (generic)",
  productType: "dc_load",
  category: "Loads",
  continuousPowerW: 100,
  msrpUsd: 0,
  description: "Generic DC load placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 80,
  height: 60,
  terminalGroups: [
    {
      id: "dc_in_pos",
      portId: "dc_in",
      label: "DC Input Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false
    },
    {
      id: "dc_in_neg",
      portId: "dc_in",
      label: "DC Input Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "dc_pos",
      terminalGroupId: "dc_in_pos",
      label: "DC+",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      notes: "DC positive input."
    },
    {
      id: "dc_neg",
      terminalGroupId: "dc_in_neg",
      label: "DC-",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      notes: "DC negative input."
    }
  ],
  loadRatings: {
    powerW: 100
  },
  ports: [
    {
      id: "dc_in",
      kind: "dc",
      topology: "two_pole",
      label: "DC Input",
      voltageClass: "dc_low_voltage",
      maxPowerW: 100,
      role: "sink",
      direction: "input"
    }
  ]
};

export default product;
