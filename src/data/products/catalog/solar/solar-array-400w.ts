import type { Product } from '../../../../types/system';

const product: Product = {
  id: "solar-array-400w",
  manufacturer: "Generic",
  name: "Solar Array 400W",
  productType: "solar_array",
  category: "Solar",
  continuousPowerW: 400,
  maxPvVoltageV: 40,
  maxPvCurrentA: 10,
  msrpUsd: 320,
  oemPriceUsd: 224,
  description: "400W solar array placeholder (1x 400W panel)",
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
    vocV: 40,
    vmpV: 34,
    iscA: 12,
    impA: 10,
    powerW: 400
  }
};

export default product;
