import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-alternator-source",
  manufacturer: "Generic",
  name: "DC Source",
  productType: "accessory",
  category: "Charging",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 120,
  continuousPowerW: 1440,
  msrpUsd: 0,
  description: "Generic DC source placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 90,
  height: 64,
  terminalGroups: [
    {
      id: "dc_out_pos",
      portId: "dc_out",
      label: "DC Output Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 120
    },
    {
      id: "dc_out_neg",
      portId: "dc_out",
      label: "DC Output Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 120
    }
  ],
  terminals: [
    {
      id: "dc_pos",
      terminalGroupId: "dc_out_pos",
      label: "B+",
      side: "right",
      offsetX: 45,
      offsetY: -10,
      maxCurrentA: 120
    },
    {
      id: "dc_neg",
      terminalGroupId: "dc_out_neg",
      label: "B-",
      side: "right",
      offsetX: 45,
      offsetY: 10,
      maxCurrentA: 120
    }
  ],
  ports: [
    {
      id: "dc_out",
      kind: "dc",
      topology: "two_pole",
      label: "DC Output",
      voltageClass: "dc_low_voltage",
      maxCurrentA: 120,
      maxPowerW: 1440,
      role: "source",
      direction: "output"
    }
  ]
};

export default product;
