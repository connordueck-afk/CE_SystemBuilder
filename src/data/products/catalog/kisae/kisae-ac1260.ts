import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-ac1260",
  manufacturer: "KISAE",
  name: "ABSO AC Charger 12V 60A",
  productType: "shore_charger",
  category: "Charging",
  nominalVoltage: [
    12,
    24
  ],
  maxCurrentA: 60,
  capabilities: [
    "ac-charger",
    "battery-charger"
  ],
  description: "KISAE ABSO AC battery charger, 12V 60A.",
  partNumber: "AC1260",
  productUrl: "https://www.cdnrg.com/products/ac1260",
  source: "Canadian Energy product index",
  dataQuality: "partial",
  width: 90,
  height: 64,
  terminals: [
    {
      id: "ac_l",
      label: "AC L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      domain: "ac"
    },
    {
      id: "ac_n",
      label: "AC N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      domain: "ac"
    },
    {
      id: "dc_pos",
      label: "DC+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: -10,
      domain: "dc",
      requiresOvercurrentProtection: true
    },
    {
      id: "dc_neg",
      label: "DC-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 10,
      domain: "dc"
    }
  ],
  imageUrl: "/product-images/kisae-ac-charger.svg"
};

export default product;
