import {
  dcPort,
  dcStudTerminal,
  defineDistributionProduct,
  powerGroup,
} from '../../helpers/distributionCatalog';

const product = defineDistributionProduct({
  id: 'holder-mega-2pos-inline',
  manufacturer: 'Littelfuse',
  name: 'MEGA Fuse Holder 2-Position',
  productType: 'fuse_holder',
  category: 'Fuse Holders',
  maxCurrentA: 500,
  msrpUsd: 45,
  oemPriceUsd: 31.50,
  description: 'Littelfuse 2-position inline MEGA fuse holder. Common input, two independently fused outputs. M8 studs.',
  partNumber: 'TBD',
  productUrl: 'https://www.littelfuse.com/products/fuse-blocks-fuseholders-and-fuse-accessories/fuseholders.aspx',
  source: 'Littelfuse catalog 2024',
  dataQuality: 'placeholder',
  imageUrl: '/product-images/holder-mega-2pos.svg',
  width: 140,
  height: 70,
  terminals: [
    dcStudTerminal({ id: 'in_pos', label: 'IN+', terminalGroupId: 'positive_bus', side: 'left', offsetX: -50, offsetY: -15, notes: 'Common input positive stud, M8.' }),
    dcStudTerminal({ id: 'in_neg', label: 'IN-', terminalGroupId: 'negative_bus', side: 'left', offsetX: -50, offsetY: 15, notes: 'Common input negative stud, M8.' }),
    dcStudTerminal({ id: 'out_pos_1', label: 'F1+', terminalGroupId: 'slot_1_out', side: 'right', offsetX: -6, offsetY: -15, notes: 'Fused output 1 positive stud, M8.' }),
    dcStudTerminal({ id: 'out_neg_1', label: 'F1-', terminalGroupId: 'negative_bus', side: 'right', offsetX: -6, offsetY: 15, notes: 'Output 1 negative return stud, M8.' }),
    dcStudTerminal({ id: 'out_pos_2', label: 'F2+', terminalGroupId: 'slot_2_out', side: 'right', offsetX: 36, offsetY: -15, notes: 'Fused output 2 positive stud, M8.' }),
    dcStudTerminal({ id: 'out_neg_2', label: 'F2-', terminalGroupId: 'negative_bus', side: 'right', offsetX: 36, offsetY: 15, notes: 'Output 2 negative return stud, M8.' }),
  ],
  terminalGroups: [
    powerGroup({ id: 'positive_bus', portId: 'main', label: 'Positive Bus', polarity: 'positive', maxCurrentA: 500 }),
    powerGroup({ id: 'negative_bus', portId: 'main', label: 'Negative Bus', polarity: 'negative', maxCurrentA: 500 }),
    powerGroup({ id: 'slot_1_out', portId: 'slot_1', label: 'Fuse 1 Output', polarity: 'positive', internallyCommon: false, maxCurrentA: 500 }),
    powerGroup({ id: 'slot_2_out', portId: 'slot_2', label: 'Fuse 2 Output', polarity: 'positive', internallyCommon: false, maxCurrentA: 500 }),
  ],
  distributionTopology: {
    buses: [
      {
        id: 'positive_bus',
        label: 'Positive Bus',
        busType: 'dc_pos',
        terminalIds: ['in_pos'],
        maxCurrentA: 500,
      },
      {
        id: 'negative_bus',
        label: 'Negative Bus',
        busType: 'dc_neg',
        terminalIds: ['in_neg', 'out_neg_1', 'out_neg_2'],
        maxCurrentA: 500,
      },
    ],
    fuseSlots: [
      {
        id: 'slot_1',
        label: 'Fuse 1',
        upstreamBusId: 'positive_bus',
        downstreamTerminalId: 'out_pos_1',
        pairedReturnTerminalId: 'out_neg_1',
        fuseStyle: 'MEGA',
        protectionType: 'fuse',
        defaultInstalled: false,
        maxFuseA: 500,
      },
      {
        id: 'slot_2',
        label: 'Fuse 2',
        upstreamBusId: 'positive_bus',
        downstreamTerminalId: 'out_pos_2',
        pairedReturnTerminalId: 'out_neg_2',
        fuseStyle: 'MEGA',
        protectionType: 'fuse',
        defaultInstalled: false,
        maxFuseA: 500,
      },
    ],
  },
  ports: [
    dcPort({ id: 'main', label: 'Main Circuit', topology: 'bus', role: 'bus', maxCurrentA: 500 }),
    dcPort({ id: 'slot_1', label: 'Fuse 1 Output', topology: 'bus', role: 'bus', maxCurrentA: 500 }),
    dcPort({ id: 'slot_2', label: 'Fuse 2 Output', topology: 'bus', role: 'bus', maxCurrentA: 500 }),
  ],
});

export default product;
