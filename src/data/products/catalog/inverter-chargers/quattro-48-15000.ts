import type { Product } from '../../../../types/system';

const product: Product = {
  id: "quattro-48-15000",
  manufacturer: "Victron",
  name: "Quattro 48/15000/200-100/100",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 48,
  continuousPowerW: 15000,
  maxCurrentA: 325,
  msrpUsd: 3591,
  capabilities: ["inverter-charger", "battery-charger"],
  description: "Quattro 48/15000/200-100/100 inverter/charger.",
  partNumber: "QUA483150100",
  productUrl: "https://www.victronenergy.com/inverters-chargers/quattro",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 90,
  height: 130,
  inverterChargerRatings: {
    dcVoltageV: 48,
    maxDcCurrentA: 325,
    continuousInverterW: 15000,
    chargerCurrentA: 200,
    acInputVoltageV: 120,
    acOutputVoltageV: 120,
    acOutputCurrentA: 125
  },
  terminalGroups: [
    {
      id: "dc_pos",
      portId: "dc",
      label: "DC Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 325,
      requiresOvercurrentProtection: true
    },
    {
      id: "dc_neg",
      portId: "dc",
      label: "DC Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 325
    },
    {
      id: "ac_in_l",
      portId: "ac_in",
      label: "AC Input Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    },
    {
      id: "ac_in_n",
      portId: "ac_in",
      label: "AC Input Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false
    },
    {
      id: "ac_out_l",
      portId: "ac_out",
      label: "AC Output Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 125
    },
    {
      id: "ac_out_n",
      portId: "ac_out",
      label: "AC Output Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 125
    },
    {
      id: "ac_in2_l",
      portId: "ac_in2",
      label: "AC Input 2 Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    },
    {
      id: "ac_in2_n",
      portId: "ac_in2",
      label: "AC Input 2 Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false
    },
    {
      id: "ve_bus_iface",
      portId: "ve_bus",
      label: "VE.Bus Interface",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "dc_pos",
      terminalGroupId: "dc_pos",
      label: "DC+",
      side: "bottom",
      offsetX: -25,
      offsetY: 48,
      maxCurrentA: 325,
      connector: {
        kind: "stud",
        holeSize: "M10"
      }
    },
    {
      id: "dc_neg",
      terminalGroupId: "dc_neg",
      label: "DC-",
      side: "bottom",
      offsetX: -15,
      offsetY: 48,
      maxCurrentA: 325,
      connector: {
        kind: "stud",
        holeSize: "M10"
      }
    },
    {
      id: "ac_in_l",
      terminalGroupId: "ac_in_l",
      label: "AC In L",
      side: "bottom",
      offsetX: -2,
      offsetY: 48,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_in_n",
      terminalGroupId: "ac_in_n",
      label: "AC In N",
      side: "bottom",
      offsetX: 6,
      offsetY: 48,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_out_l",
      terminalGroupId: "ac_out_l",
      label: "AC Out L",
      side: "bottom",
      offsetX: 14,
      offsetY: 48,
      maxCurrentA: 125,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_out_n",
      terminalGroupId: "ac_out_n",
      label: "AC Out N",
      side: "bottom",
      offsetX: 22,
      offsetY: 48,
      maxCurrentA: 125,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_in2_l",
      terminalGroupId: "ac_in2_l",
      label: "AC In 2 L",
      side: "bottom",
      offsetX: 30,
      offsetY: 48,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_in2_n",
      terminalGroupId: "ac_in2_n",
      label: "AC In 2 N",
      side: "bottom",
      offsetX: 38,
      offsetY: 48,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ve_bus",
      terminalGroupId: "ve_bus_iface",
      label: "VE.Bus",
      side: "top",
      offsetX: 0,
      offsetY: -65,
      connector: {
        kind: "comm"
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
      nominalVoltageV: 48,
      maxCurrentA: 325,
      role: "bidirectional",
      direction: "bidirectional"
    },
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
      id: "ac_out",
      kind: "ac",
      topology: "two_pole",
      label: "AC Output",
      voltageClass: "ac_120v",
      nominalVoltageV: 120,
      maxCurrentA: 125,
      role: "source",
      direction: "output"
    },
    {
      id: "ac_in2",
      kind: "ac",
      topology: "two_pole",
      label: "AC Input 2",
      voltageClass: "ac_120v",
      nominalVoltageV: 120,
      role: "sink",
      direction: "input"
    },
    {
      id: "ve_bus",
      kind: "comm",
      label: "VE.Bus",
      topology: "two_pole",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Bus"],
      configuredProtocol: "VE.Bus"
    }
  ],
  communicationPorts: [
    {
      id: "ve_bus",
      name: "VE.Bus",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Bus"],
      configuredProtocol: "VE.Bus"
    }
  ]
};

export default product;
