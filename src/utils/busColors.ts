import type { BusType } from './electricalNetlist';

export type BusColorMap = Record<BusType, string>;

export const DEFAULT_BUS_COLORS: BusColorMap = {
  dc_pos: '#b93232',
  dc_neg: '#1f2933',
  pv_pos: '#c98518',
  pv_neg: '#7a5a3a',
  ac_line: '#d8752b',
  ac_neutral: '#617089',
  ac_ground: '#2f9461',
  chassis_ground: '#46546a',
  signal: '#7c61c7',
  unknown: '#617089',
};

export const BUS_COLOR_OPTIONS: Array<{ key: BusType; label: string }> = [
  { key: 'dc_pos', label: 'DC+' },
  { key: 'dc_neg', label: 'DC-' },
  { key: 'pv_pos', label: 'PV+' },
  { key: 'pv_neg', label: 'PV-' },
  { key: 'ac_line', label: 'AC Line' },
  { key: 'ac_neutral', label: 'AC Neutral' },
  { key: 'ac_ground', label: 'AC Ground' },
  { key: 'chassis_ground', label: 'Chassis Ground' },
  { key: 'signal', label: 'Signal' },
  { key: 'unknown', label: 'Unknown' },
];
