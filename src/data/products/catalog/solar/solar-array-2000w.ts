import type { Product } from '../../../../types/system';

const product: Product = {
  id: "solar-array-2000w",
  manufacturer: "Generic",
  name: "Solar Array 2000W",
  productType: "solar_array",
  category: "Solar",
  continuousPowerW: 2000,
  maxPvVoltageV: 200,
  maxPvCurrentA: 10,
  msrpUsd: 1600,
  oemPriceUsd: 1120,
  description: "2000W solar array placeholder (5x 400W panels)",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 120,
  height: 80,
  terminalGroups: [
    {
      id: "pv_pos",
      portId: "pv",
      label: "PV Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 12
    },
    {
      id: "pv_neg",
      portId: "pv",
      label: "PV Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 12
    }
  ],
  terminals: [
    {
      id: "pv_pos",
      terminalGroupId: "pv_pos",
      label: "PV+",
      side: "bottom",
      offsetX: 25,
      offsetY: 40,
      connector: {
        kind: "mc4",
        gender: "male"
      },
      notes: "PV array positive output."
    },
    {
      id: "pv_neg",
      terminalGroupId: "pv_neg",
      label: "PV-",
      side: "bottom",
      offsetX: -25,
      offsetY: 40,
      connector: {
        kind: "mc4",
        gender: "female"
      },
      notes: "PV array negative output."
    }
  ],
  solarPanelRatings: {
    vocV: 200,
    vmpV: 170,
    iscA: 12,
    impA: 10,
    powerW: 2000
  },
  ports: [
    {
      id: "pv",
      kind: "pv",
      topology: "two_pole",
      label: "PV",
      voltageClass: "pv_high_voltage",
      voltageMaxV: 200,
      maxCurrentA: 12,
      maxPowerW: 2000,
      role: "source",
      direction: "output"
    }
  ]
};

export default product;
