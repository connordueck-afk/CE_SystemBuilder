import type { Product } from '../../../../types/system';

const variants = [
  [25, '7180'], [30, '7181'], [40, '7182'], [50, '7183'], [60, '7184'],
  [70, '7185'], [80, '7186'], [100, '7187'], [120, '7188'], [150, '7189'],
] as const;

const product: Product = {
  id: 'breaker-blue-sea-285-surface',
  manufacturer: 'Blue Sea Systems',
  name: '285-Series Surface Mount Circuit Breaker',
  productType: 'breaker',
  category: 'Mobile DC Breaker',
  description: 'Single-pole, weather-resistant, ignition-protected Type III manual-reset breaker for marine and mobile DC systems.',
  source: 'Blue Sea Systems 285-Series product specifications',
  productUrl: 'https://www.bluesea.com/products/7180',
  dataQuality: 'partial',
  imageUrl: '/product-images/generic-breaker.svg',
  width: 80,
  height: 64,
  terminalGroups: [
    { id: 'in', portId: 'main', label: 'Line', groupType: 'power_conductor', polarity: 'positive', internallyCommon: false },
    { id: 'out', portId: 'main', label: 'Load', groupType: 'power_conductor', polarity: 'positive', internallyCommon: false },
  ],
  terminals: [
    { id: 'in', terminalGroupId: 'in', label: 'Line', connector: { kind: 'stud', holeSize: 'M6' }, side: 'left', offsetX: -40, offsetY: 0 },
    { id: 'out', terminalGroupId: 'out', label: 'Load', connector: { kind: 'stud', holeSize: 'M6' }, side: 'right', offsetX: 40, offsetY: 0 },
  ],
  protectionRatings: {
    currentRatingA: 0,
    voltageRatingV: 48,
    interruptRatingA: 3000,
    acDcCompatibility: 'dc',
    breakerStyle: 'Blue Sea 285 Surface Mount',
    protectionType: 'breaker',
  },
  breakerDefinition: {
    poleCount: 1,
    tripLinkage: 'independent',
    poles: [{ id: 'pole1', inputTerminalGroupId: 'in', outputTerminalGroupId: 'out' }],
    ratingProfiles: [{
      id: 'dc-48v-1p',
      label: '48 VDC, 1 pole',
      medium: 'dc',
      maxVoltageV: 48,
      interruptRatingA: 3000,
      polesRequired: 1,
      wiring: 'independent_conductors',
    }],
    mounting: 'surface',
    applicationTags: ['mobile', 'marine', 'rv'],
    resetType: 'manual_reset',
  },
  variants: variants.map(([currentRatingA, partNumber]) => ({
    id: `breaker-blue-sea-285-${currentRatingA}a`,
    name: `Blue Sea 285-Series ${currentRatingA}A Surface Mount Breaker`,
    currentRatingA,
    partNumber,
    productUrl: `https://www.bluesea.com/products/${partNumber}`,
  })),
  ports: [{
    id: 'main', kind: 'dc', topology: 'pass_through', role: 'pass_through', direction: 'bidirectional',
    label: 'Protected DC conductor', voltageClass: 'dc_low_voltage', maxCurrentA: 0, voltageMaxV: 48,
  }],
};

export default product;
