import {
  dcPort,
  dcStudTerminal,
  defineDistributionProduct,
  powerGroup,
} from '../../helpers/distributionCatalog';

const product = defineDistributionProduct({
  id: 'lynx-class-t-power-in',
  manufacturer: 'Victron',
  name: 'Lynx Class-T Power In',
  productType: 'dc_distribution',
  imageUrl: '/product-images/victron_lynx_power_in.svg',
  nominalVoltage: [12, 24, 48],
  maxCurrentA: 1000,
  msrpUsd: 172,
  description: 'Victron Lynx Class-T Power In - DC busbar input module with integrated Class-T fuse holders.',
  partNumber: 'LYN020102010',
  productUrl: 'https://www.victronenergy.com/dc-distribution-systems/lynx-class-t-power-in',
  source: 'Victron 2025',
  dataQuality: 'partial',
  notes: 'Placeholder pricing/specs.',
  width: 140,
  height: 100,
  terminals: [
    dcStudTerminal({ id: 'main_pos', label: 'Bat+', terminalGroupId: 'positive_bus', side: 'left', offsetX: -70, offsetY: -20, busLinkStandard: 'victron-lynx', notes: 'Main positive input (battery side). Bidirectional.' }),
    dcStudTerminal({ id: 'main_neg', label: 'Bat-', terminalGroupId: 'negative_bus', side: 'left', offsetX: -70, offsetY: 20, busLinkStandard: 'victron-lynx', notes: 'Main negative input (battery side). Bidirectional.' }),
    dcStudTerminal({ id: 'pass_pos', label: 'Bus+', terminalGroupId: 'positive_bus', side: 'right', offsetX: 70, offsetY: -20, busLinkStandard: 'victron-lynx', notes: 'Unfused positive pass-through to the next Lynx module. Bidirectional.' }),
    dcStudTerminal({ id: 'pass_neg', label: 'Bus-', terminalGroupId: 'negative_bus', side: 'right', offsetX: 70, offsetY: 20, busLinkStandard: 'victron-lynx', notes: 'Unfused negative pass-through to the next Lynx module. Bidirectional.' }),
    dcStudTerminal({ id: 'out_pos_1', label: 'F1+', terminalGroupId: 'slot_1_pos', side: 'bottom', offsetX: -45, offsetY: 50, notes: 'Fused tap 1 positive, Class-T fuse holder. Source or load depending on topology.' }),
    dcStudTerminal({ id: 'out_neg_1', label: 'F1-', terminalGroupId: 'negative_bus', side: 'bottom', offsetX: -15, offsetY: 50, notes: 'Fused tap 1 negative return.' }),
    dcStudTerminal({ id: 'out_pos_2', label: 'F2+', terminalGroupId: 'slot_2_pos', side: 'bottom', offsetX: 15, offsetY: 50, notes: 'Fused tap 2 positive, Class-T fuse holder. Source or load depending on topology.' }),
    dcStudTerminal({ id: 'out_neg_2', label: 'F2-', terminalGroupId: 'negative_bus', side: 'bottom', offsetX: 45, offsetY: 50, notes: 'Fused tap 2 negative return.' }),
  ],
  terminalGroups: [
    powerGroup({ id: 'positive_bus', portId: 'main', label: 'Positive Bus', polarity: 'positive', maxCurrentA: 1000 }),
    powerGroup({ id: 'negative_bus', portId: 'main', label: 'Negative Bus', polarity: 'negative', maxCurrentA: 1000 }),
    powerGroup({ id: 'slot_1_pos', portId: 'slot_1', label: 'Class-T Fuse 1 Positive Output', polarity: 'positive', internallyCommon: false, requiresOvercurrentProtection: true, maxFuseA: 600 }),
    powerGroup({ id: 'slot_2_pos', portId: 'slot_2', label: 'Class-T Fuse 2 Positive Output', polarity: 'positive', internallyCommon: false, requiresOvercurrentProtection: true, maxFuseA: 600 }),
  ],
  busbarRatings: {
    voltageRatingV: 58,
    currentRatingA: 1000,
    busDesignation: 'combined',
  },
  distributionTopology: {
    buses: [
      {
        id: 'positive_bus',
        label: 'Positive Bus',
        busType: 'dc_pos',
        terminalIds: ['main_pos', 'pass_pos'],
        maxCurrentA: 1000,
      },
      {
        id: 'negative_bus',
        label: 'Negative Bus',
        busType: 'dc_neg',
        terminalIds: ['main_neg', 'pass_neg', 'out_neg_1', 'out_neg_2'],
        maxCurrentA: 1000,
      },
    ],
    fuseSlots: [
      { id: 'slot_1', label: 'Class-T Fuse 1', upstreamBusId: 'positive_bus', downstreamTerminalId: 'out_pos_1', pairedReturnTerminalId: 'out_neg_1', fuseStyle: 'Class T', protectionType: 'fuse', defaultInstalled: false, maxFuseA: 600 },
      { id: 'slot_2', label: 'Class-T Fuse 2', upstreamBusId: 'positive_bus', downstreamTerminalId: 'out_pos_2', pairedReturnTerminalId: 'out_neg_2', fuseStyle: 'Class T', protectionType: 'fuse', defaultInstalled: false, maxFuseA: 600 },
    ],
  },
  ports: [
    dcPort({ id: 'main', label: 'Main Bus', topology: 'bus', role: 'bus', maxCurrentA: 1000 }),
    dcPort({ id: 'slot_1', label: 'Class-T Fuse 1 Output', topology: 'bus', role: 'bus', maxCurrentA: 600 }),
    dcPort({ id: 'slot_2', label: 'Class-T Fuse 2 Output', topology: 'bus', role: 'bus', maxCurrentA: 600 }),
  ],
});

export default product;
