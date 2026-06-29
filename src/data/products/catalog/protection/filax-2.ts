import type { Product } from '../../../../types/system';

const product: Product = {
  id: 'filax-2',
  manufacturer: 'Victron',
  name: 'Filax 2 Transfer Switch',
  productType: 'transferSwitch',
  category: 'Protection',
  msrpUsd: 316,
  description: 'Victron Filax 2 ultra-fast (<20ms) automatic transfer switch for shore power / generator changeover.',
  partNumber: 'FIL000020000',
  source: 'Victron 2025',
  dataQuality: 'partial',
  notes: 'Placeholder pricing/specs.',
  width: 80,
  height: 60,
  terminalGroups: [
    { id: 'ac_in_1_l', portId: 'ac_in_1', label: 'Input 1 Line', groupType: 'power_conductor', polarity: 'line', internallyCommon: false },
    { id: 'ac_in_1_n', portId: 'ac_in_1', label: 'Input 1 Neutral', groupType: 'power_conductor', polarity: 'neutral', internallyCommon: false },
    { id: 'ac_in_2_l', portId: 'ac_in_2', label: 'Input 2 Line', groupType: 'power_conductor', polarity: 'line', internallyCommon: false },
    { id: 'ac_in_2_n', portId: 'ac_in_2', label: 'Input 2 Neutral', groupType: 'power_conductor', polarity: 'neutral', internallyCommon: false },
    { id: 'ac_out_l', portId: 'ac_out', label: 'Output Line', groupType: 'power_conductor', polarity: 'line', internallyCommon: false },
    { id: 'ac_out_n', portId: 'ac_out', label: 'Output Neutral', groupType: 'power_conductor', polarity: 'neutral', internallyCommon: false },
  ],
  terminals: [
    { id: 'ac_in_1_l', terminalGroupId: 'ac_in_1_l', label: 'In1 L', side: 'left', offsetX: -40, offsetY: -24, connector: { kind: 'screw_terminal' } },
    { id: 'ac_in_1_n', terminalGroupId: 'ac_in_1_n', label: 'In1 N', side: 'left', offsetX: -40, offsetY: -8, connector: { kind: 'screw_terminal' } },
    { id: 'ac_in_2_l', terminalGroupId: 'ac_in_2_l', label: 'In2 L', side: 'left', offsetX: -40, offsetY: 8, connector: { kind: 'screw_terminal' } },
    { id: 'ac_in_2_n', terminalGroupId: 'ac_in_2_n', label: 'In2 N', side: 'left', offsetX: -40, offsetY: 24, connector: { kind: 'screw_terminal' } },
    { id: 'ac_out_l', terminalGroupId: 'ac_out_l', label: 'Out L', side: 'right', offsetX: 40, offsetY: -10, connector: { kind: 'screw_terminal' } },
    { id: 'ac_out_n', terminalGroupId: 'ac_out_n', label: 'Out N', side: 'right', offsetX: 40, offsetY: 10, connector: { kind: 'screw_terminal' } },
  ],
  ports: [
    { id: 'ac_in_1', kind: 'ac', topology: 'two_pole', label: 'AC Input 1', voltageClass: 'ac_120v', nominalVoltageV: 120, maxCurrentA: 16, role: 'sink', direction: 'input' },
    { id: 'ac_in_2', kind: 'ac', topology: 'two_pole', label: 'AC Input 2', voltageClass: 'ac_120v', nominalVoltageV: 120, maxCurrentA: 16, role: 'sink', direction: 'input' },
    { id: 'ac_out', kind: 'ac', topology: 'two_pole', label: 'AC Output', voltageClass: 'ac_120v', nominalVoltageV: 120, maxCurrentA: 16, role: 'source', direction: 'output' },
  ],
};

export default product;
