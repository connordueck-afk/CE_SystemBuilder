import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-ac2450",
  manufacturer: "KISAE",
  name: "ABSO AC Charger 24V 50A",
  productType: "shore_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 50,
  capabilities: [
    "ac-charger",
    "battery-charger"
  ],
  description: "KISAE ABSO AC battery charger, 24V 50A.",
  partNumber: "AC2450",
  productUrl: "https://www.cdnrg.com/products/ac2450",
  source: "Canadian Energy product index",
  dataQuality: "partial",
  width: 90,
  height: 64,
  terminals: [
    {
      id: "ac_l",
      label: "AC L",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: -10,
    },
    {
      id: "ac_n",
      label: "AC N",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 10,
    },
    {
      id: "dc_pos",
      label: "DC+",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: -10,
      requiresOvercurrentProtection: true
    },
    {
      id: "dc_neg",
      label: "DC-",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 10,
    }
  ],
  imageUrl: "/product-images/kisae-ac-charger.svg"
};

export default product;
