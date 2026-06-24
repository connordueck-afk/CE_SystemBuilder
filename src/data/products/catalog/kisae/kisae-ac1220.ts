import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-ac1220",
  manufacturer: "KISAE",
  name: "ABSO AC Charger 12V 20A",
  productType: "shore_charger",
  category: "Charging",
  nominalVoltage: 12,
  maxCurrentA: 20,
  capabilities: [
    "ac-charger",
    "battery-charger"
  ],
  description: "KISAE ABSO smart multi-stage AC battery charger, 12V 20A.",
  partNumber: "AC1220",
  productUrl: "https://www.kisaepower.com/products/ac1220/",
  source: "kisaepower.com",
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
