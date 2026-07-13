import type { Product } from '../../../../types/system';

const product: Product = {
  id: 'breaker-ac-dc-din-3p', manufacturer: 'Generic', name: 'AC/DC Rated DIN Breaker 3P', productType: 'breaker', category: 'AC/DC DIN 3P',
  description: 'Generic dual-rated common-trip three-pole DIN breaker placeholder. Verify manufacturer pole wiring and ratings before use.',
  source: 'Generic placeholder - manufacturer verification required', dataQuality: 'placeholder', imageUrl: '/product-images/breaker-ac-din-3p.svg', width: 120, height: 120,
  terminalGroups: ['l1_in', 'l1_out', 'l2_in', 'l2_out', 'l3_in', 'l3_out'].map((id) => ({ id, portId: 'main', label: id.replace('_', ' ').toUpperCase(), groupType: 'power_conductor' as const, polarity: 'positive' as const, internallyCommon: false })),
  terminals: [
    { id: 'l1_in', terminalGroupId: 'l1_in', label: 'Pole 1 In', connector: { kind: 'screw_terminal' }, side: 'top', offsetX: -27, offsetY: -41 },
    { id: 'l1_out', terminalGroupId: 'l1_out', label: 'Pole 1 Out', connector: { kind: 'screw_terminal' }, side: 'bottom', offsetX: -27, offsetY: 39 },
    { id: 'l2_in', terminalGroupId: 'l2_in', label: 'Pole 2 In', connector: { kind: 'screw_terminal' }, side: 'top', offsetX: 0, offsetY: -41 },
    { id: 'l2_out', terminalGroupId: 'l2_out', label: 'Pole 2 Out', connector: { kind: 'screw_terminal' }, side: 'bottom', offsetX: 0, offsetY: 39 },
    { id: 'l3_in', terminalGroupId: 'l3_in', label: 'Pole 3 In', connector: { kind: 'screw_terminal' }, side: 'top', offsetX: 27, offsetY: -41 },
    { id: 'l3_out', terminalGroupId: 'l3_out', label: 'Pole 3 Out', connector: { kind: 'screw_terminal' }, side: 'bottom', offsetX: 27, offsetY: 39 },
  ],
  protectionRatings: { currentRatingA: 0, voltageRatingV: 480, interruptRatingA: 6000, acDcCompatibility: 'both', breakerStyle: 'AC/DC DIN 3P', protectionType: 'breaker' },
  breakerDefinition: {
    poleCount: 3, tripLinkage: 'common',
    poles: [
      { id: 'l1', inputTerminalGroupId: 'l1_in', outputTerminalGroupId: 'l1_out' },
      { id: 'l2', inputTerminalGroupId: 'l2_in', outputTerminalGroupId: 'l2_out' },
      { id: 'l3', inputTerminalGroupId: 'l3_in', outputTerminalGroupId: 'l3_out' },
    ],
    ratingProfiles: [
      { id: 'ac-480v-3p', label: '480 VAC, 3 pole', medium: 'ac', maxVoltageV: 480, interruptRatingA: 6000, polesRequired: 3, wiring: 'independent_conductors', phases: 3 },
      { id: 'dc-60v-3p', label: '60 VDC, 3 conductor', medium: 'dc', maxVoltageV: 60, polesRequired: 3, wiring: 'independent_conductors' },
    ],
    mounting: 'din', applicationTags: ['industrial'], resetType: 'toggle',
  },
  variants: [10, 15, 20, 30, 40, 50, 63].map((currentRatingA) => ({ id: `breaker-ac-dc-din-3p-${currentRatingA}a`, currentRatingA })),
  ports: [{ id: 'main', kind: 'dc', topology: 'pass_through', role: 'pass_through', direction: 'bidirectional', label: 'Main', voltageClass: 'dc_low_voltage', maxCurrentA: 0, voltageMaxV: 480 }],
};

export default product;
