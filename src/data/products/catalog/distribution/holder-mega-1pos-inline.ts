import {
  dcPort,
  dcStudTerminal,
  defineDistributionProduct,
  powerGroup,
} from '../../helpers/distributionCatalog';

const product = defineDistributionProduct({
  id: 'holder-mega-1pos-inline',
  manufacturer: 'Littelfuse',
  name: 'MEGA Fuse Holder 1-Position',
  productType: 'fuse_holder',
  category: 'Fuse Holders',
  maxCurrentA: 500,
  msrpUsd: 25,
  oemPriceUsd: 17.50,
  description: 'Littelfuse 1-position inline MEGA fuse holder. M8 studs for cable connection.',
  partNumber: 'TBD',
  productUrl: 'https://www.littelfuse.com/products/fuse-blocks-fuseholders-and-fuse-accessories/fuseholders.aspx',
  source: 'Littelfuse catalog 2024',
  dataQuality: 'placeholder',
  imageUrl: '/product-images/holder-mega-1pos.svg',
  width: 92,
  height: 40,
  terminals: [
    dcStudTerminal({ id: 'in_pos', label: 'IN+', terminalGroupId: 'positive_bus', side: 'left', offsetX: -26, offsetY: 0, notes: 'Input positive stud, M8. Connect from source (battery, busbar, etc.).' }),
    dcStudTerminal({ id: 'out_pos', label: 'OUT+', terminalGroupId: 'slot_out', side: 'right', offsetX: 26, offsetY: 0, notes: 'Fused output positive stud, M8. Connect to load or downstream distribution.' }),
  ],
  terminalGroups: [
    powerGroup({ id: 'positive_bus', portId: 'main', label: 'Positive Bus', polarity: 'positive', maxCurrentA: 500 }),
    powerGroup({ id: 'slot_out', portId: 'slot_1', label: 'Fuse Output', polarity: 'positive', internallyCommon: false, maxCurrentA: 500 }),
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
    ],
    fuseSlots: [
      {
        id: 'slot_1',
        label: 'MEGA Fuse',
        upstreamBusId: 'positive_bus',
        downstreamTerminalId: 'out_pos',
        fuseStyle: 'MEGA',
        protectionType: 'fuse',
        defaultInstalled: false,
        maxFuseA: 500,
      },
    ],
  },
  ports: [
    dcPort({ id: 'main', label: 'Main Circuit', topology: 'bus', role: 'bus', maxCurrentA: 500 }),
    dcPort({ id: 'slot_1', label: 'Fuse Output', topology: 'bus', role: 'bus', maxCurrentA: 500 }),
  ],
});

export default product;
