import { defineCatalogBattery } from '../../helpers/batteryCatalog';

const product = defineCatalogBattery({
  id: 'victron-lithium-ng-25-100',
  manufacturer: 'Victron',
  name: 'Lithium Battery NG 25.6V/100Ah',
  nominalVoltage: 24,
  capacityWh: 2560,
  maxCurrentA: 200,
  msrpUsd: 2300,
  description: 'Lithium NG battery 25.6V/100Ah - next-generation Victron lithium with VE.Bus BMS NG / Lynx Smart BMS NG integration',
  partNumber: 'BAT524110610',
  source: 'Victron 2025',
  dataQuality: 'partial',
  notes: 'Placeholder pricing/specs.',
  width: 128,
  height: 98,
  positiveTerminal: {
    side: 'top',
    offsetX: 35,
    offsetY: -45,
    maxCurrentA: 200,
    connector: { kind: 'stud', holeSize: 'M8' },
  },
  negativeTerminal: {
    side: 'top',
    offsetX: -41,
    offsetY: -45,
    maxCurrentA: 200,
    connector: { kind: 'stud', holeSize: 'M8' },
  },
  communicationTerminals: [
    {
      id: 'bms_can',
      label: 'BMS-Can',
      side: 'top',
      offsetX: 0,
      offsetY: -49,
      connectorType: 'RJ45',
      supportedProtocols: ['BMS-Can'],
      configuredProtocol: 'BMS-Can',
    },
  ],
  batteryRatings: {
    nominalVoltageV: 25.6,
    capacityAh: 100,
    capacityWh: 2560,
    capacityKwh: 2.56,
    maxDischargeCurrentA: 200,
    chemistry: 'LiFePO4',
    communicationInterfaces: ['VE.Bus BMS NG', 'Lynx Smart BMS NG'],
    hasInternalBms: true,
    seriesAllowed: false,
    parallelAllowed: true,
  },
});

export default product;
