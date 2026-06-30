import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-agm-battery",
  manufacturer: "Generic",
  name: "AGM Battery",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 12,
  capacityWh: 1200,
  maxCurrentA: 100,
  msrpUsd: 0,
  description: "Generic AGM battery placeholder.",
  source: "User",
  dataQuality: "placeholder",
  width: 90,
  height: 86,
  batteryRatings: {
    nominalVoltageV: 12,
    capacityAh: 100,
    capacityWh: 1200,
    capacityKwh: 1.2,
    chemistry: "AGM",
    hasInternalBms: false,
    seriesAllowed: true,
    maxSeriesCount: 4,
    parallelAllowed: true
  },
  terminalGroups: [
    {
      id: "dc_pos",
      portId: "dc",
      label: "DC Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 100,
      requiresOvercurrentProtection: true
    },
    {
      id: "dc_neg",
      portId: "dc",
      label: "DC Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 100
    }
  ],
  terminals: [
    {
      id: "dc_pos",
      terminalGroupId: "dc_pos",
      label: "+",
      side: "top",
      offsetX: 22,
      offsetY: -43,
      maxCurrentA: 100,
      connector: {
        kind: "stud",
        holeSize: "M8"
      }
    },
    {
      id: "dc_neg",
      terminalGroupId: "dc_neg",
      label: "-",
      side: "top",
      offsetX: -22,
      offsetY: -43,
      maxCurrentA: 100,
      connector: {
        kind: "stud",
        holeSize: "M8"
      }
    }
  ],
  ports: [
    {
      id: "dc",
      kind: "dc",
      topology: "two_pole",
      label: "DC",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 12,
      maxCurrentA: 100,
      role: "bidirectional",
      direction: "bidirectional"
    }
  ]
};

export default product;
