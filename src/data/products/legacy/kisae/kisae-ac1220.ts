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
      polarity: "line",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      portId: "ac_in"
    },
    {
      id: "ac_n",
      label: "AC N",
      polarity: "neutral",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      portId: "ac_in"
    },
    {
      id: "dc_pos",
      label: "DC+",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: -10,
      requiresOvercurrentProtection: true,
      portId: "dc_out"
    },
    {
      id: "dc_neg",
      label: "DC-",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 10,
      portId: "dc_out"
    }
  ],
  imageUrl: "/product-images/kisae-ac-charger.svg",
  ports: [
    {
      id: "ac_in",
      kind: "ac",
      topology: "two_pole",
      label: "AC Input"
    },
    {
      id: "dc_out",
      kind: "dc",
      topology: "two_pole",
      label: "DC Output",
      nominalVoltageV: 12,
      maxCurrentA: 20
    }
  ]
};

export default product;
