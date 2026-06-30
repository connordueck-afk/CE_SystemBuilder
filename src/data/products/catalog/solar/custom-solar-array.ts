import type { Product } from '../../../../types/system';

const product: Product = {
  id: 'custom-solar-array',
  manufacturer: 'Custom',
  name: 'Custom Solar Array',
  productType: 'custom_solar_array',
  category: 'Solar',
  description: 'Explicit aggregate PV source with user-entered total array ratings.',
  source: 'User entered',
  dataQuality: 'placeholder',
  isBOMItem: true,
  width: 120,
  height: 80,
  terminalGroups: [
    {
      id: 'pv_pos',
      portId: 'pv',
      label: 'PV Positive',
      groupType: 'power_conductor',
      polarity: 'positive',
      internallyCommon: false,
      requiresOvercurrentProtection: true,
    },
    {
      id: 'pv_neg',
      portId: 'pv',
      label: 'PV Negative',
      groupType: 'power_conductor',
      polarity: 'negative',
      internallyCommon: false,
    },
  ],
  terminals: [
    {
      id: 'pv_pos',
      terminalGroupId: 'pv_pos',
      label: 'PV+',
      side: 'bottom',
      offsetX: 25,
      offsetY: 40,
      connector: { kind: 'mc4', gender: 'male' },
      notes: 'Aggregate PV array positive output.',
    },
    {
      id: 'pv_neg',
      terminalGroupId: 'pv_neg',
      label: 'PV-',
      side: 'bottom',
      offsetX: -25,
      offsetY: 40,
      connector: { kind: 'mc4', gender: 'female' },
      notes: 'Aggregate PV array negative output.',
    },
  ],
  ports: [
    {
      id: 'pv',
      kind: 'pv',
      topology: 'two_pole',
      label: 'PV',
      voltageClass: 'pv_high_voltage',
      role: 'source',
      direction: 'output',
    },
  ],
};

export default product;
