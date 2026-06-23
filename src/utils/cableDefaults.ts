import type { InternalBusType } from '../types/system';

export const BUS_DEFAULT_COLOR: Partial<Record<InternalBusType, string>> = {
  dc_pos: 'Red',
  dc_neg: 'Black',
  pv_pos: 'Red',
  pv_neg: 'Black',
  ac_line: 'Black',
  ac_neutral: 'White',
  ac_ground: 'Green',
  chassis_ground: 'Green',
};

export const BUS_DEFAULT_TYPE: Partial<Record<InternalBusType, string>> = {
  dc_pos: 'Marine Grade',
  dc_neg: 'Marine Grade',
  pv_pos: 'RHH/RHW-2',
  pv_neg: 'RHH/RHW-2',
  ac_line: 'THHN/THWN',
  ac_neutral: 'THHN/THWN',
  ac_ground: 'THHN/THWN',
  chassis_ground: 'THHN/THWN',
};
