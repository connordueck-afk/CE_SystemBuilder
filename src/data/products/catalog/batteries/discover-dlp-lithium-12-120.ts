import { defineCatalogBattery } from '../../helpers/batteryCatalog';

const product = defineCatalogBattery({
  id: 'discover-dlp-lithium-12-120',
  manufacturer: 'Discover Battery',
  name: 'DLP-GC2 12.8V/120Ah',
  nominalVoltage: 12,
  capacityWh: 1536,
  maxCurrentA: 120,
  msrpUsd: 1250,
  description: 'Discover DLP-GC2 battery 12.8V/120Ah with CAN communication',
  partNumber: 'DLP-GC2-12V',
  productUrl: 'https://www.cdnrg.com/products/dlp-gc2-12v',
  source: 'Discover Battery 2025',
  dataQuality: 'partial',
  notes: 'Placeholder pricing/specs.',
  width: 92,
  height: 98,
  positiveTerminal: {
    side: 'top',
    offsetX: 22,
    offsetY: -45,
    maxCurrentA: 120,
    connector: { kind: 'stud', holeSize: 'M8' },
  },
  negativeTerminal: {
    side: 'top',
    offsetX: -26,
    offsetY: -45,
    maxCurrentA: 120,
    connector: { kind: 'stud', holeSize: 'M8' },
  },
  batteryRatings: {
    nominalVoltageV: 12.8,
    capacityAh: 120,
    capacityWh: 1536,
    capacityKwh: 1.54,
    maxDischargeCurrentA: 120,
    chemistry: 'LiFePO4',
    communicationInterfaces: ['CAN'],
    hasInternalBms: true,
    seriesAllowed: false,
    parallelAllowed: true,
  },
});

export default product;
