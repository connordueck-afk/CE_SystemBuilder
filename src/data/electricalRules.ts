export const CONTINUOUS_LOAD_FACTOR = 1.25;

export const DEFAULT_ASSUMPTIONS = {
  inverterEfficiency: 0.92,
  defaultOemDiscountPercent: 30,
  defaultCableLengthFt: 6,
  maxVoltageDropPercent: 3,
  continuousLoadMultiplier: CONTINUOUS_LOAD_FACTOR,
  batteryInterconnectMaxLengthFt: 3,
};

export const SECTION_FOR_TYPE: Record<string, string> = {
  battery:          'Energy Storage',
  inverter_charger: 'Power Conversion',
  mppt:             'Charging Sources',
  solar_array:      'Charging Sources',
  solar_combiner:   'Charging Sources',
  pvCombinerBox:    'Charging Sources',
  dc_dc_charger:    'Charging Sources',
  shore_charger:    'Charging Sources',
  converter:        'Charging Sources',
  dc_distribution:  'DC Distribution',
  busbar:           'DC Distribution',
  dcDisconnect:     'DC Distribution',
  ac_distribution:  'AC Distribution',
  acDisconnect:     'AC Distribution',
  transferSwitch:   'AC Distribution',
  fuse:             'Protection',
  breaker:          'Protection',
  relay:            'Protection',
  contactor:        'Protection',
  cable:            'Cabling',
  dc_load:          'Accessories',
  ac_load:          'Accessories',
  monitor:          'Monitoring & Control',
  batteryMonitor:   'Monitoring & Control',
  shorePowerInlet:  'AC Distribution',
  accessory:        'Accessories',
};
