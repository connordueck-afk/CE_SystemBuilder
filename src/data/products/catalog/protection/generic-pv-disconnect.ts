import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-pv-disconnect",
  manufacturer: "Generic",
  name: "PV Disconnect",
  productType: "dcDisconnect",
  category: "Protection",
  maxPvVoltageV: 600,
  maxPvCurrentA: 30,
  msrpUsd: 0,
  description: "Generic solar PV disconnect placeholder.",
  source: "User",
  dataQuality: "placeholder",
  imageUrl: "/product-images/pv-disconnect.svg",
  width: 78,
  height: 90,
  terminalGroups: [
    {
      id: "in_pos",
      portId: "main",
      label: "Input Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 30
    },
    {
      id: "out_pos",
      portId: "main",
      label: "Output Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 30
    },
    {
      id: "in_neg",
      portId: "main",
      label: "Input Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 30
    },
    {
      id: "out_neg",
      portId: "main",
      label: "Output Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 30
    }
  ],
  terminals: [
    {
      id: "in_pos",
      terminalGroupId: "in_pos",
      label: "In+",
      side: "bottom",
      offsetX: -12,
      offsetY: 45,
      maxCurrentA: 30,
      connector: {
        kind: "mc4",
        gender: "female"
      }
    },
    {
      id: "out_pos",
      terminalGroupId: "out_pos",
      label: "Out+",
      side: "bottom",
      offsetX: 4,
      offsetY: 45,
      maxCurrentA: 30,
      connector: {
        kind: "mc4",
        gender: "male"
      }
    },
    {
      id: "in_neg",
      terminalGroupId: "in_neg",
      label: "In-",
      side: "bottom",
      offsetX: -4,
      offsetY: 45,
      maxCurrentA: 30,
      connector: {
        kind: "mc4",
        gender: "male"
      }
    },
    {
      id: "out_neg",
      terminalGroupId: "out_neg",
      label: "Out-",
      side: "bottom",
      offsetX: 12,
      offsetY: 45,
      maxCurrentA: 30,
      connector: {
        kind: "mc4",
        gender: "female"
      }
    }
  ],
  ports: [
    {
      id: "main",
      kind: "pv",
      topology: "pass_through",
      label: "Main",
      voltageClass: "pv_high_voltage",
      voltageMaxV: 600,
      maxCurrentA: 30,
      role: "pass_through",
      direction: "bidirectional"
    }
  ]
};

export default product;
