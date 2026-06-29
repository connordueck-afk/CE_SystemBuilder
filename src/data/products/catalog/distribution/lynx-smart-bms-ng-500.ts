import {
  commGroup,
  commPort,
  commTerminal,
  communicationPort,
  dcPort,
  dcStudTerminal,
  defineDistributionProduct,
  powerGroup,
} from '../../helpers/distributionCatalog';

const product = defineDistributionProduct({
  id: 'lynx-smart-bms-ng-500',
  manufacturer: 'Victron',
  name: 'Lynx Smart BMS NG 500',
  productType: 'dc_distribution',
  imageUrl: '/product-images/victron/lynx_smart_bms_500.svg',
  nominalVoltage: [12, 24, 48],
  maxCurrentA: 500,
  msrpUsd: 950,
  description: 'Victron Lynx Smart BMS NG 500A - next-generation BMS for Victron Lithium NG batteries. VE.Can / Bluetooth.',
  partNumber: 'Lynx Smart BMS NG 500',
  source: 'Victron 2025',
  dataQuality: 'partial',
  notes: 'Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.',
  width: 140,
  height: 100,
  terminals: [
    dcStudTerminal({ id: 'bat_pos', label: 'Bat+', terminalGroupId: 'bat_pos', side: 'left', offsetX: -70, offsetY: -15, busLinkStandard: 'victron-lynx' }),
    dcStudTerminal({ id: 'bat_neg', label: 'Bat-', terminalGroupId: 'bat_neg', side: 'left', offsetX: -70, offsetY: 15, busLinkStandard: 'victron-lynx' }),
    dcStudTerminal({ id: 'load_pos', label: 'Load+', terminalGroupId: 'load_pos', side: 'right', offsetX: 70, offsetY: -15, busLinkStandard: 'victron-lynx' }),
    dcStudTerminal({ id: 'load_neg', label: 'Load-', terminalGroupId: 'load_neg', side: 'right', offsetX: 70, offsetY: 15, busLinkStandard: 'victron-lynx' }),
    commTerminal({ id: 've_can', label: 'VE.Can', terminalGroupId: 've_can_iface', side: 'top', offsetX: 0, offsetY: -50 }),
  ],
  terminalGroups: [
    powerGroup({ id: 'bat_pos', portId: 'main', label: 'Battery Positive', polarity: 'positive', internallyCommon: false, maxCurrentA: 500 }),
    powerGroup({ id: 'load_pos', portId: 'main', label: 'Load Positive', polarity: 'positive', internallyCommon: false, maxCurrentA: 500 }),
    powerGroup({ id: 'bat_neg', portId: 'main', label: 'Battery Negative', polarity: 'negative', internallyCommon: false, maxCurrentA: 500 }),
    powerGroup({ id: 'load_neg', portId: 'main', label: 'Load Negative', polarity: 'negative', internallyCommon: false, maxCurrentA: 500 }),
    commGroup('ve_can_iface', 've_can', 'VE.Can Interface'),
  ],
  busbarRatings: {
    voltageRatingV: 58,
    currentRatingA: 500,
    busDesignation: 'combined',
  },
  distributionTopology: {
    buses: [
      { id: 'positive_path', label: 'Positive Path', busType: 'dc_pos', terminalIds: ['bat_pos', 'load_pos'], maxCurrentA: 500 },
      { id: 'negative_path', label: 'Negative Path', busType: 'dc_neg', terminalIds: ['bat_neg', 'load_neg'], maxCurrentA: 500 },
    ],
  },
  ports: [
    dcPort({ id: 'main', label: 'Main', topology: 'pass_through', role: 'pass_through', maxCurrentA: 500 }),
    commPort({ id: 've_can', label: 'VE.Can', protocols: ['VE.Can'] }),
  ],
  communicationPorts: [
    communicationPort('ve_can', 'VE.Can', ['VE.Can']),
  ],
});

export default product;
