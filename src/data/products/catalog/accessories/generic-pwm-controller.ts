import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-pwm-controller",
  manufacturer: "Generic",
  name: "PWM Charge Controller",
  productType: "accessory",
  category: "Solar",
  nominalVoltage: [
    12,
    24
  ],
  maxCurrentA: 30,
  maxPvVoltageV: 50,
  msrpUsd: 0,
  description: "Generic PWM solar charge controller placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 90,
  height: 70,
  terminals: [
    {
      id: "pv_pos",
      label: "PV+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "sink",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -45,
      offsetY: -18,
      domain: "pv"
    },
    {
      id: "pv_neg",
      label: "PV-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "sink",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -45,
      offsetY: 0,
      domain: "pv"
    },
    {
      id: "bat_pos",
      label: "Bat+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 45,
      offsetY: -10,
      domain: "dc"
    },
    {
      id: "bat_neg",
      label: "Bat-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 45,
      offsetY: 10,
      domain: "dc"
    }
  ]
};

export default product;
