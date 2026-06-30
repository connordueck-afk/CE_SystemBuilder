import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-ac1220",
  manufacturer: "KISAE",
  name: "ABSO AC Charger 12V 20A",
  productType: "shore_charger",
  category: "Charging",
  nominalVoltage: 12,
  maxCurrentA: 20,
  msrpUsd: 0,
  capabilities: ["ac-charger", "battery-charger"],
  description: "KISAE ABSO smart multi-stage AC battery charger, 12V 20A.",
  partNumber: "AC1220",
  productUrl: "https://www.kisaepower.com/products/ac1220/",
  source: "kisaepower.com",
  dataQuality: "partial",
  imageUrl: "/product-images/kisae-ac-charger.svg",
  width: 90,
  height: 64,
  terminalGroups: [
    {
      id: "ac_l",
      portId: "ac_in",
      label: "AC Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    },
    {
      id: "ac_n",
      portId: "ac_in",
      label: "AC Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false
    },
    {
      id: "dc_pos",
      portId: "dc_out",
      label: "DC Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 20,
      requiresOvercurrentProtection: true
    },
    {
      id: "dc_neg",
      portId: "dc_out",
      label: "DC Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 20
    }
  ],
  terminals: [
    {
      id: "ac_l",
      terminalGroupId: "ac_l",
      label: "AC L",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_n",
      terminalGroupId: "ac_n",
      label: "AC N",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "dc_pos",
      terminalGroupId: "dc_pos",
      label: "DC+",
      side: "right",
      offsetX: 40,
      offsetY: -10,
      maxCurrentA: 20,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "dc_neg",
      terminalGroupId: "dc_neg",
      label: "DC-",
      side: "right",
      offsetX: 40,
      offsetY: 10,
      maxCurrentA: 20,
      connector: {
        kind: "screw_terminal"
      }
    }
  ],
  ports: [
    {
      id: "ac_in",
      kind: "ac",
      topology: "two_pole",
      label: "AC Input",
      voltageClass: "ac_120v",
      nominalVoltageV: 120,
      role: "sink",
      direction: "input"
    },
    {
      id: "dc_out",
      kind: "dc",
      topology: "two_pole",
      label: "DC Output",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 12,
      maxCurrentA: 20,
      role: "source",
      direction: "output"
    }
  ]
};

export default product;
