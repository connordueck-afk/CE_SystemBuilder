import type { Product } from '../../../../types/system';

const product: Product = {
  id: 'breaker-ac-dc-din-2p', manufacturer: 'Generic', name: 'AC/DC Rated DIN Breaker 2P', productType: 'breaker', category: 'AC/DC DIN 2P',
  description: 'Generic dual-rated common-trip two-pole DIN breaker placeholder. Verify manufacturer pole wiring and ratings before use.',
  source: 'Generic placeholder - manufacturer verification required', dataQuality: 'placeholder', imageUrl: '/product-images/breaker-ac-din-2p.svg', width: 84, height: 120,
  terminalGroups: [
    { id: 'l1_in', portId: 'main', label: 'Pole 1 In', groupType: 'power_conductor', polarity: 'positive', internallyCommon: false },
    { id: 'l1_out', portId: 'main', label: 'Pole 1 Out', groupType: 'power_conductor', polarity: 'positive', internallyCommon: false },
    { id: 'l2_in', portId: 'main', label: 'Pole 2 In', groupType: 'power_conductor', polarity: 'positive', internallyCommon: false },
    { id: 'l2_out', portId: 'main', label: 'Pole 2 Out', groupType: 'power_conductor', polarity: 'positive', internallyCommon: false },
  ],
  terminals: [
    { id: 'l1_in', terminalGroupId: 'l1_in', label: 'Pole 1 In', connector: { kind: 'screw_terminal' }, side: 'top', offsetX: -13, offsetY: -42 },
    { id: 'l1_out', terminalGroupId: 'l1_out', label: 'Pole 1 Out', connector: { kind: 'screw_terminal' }, side: 'bottom', offsetX: -13, offsetY: 42 },
    { id: 'l2_in', terminalGroupId: 'l2_in', label: 'Pole 2 In', connector: { kind: 'screw_terminal' }, side: 'top', offsetX: 13, offsetY: -42 },
    { id: 'l2_out', terminalGroupId: 'l2_out', label: 'Pole 2 Out', connector: { kind: 'screw_terminal' }, side: 'bottom', offsetX: 13, offsetY: 42 },
  ],
  protectionRatings: { currentRatingA: 0, voltageRatingV: 480, interruptRatingA: 6000, acDcCompatibility: 'both', breakerStyle: 'AC/DC DIN 2P', protectionType: 'breaker' },
  breakerDefinition: {
    poleCount: 2, tripLinkage: 'common',
    poles: [{ id: 'l1', inputTerminalGroupId: 'l1_in', outputTerminalGroupId: 'l1_out' }, { id: 'l2', inputTerminalGroupId: 'l2_in', outputTerminalGroupId: 'l2_out' }],
    ratingProfiles: [
      { id: 'ac-480v-2p', label: '480 VAC, 2 pole', medium: 'ac', maxVoltageV: 480, interruptRatingA: 6000, polesRequired: 2, wiring: 'independent_conductors', phases: 2 },
      { id: 'dc-60v-bipolar', label: '60 VDC, bipolar', medium: 'dc', maxVoltageV: 60, polesRequired: 2, wiring: 'bipolar' },
    ],
    mounting: 'din', applicationTags: ['mobile', 'marine', 'rv', 'industrial'], resetType: 'toggle',
  },
  variants: [10, 15, 20, 30, 40, 50, 63].map((currentRatingA) => ({ id: `breaker-ac-dc-din-2p-${currentRatingA}a`, currentRatingA })),
  ports: [{ id: 'main', kind: 'dc', topology: 'pass_through', role: 'pass_through', direction: 'bidirectional', label: 'Main', voltageClass: 'dc_low_voltage', maxCurrentA: 0, voltageMaxV: 480 }],
};

export default product;
