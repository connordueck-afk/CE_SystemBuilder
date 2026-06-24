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
  terminals: [
    {
      id: "pv_pos",
      label: "PV+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "source",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: 25,
      offsetY: 40,
      domain: "pv",
      connector: {
        kind: "mc4_male"
      },
      notes: "PV array positive output."
    },
    {
      id: "pv_neg",
      label: "PV-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "source",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: -25,
      offsetY: 40,
      domain: "pv",
      connector: {
        kind: "mc4_female"
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
  }
};

export default product;
