import {
  dcPort,
  dcStudTerminal,
  defineDistributionProduct,
  powerGroup,
} from '../../helpers/distributionCatalog';

const product = defineDistributionProduct({
  id: 'dist-vic-lynx-power-in',
  manufacturer: 'Victron',
  name: 'Lynx Power In',
  productType: 'dc_distribution',
  imageUrl: '/product-images/victron/lynx_power_in_m8.svg',
  nominalVoltage: [12, 24, 48],
  maxCurrentA: 1000,
  msrpUsd: 249,
  oemPriceUsd: 174,
  description: 'Victron Lynx Power In - unfused DC busbar module (same housing as the Lynx Distributor, no fuses)',
  partNumber: 'LYN040102000',
  productUrl: 'https://www.victronenergy.com/dc-distribution-systems/lynx-power-in',
  source: 'Victron 2024',
  dataQuality: 'partial',
  width: 180,
  height: 110,
  terminals: [
    dcStudTerminal({ id: 'main_pos', label: 'Bat+', terminalGroupId: 'positive_bus', side: 'left', offsetX: -82, offsetY: -30, busLinkStandard: 'victron-lynx', notes: 'Main positive input (battery side). Bidirectional.' }),
    dcStudTerminal({ id: 'main_neg', label: 'Bat-', terminalGroupId: 'negative_bus', side: 'left', offsetX: -82, offsetY: 30, busLinkStandard: 'victron-lynx', notes: 'Main negative input (battery side). Bidirectional.' }),
    dcStudTerminal({ id: 'pass_pos', label: 'Bus+', terminalGroupId: 'positive_bus', side: 'right', offsetX: 82, offsetY: -30, busLinkStandard: 'victron-lynx', notes: 'Unfused positive pass-through to the next Lynx module. Bidirectional.' }),
    dcStudTerminal({ id: 'pass_neg', label: 'Bus-', terminalGroupId: 'negative_bus', side: 'right', offsetX: 82, offsetY: 30, busLinkStandard: 'victron-lynx', notes: 'Unfused negative pass-through to the next Lynx module. Bidirectional.' }),
    dcStudTerminal({ id: 'out_pos_1', label: '+1', terminalGroupId: 'positive_bus', side: 'bottom', offsetX: -54, offsetY: 50, notes: 'Unfused positive bus connection. Source or load depending on topology.' }),
    dcStudTerminal({ id: 'out_neg_1', label: '-1', terminalGroupId: 'negative_bus', side: 'bottom', offsetX: -42, offsetY: 50, notes: 'Unfused negative bus connection. Source or load depending on topology.' }),
    dcStudTerminal({ id: 'out_pos_2', label: '+2', terminalGroupId: 'positive_bus', side: 'bottom', offsetX: -18, offsetY: 50, notes: 'Unfused positive bus connection. Source or load depending on topology.' }),
    dcStudTerminal({ id: 'out_neg_2', label: '-2', terminalGroupId: 'negative_bus', side: 'bottom', offsetX: -6, offsetY: 50, notes: 'Unfused negative bus connection. Source or load depending on topology.' }),
    dcStudTerminal({ id: 'out_pos_3', label: '+3', terminalGroupId: 'positive_bus', side: 'bottom', offsetX: 18, offsetY: 50, notes: 'Unfused positive bus connection. Source or load depending on topology.' }),
    dcStudTerminal({ id: 'out_neg_3', label: '-3', terminalGroupId: 'negative_bus', side: 'bottom', offsetX: 30, offsetY: 50, notes: 'Unfused negative bus connection. Source or load depending on topology.' }),
    dcStudTerminal({ id: 'out_pos_4', label: '+4', terminalGroupId: 'positive_bus', side: 'bottom', offsetX: 54, offsetY: 50, notes: 'Unfused positive bus connection. Source or load depending on topology.' }),
    dcStudTerminal({ id: 'out_neg_4', label: '-4', terminalGroupId: 'negative_bus', side: 'bottom', offsetX: 66, offsetY: 50, notes: 'Unfused negative bus connection. Source or load depending on topology.' }),
  ],
  terminalGroups: [
    powerGroup({ id: 'positive_bus', portId: 'main', label: 'Positive Bus', polarity: 'positive', maxCurrentA: 1000 }),
    powerGroup({ id: 'negative_bus', portId: 'main', label: 'Negative Bus', polarity: 'negative', maxCurrentA: 1000 }),
  ],
  busbarRatings: {
    voltageRatingV: 58,
    currentRatingA: 1000,
    connectionCount: 4,
    busDesignation: 'combined',
  },
  distributionTopology: {
    buses: [
      {
        id: 'positive_bus',
        label: 'Positive Bus',
        busType: 'dc_pos',
        terminalIds: ['main_pos', 'pass_pos', 'out_pos_1', 'out_pos_2', 'out_pos_3', 'out_pos_4'],
        maxCurrentA: 1000,
      },
      {
        id: 'negative_bus',
        label: 'Negative Bus',
        busType: 'dc_neg',
        terminalIds: ['main_neg', 'pass_neg', 'out_neg_1', 'out_neg_2', 'out_neg_3', 'out_neg_4'],
        maxCurrentA: 1000,
      },
    ],
  },
  ports: [
    dcPort({ id: 'main', label: 'Main', topology: 'bus', role: 'bus', maxCurrentA: 1000 }),
  ],
});

export default product;