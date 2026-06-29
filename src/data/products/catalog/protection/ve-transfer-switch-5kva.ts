import type { Product } from '../../../../types/system';

const product: Product = {
  id: 've-transfer-switch-5kva',
  manufacturer: 'Victron',
  name: 'VE Transfer Switch 5 kVA',
  productType: 'transferSwitch',
  category: 'Protection',
  continuousPowerW: 5000,
  msrpUsd: 378,
  description: 'Victron VE Transfer Switch 5 kVA for use with MultiPlus/Quattro systems to add a second AC input.',
  partNumber: 'VTS000005000',
  source: 'Victron 2025',
  dataQuality: 'partial',
  notes: 'Placeholder pricing/specs.',
  width: 80,
  height: 60,
  terminalGroups: [
    { id: 'ac_in_l', portId: 'ac_in', label: 'Input Line', groupType: 'power_conductor', polarity: 'line', internallyCommon: false },
    { id: 'ac_in_n', portId: 'ac_in', label: 'Input Neutral', groupType: 'power_conductor', polarity: 'neutral', internallyCommon: false },
    { id: 'ac_out_l', portId: 'ac_out', label: 'Output Line', groupType: 'power_conductor', polarity: 'line', internallyCommon: false },
    { id: 'ac_out_n', portId: 'ac_out', label: 'Output Neutral', groupType: 'power_conductor', polarity: 'neutral', internallyCommon: false },
  ],
  terminals: [
    { id: 'ac_in_l', terminalGroupId: 'ac_in_l', label: 'In L', side: 'left', offsetX: -40, offsetY: -10, connector: { kind: 'screw_terminal' } },
    { id: 'ac_in_n', terminalGroupId: 'ac_in_n', label: 'In N', side: 'left', offsetX: -40, offsetY: 10, connector: { kind: 'screw_terminal' } },
    { id: 'ac_out_l', terminalGroupId: 'ac_out_l', label: 'Out L', side: 'right', offsetX: 40, offsetY: -10, connector: { kind: 'screw_terminal' } },
    { id: 'ac_out_n', terminalGroupId: 'ac_out_n', label: 'Out N', side: 'right', offsetX: 40, offsetY: 10, connector: { kind: 'screw_terminal' } },
  ],
  ports: [
    { id: 'ac_in', kind: 'ac', topology: 'two_pole', label: 'AC Input', voltageClass: 'ac_120v', nominalVoltageV: 120, maxPowerW: 5000, role: 'sink', direction: 'input' },
    { id: 'ac_out', kind: 'ac', topology: 'two_pole', label: 'AC Output', voltageClass: 'ac_120v', nominalVoltageV: 120, maxPowerW: 5000, role: 'source', direction: 'output' },
  ],
};

export default product;
