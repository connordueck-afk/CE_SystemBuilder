import type { Product } from '../../../../types/system';

const product: Product = {
  id: "acc-ac-load-generic",
  manufacturer: "Generic",
  name: "AC Load (generic)",
  productType: "ac_load",
  category: "Loads",
  continuousPowerW: 1000,
  msrpUsd: 0,
  description: "Generic AC load placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 80,
  height: 60,
  terminalGroups: [
    {
      id: "ac_in_l",
      portId: "ac_in",
      label: "AC Input Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    },
    {
      id: "ac_in_n",
      portId: "ac_in",
      label: "AC Input Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "ac_l",
      terminalGroupId: "ac_in_l",
      label: "AC L",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      notes: "AC Line conductor input."
    },
    {
      id: "ac_n",
      terminalGroupId: "ac_in_n",
      label: "AC N",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      notes: "AC Neutral conductor input."
    }
  ],
  loadRatings: {
    powerW: 1000
  },
  ports: [
    {
      id: "ac_in",
      kind: "ac",
      topology: "two_pole",
      label: "AC Input",
      voltageClass: "ac_120v",
      nominalVoltageV: 120,
      maxPowerW: 1000,
      role: "sink",
      direction: "input"
    }
  ]
};

export default product;
