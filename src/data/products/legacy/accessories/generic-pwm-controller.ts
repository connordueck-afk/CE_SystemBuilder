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
      polarity: "positive",
      role: "sink",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -45,
      offsetY: -18,
      portId: "pv"
    },
    {
      id: "pv_neg",
      label: "PV-",
      polarity: "negative",
      role: "sink",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -45,
      offsetY: 0,
      portId: "pv"
    },
    {
      id: "bat_pos",
      label: "Bat+",
      polarity: "positive",
      role: "source",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 45,
      offsetY: -10,
      portId: "dc_out"
    },
    {
      id: "bat_neg",
      label: "Bat-",
      polarity: "negative",
      role: "source",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 45,
      offsetY: 10,
      portId: "dc_out"
    }
  ],
  ports: [
    {
      id: "pv",
      kind: "pv",
      topology: "two_pole",
      label: "PV"
    },
    {
      id: "dc_out",
      kind: "dc",
      topology: "two_pole",
      label: "DC Output"
    }
  ]
};

export default product;
