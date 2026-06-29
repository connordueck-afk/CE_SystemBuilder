import type { Product } from '../../../../types/system';

const product: Product = {
  id: "inv-vic-mp2-48-5000",
  manufacturer: "Victron",
  name: "MultiPlus-II 48/5000/70-50",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 48,
  continuousPowerW: 5000,
  peakPowerW: 10000,
  maxCurrentA: 110,
  msrpUsd: 2199,
  oemPriceUsd: 1539,
  description: "Victron MultiPlus-II 48V 5000W inverter/charger with 70A charger",
  partNumber: "EAS048500114",
  productUrl: "https://www.victronenergy.com/inverters-chargers/multiplus-ii",
  source: "Victron 2024",
  dataQuality: "partial",
  width: 90,
  height: 130,
  terminalGroups: [
    {
      id: "dc_pos",
      portId: "dc",
      label: "DC Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 110
    },
    {
      id: "dc_neg",
      portId: "dc",
      label: "DC Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 110
    },
    {
      id: "ac_in_l",
      portId: "ac_in",
      label: "AC In Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 50
    },
    {
      id: "ac_in_n",
      portId: "ac_in",
      label: "AC In Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 50
    },
    {
      id: "ac_out_l",
      portId: "ac_out",
      label: "AC Out Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 41
    },
    {
      id: "ac_out_n",
      portId: "ac_out",
      label: "AC Out Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 41
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
      offsetX: -20,
      offsetY: 48,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "DC positive bus connection. Requires Class T or ANL fuse between battery and inverter."
    },
    {
      id: "dc_neg",
      terminalGroupId: "dc_neg",
      label: "DC-",
      side: "bottom",
      offsetX: -12,
      offsetY: 48,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "DC negative bus connection."
    },
    {
      id: "ac_in_l",
      terminalGroupId: "ac_in_l",
      label: "AC In L",
      side: "bottom",
      offsetX: 2,
      offsetY: 48,
      maxCurrentA: 50,
      connector: {
        kind: "screw_terminal"
      },
      notes: "AC input Line conductor (shore power or generator)."
    },
    {
      id: "ac_in_n",
      terminalGroupId: "ac_in_n",
      label: "AC In N",
      side: "bottom",
      offsetX: 9,
      offsetY: 48,
      maxCurrentA: 50,
      connector: {
        kind: "screw_terminal"
      },
      notes: "AC input Neutral conductor."
    },
    {
      id: "ac_out_l",
      terminalGroupId: "ac_out_l",
      label: "AC Out L",
      side: "bottom",
      offsetX: 16,
      offsetY: 48,
      maxCurrentA: 41,
      connector: {
        kind: "screw_terminal"
      },
      notes: "AC output Line conductor to AC distribution panel."
    },
    {
      id: "ac_out_n",
      terminalGroupId: "ac_out_n",
      label: "AC Out N",
      side: "bottom",
      offsetX: 23,
      offsetY: 48,
      maxCurrentA: 41,
      connector: {
        kind: "screw_terminal"
      },
      notes: "AC output Neutral conductor."
    },
    {
      id: "ve_bus",
      terminalGroupId: "ve_bus_iface",
      label: "VE.Bus",
      side: "top",
      offsetX: 0,
      offsetY: -65
    }
  ],
  inverterChargerRatings: {
    dcVoltageV: 48,
    maxDcCurrentA: 110,
    continuousInverterW: 5000,
    surgeW: 10000,
    chargerCurrentA: 70,
    acInputVoltageV: 120,
    acInputCurrentA: 50,
    acOutputVoltageV: 120,
    acOutputCurrentA: 41,
    transferSwitchA: 50,
    efficiencyPct: 95
  },
  communicationPorts: [
    {
      id: "ve_bus",
      name: "VE.Bus",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Bus"
      ],
      configuredProtocol: "VE.Bus"
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
      maxCurrentA: 110,
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
      maxCurrentA: 50,
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
      maxCurrentA: 41,
      role: "source",
      direction: "output"
    },
    {
      id: "ve_bus",
      kind: "comm",
      label: "VE.Bus",
      topology: "two_pole",
      role: "bidirectional",
      direction: "bidirectional"
    }
  ]
};

export default product;
