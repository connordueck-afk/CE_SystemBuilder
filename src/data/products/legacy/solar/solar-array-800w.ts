import type { Product } from '../../../../types/system';

const product: Product = {
  id: "solar-array-800w",
  manufacturer: "Generic",
  name: "Solar Array 800W",
  productType: "solar_array",
  category: "Solar",
  continuousPowerW: 800,
  maxPvVoltageV: 80,
  maxPvCurrentA: 10,
  msrpUsd: 640,
  oemPriceUsd: 448,
  description: "800W solar array placeholder (2x 400W panels)",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 120,
  height: 80,
  terminals: [
    {
      id: "pv_pos",
      label: "PV+",
      polarity: "positive",
      role: "source",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: 25,
      offsetY: 40,
      connector: {
        kind: "mc4",
        gender: "male"
      },
      notes: "PV array positive output.",
      portId: "pv"
    },
    {
      id: "pv_neg",
      label: "PV-",
      polarity: "negative",
      role: "source",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: -25,
      offsetY: 40,
      connector: {
        kind: "mc4",
        gender: "female"
      },
      notes: "PV array negative output.",
      portId: "pv"
    }
  ],
  solarPanelRatings: {
    vocV: 80,
    vmpV: 68,
    iscA: 12,
    impA: 10,
    powerW: 800
  },
  ports: [
    {
      id: "pv",
      kind: "pv",
      topology: "two_pole",
      label: "PV",
      voltageMaxV: 80,
      maxCurrentA: 12,
      maxPowerW: 800
    }
  ]
};

export default product;
