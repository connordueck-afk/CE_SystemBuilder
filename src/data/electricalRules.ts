export const CONTINUOUS_LOAD_FACTOR = 1.25;

/**
 * PV source/output circuit sizing factor (NEC 690.8).
 * Max circuit current = 1.25 x Isc (690.8(A)(1)); conductors and OCPD are then
 * sized at 125% of that continuous current (690.8(B)) => 1.25 x 1.25 = 1.5625.
 * Applied to PV-bus conductors (array -> charge controller) instead of the
 * generic continuous-load factor.
 */
export const PV_CONTINUOUS_FACTOR = 1.5625;

/**
 * Conductor/OCPD continuous-sizing factor for a given bus type.
 * PV source/output circuits use 156% (NEC 690.8); everything else 125%.
 */
export function continuousFactorForBus(busType: string): number {
  return busType === 'pv_pos' || busType === 'pv_neg'
    ? PV_CONTINUOUS_FACTOR
    : CONTINUOUS_LOAD_FACTOR;
}

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
