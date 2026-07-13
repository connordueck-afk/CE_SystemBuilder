import type { Product } from '../../../../types/system';

const product: Product = {
  id: 'breaker-ac-dc-din-1p',
  manufacturer: 'Generic',
  name: 'AC/DC Rated DIN Breaker 1P',
  productType: 'breaker',
  category: 'AC/DC DIN 1P',
  description: 'Generic dual-rated single-pole DIN breaker placeholder. Verify the selected manufacturer AC and DC ratings before use.',
  source: 'Generic placeholder - manufacturer verification required',
  dataQuality: 'placeholder',
  imageUrl: '/product-images/breaker-ac-din-1p.svg',
  width: 48,
  height: 120,
  terminalGroups: [
    { id: 'l1_in', portId: 'main', label: 'Line In', groupType: 'power_conductor', polarity: 'positive', internallyCommon: false },
    { id: 'l1_out', portId: 'main', label: 'Line Out', groupType: 'power_conductor', polarity: 'positive', internallyCommon: false },
  ],
  terminals: [
    { id: 'l1_in', terminalGroupId: 'l1_in', label: 'Line In', connector: { kind: 'screw_terminal' }, side: 'top', offsetX: 0, offsetY: -42 },
    { id: 'l1_out', terminalGroupId: 'l1_out', label: 'Line Out', connector: { kind: 'screw_terminal' }, side: 'bottom', offsetX: 0, offsetY: 42 },
  ],
  protectionRatings: { currentRatingA: 0, voltageRatingV: 277, interruptRatingA: 6000, acDcCompatibility: 'both', breakerStyle: 'AC/DC DIN 1P', protectionType: 'breaker' },
  breakerDefinition: {
    poleCount: 1,
    tripLinkage: 'independent',
    poles: [{ id: 'l1', inputTerminalGroupId: 'l1_in', outputTerminalGroupId: 'l1_out' }],
    ratingProfiles: [
      { id: 'ac-277v-1p', label: '277 VAC, 1 pole', medium: 'ac', maxVoltageV: 277, interruptRatingA: 6000, polesRequired: 1, wiring: 'independent_conductors', phases: 1 },
      { id: 'dc-60v-1p', label: '60 VDC, 1 pole', medium: 'dc', maxVoltageV: 60, polesRequired: 1, wiring: 'independent_conductors' },
    ],
    mounting: 'din',
    applicationTags: ['mobile', 'marine', 'rv', 'industrial'],
    resetType: 'toggle',
  },
  variants: [10, 15, 20, 30, 40, 50, 63].map((currentRatingA) => ({ id: `breaker-ac-dc-din-1p-${currentRatingA}a`, currentRatingA })),
  ports: [{ id: 'main', kind: 'dc', topology: 'pass_through', role: 'pass_through', direction: 'bidirectional', label: 'Main', voltageClass: 'dc_low_voltage', maxCurrentA: 0, voltageMaxV: 277 }],
};

export default product;
