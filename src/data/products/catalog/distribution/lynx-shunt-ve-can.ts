import {
  dcPort,
  dcStudTerminal,
  defineDistributionProduct,
  powerGroup,
} from '../../helpers/distributionCatalog';

const product = defineDistributionProduct({
  id: 'lynx-shunt-ve-can',
  manufacturer: 'Victron',
  name: 'Lynx Shunt VE.Can',
  productType: 'dc_distribution',
  imageUrl: '/product-images/victron/lynx_shunt_ve_can.svg',
  nominalVoltage: [12, 24, 48],
  maxCurrentA: 1000,
  msrpUsd: 420,
  description: 'Victron Lynx Shunt VE.Can - precision 1000A current measurement module for the Lynx system. VE.Can communication.',
  partNumber: 'LYN040102100',
  productUrl: 'https://www.cdnrg.com/products/velyn040102100',
  source: 'Victron 2025',
  dataQuality: 'partial',
  notes: 'Placeholder pricing/specs.',
  width: 140,
  height: 100,
  terminals: [
    dcStudTerminal({ id: 'main_pos', label: 'Main+', terminalGroupId: 'main_pos', side: 'left', offsetX: -70, offsetY: -15, busLinkStandard: 'victron-lynx' }),
    dcStudTerminal({ id: 'main_neg', label: 'Main-', terminalGroupId: 'main_neg', side: 'left', offsetX: -70, offsetY: 15, busLinkStandard: 'victron-lynx' }),
    dcStudTerminal({ id: 'out_pos', label: 'Out+', terminalGroupId: 'out_pos', side: 'right', offsetX: 70, offsetY: -15, busLinkStandard: 'victron-lynx' }),
    dcStudTerminal({ id: 'out_neg', label: 'Out-', terminalGroupId: 'out_neg', side: 'right', offsetX: 70, offsetY: 15, busLinkStandard: 'victron-lynx' }),
  ],
  terminalGroups: [
    powerGroup({ id: 'main_pos', portId: 'main', label: 'Main Positive', polarity: 'positive', internallyCommon: false, maxCurrentA: 1000 }),
    powerGroup({ id: 'out_pos', portId: 'main', label: 'Output Positive', polarity: 'positive', internallyCommon: false, maxCurrentA: 1000 }),
    powerGroup({ id: 'main_neg', portId: 'main', label: 'Main Negative', polarity: 'negative', internallyCommon: false, maxCurrentA: 1000 }),
    powerGroup({ id: 'out_neg', portId: 'main', label: 'Output Negative', polarity: 'negative', internallyCommon: false, maxCurrentA: 1000 }),
  ],
  busbarRatings: {
    voltageRatingV: 58,
    currentRatingA: 1000,
    busDesignation: 'combined',
  },
  distributionTopology: {
    buses: [
      { id: 'positive_bus', label: 'Positive Bus', busType: 'dc_pos', terminalIds: ['main_pos', 'out_pos'], maxCurrentA: 1000 },
      { id: 'negative_shunt', label: 'Negative Shunt', busType: 'dc_neg', terminalIds: ['main_neg', 'out_neg'], maxCurrentA: 1000 },
    ],
  },
  ports: [
    dcPort({ id: 'main', label: 'Main', topology: 'pass_through', role: 'pass_through', maxCurrentA: 1000 }),
  ],
});

export default product;
