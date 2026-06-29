import { defineCatalogBattery } from '../../helpers/batteryCatalog';

const product = defineCatalogBattery({
  id: 'discover-aes-rackmount-48-42-5120',
  manufacturer: 'Discover Battery',
  name: 'AES Rackmount 51.2V/100Ah',
  nominalVoltage: 48,
  capacityWh: 5120,
  maxCurrentA: 100,
  msrpUsd: 3400,
  description: 'Discover AES Rackmount LiFePO4 battery 51.2V/100Ah with CAN/RS485 communication. Confirm communication profile and closed-loop compatibility per inverter setup.',
  partNumber: '48-42-5120',
  productUrl: 'https://www.cdnrg.com/products/48-48-5120-h',
  source: 'Discover Battery 2025',
  dataQuality: 'partial',
  notes: 'Placeholder pricing/specs. Confirm communication profile and closed-loop compatibility per inverter setup.',
  width: 80,
  height: 100,
  positiveTerminal: {
    side: 'top',
    offsetX: 20,
    offsetY: -50,
    maxCurrentA: 100,
    connector: { kind: 'stud', holeSize: 'M8' },
  },
  negativeTerminal: {
    side: 'top',
    offsetX: -20,
    offsetY: -50,
    maxCurrentA: 100,
    connector: { kind: 'stud', holeSize: 'M8' },
  },
  batteryRatings: {
    nominalVoltageV: 51.2,
    capacityAh: 100,
    capacityWh: 5120,
    capacityKwh: 5.12,
    maxDischargeCurrentA: 100,
    chemistry: 'LiFePO4',
    communicationInterfaces: ['CAN', 'RS485'],
    hasInternalBms: true,
    seriesAllowed: false,
    parallelAllowed: true,
  },
});

export default product;
