import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-ac2450",
  manufacturer: "KISAE",
  name: "ABSO AC Charger 24V 50A",
  productType: "shore_charger",
  category: "Charging",
  nominalVoltage: 24,
  maxCurrentA: 50,
  msrpUsd: 0,
  capabilities: ["ac-charger", "battery-charger"],
  description: "KISAE ABSO AC battery charger, 24V 50A.",
  partNumber: "AC2450",
  productUrl: "https://www.cdnrg.com/products/ac2450",
  source: "Canadian Energy product index",
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
      maxCurrentA: 50,
      requiresOvercurrentProtection: true
    },
    {
      id: "dc_neg",
      portId: "dc_out",
      label: "DC Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 50
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
      maxCurrentA: 50,
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
      maxCurrentA: 50,
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
      nominalVoltageV: 24,
      maxCurrentA: 50,
      role: "source",
      direction: "output"
    }
  ]
};

export default product;
