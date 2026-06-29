import { defineCatalogBattery } from '../../helpers/batteryCatalog';

const product = defineCatalogBattery({
  id: 'discover-dlp-lithium-48-30',
  manufacturer: 'Discover Battery',
  name: 'DLP-GC2 51.2V/30Ah',
  nominalVoltage: 48,
  capacityWh: 1536,
  maxCurrentA: 30,
  msrpUsd: 1250,
  description: 'Discover DLP-GC2 battery 51.2V/30Ah with CAN communication',
  partNumber: 'DLP-GC2-48V',
  productUrl: 'https://www.cdnrg.com/products/dlp-gc2-48v',
  source: 'Discover Battery 2025',
  dataQuality: 'partial',
  notes: 'Placeholder pricing/specs.',
  width: 92,
  height: 98,
  positiveTerminal: {
    side: 'top',
    offsetX: 22,
    offsetY: -45,
    maxCurrentA: 30,
    connector: { kind: 'stud', holeSize: 'M6' },
  },
  negativeTerminal: {
    side: 'top',
    offsetX: -26,
    offsetY: -45,
    maxCurrentA: 30,
    connector: { kind: 'stud', holeSize: 'M6' },
  },
  batteryRatings: {
    nominalVoltageV: 51.2,
    capacityAh: 30,
    capacityWh: 1536,
    capacityKwh: 1.54,
    maxDischargeCurrentA: 30,
    chemistry: 'LiFePO4',
    communicationInterfaces: ['CAN'],
    hasInternalBms: true,
    seriesAllowed: false,
    parallelAllowed: true,
  },
});

export default product;
