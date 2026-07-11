import {
  dcPort,
  dcStudTerminal,
  defineDistributionProduct,
  powerGroup,
} from '../../helpers/distributionCatalog';

const product = defineDistributionProduct({
  id: 'holder-class-t-1pos',
  manufacturer: 'Blue Sea Systems',
  name: 'Class T Fuse Holder 1-Position',
  productType: 'fuse_holder',
  category: 'Fuse Holders',
  maxCurrentA: 400,
  msrpUsd: 55,
  oemPriceUsd: 38.50,
  description: 'Blue Sea Systems Class T fuse holder, 1-position. M10 studs for high-current battery circuits.',
  partNumber: '5502100',
  productUrl: 'https://www.bluesea.com/products/5502100/Class_T_Fuse_Block',
  source: 'Blue Sea Systems catalog',
  dataQuality: 'partial',
  imageUrl: '/product-images/holder-class-t-1pos.svg',
  width: 150,
  height: 60,
  terminals: [
    dcStudTerminal({ id: 'in_pos', label: 'IN+', terminalGroupId: 'positive_bus', side: 'left', offsetX: -45, offsetY: 0, connector: { kind: 'stud', holeSize: 'M10' }, notes: 'Input positive stud, M10.' }),
    dcStudTerminal({ id: 'out_pos', label: 'OUT+', terminalGroupId: 'slot_out', side: 'right', offsetX: 45, offsetY: 0, connector: { kind: 'stud', holeSize: 'M10' }, notes: 'Fused output positive stud, M10.' }),
  ],
  terminalGroups: [
    powerGroup({ id: 'positive_bus', portId: 'main', label: 'Positive Bus', polarity: 'positive', maxCurrentA: 400 }),
    powerGroup({ id: 'slot_out', portId: 'slot_1', label: 'Fuse Output', polarity: 'positive', internallyCommon: false, maxCurrentA: 400 }),
  ],
  distributionTopology: {
    buses: [
      {
        id: 'positive_bus',
        label: 'Positive Bus',
        busType: 'dc_pos',
        terminalIds: ['in_pos'],
        maxCurrentA: 400,
      },
    ],
    fuseSlots: [
      {
        id: 'slot_1',
        label: 'Class T Fuse',
        upstreamBusId: 'positive_bus',
        downstreamTerminalId: 'out_pos',
        fuseStyle: 'Class T',
        protectionType: 'fuse',
        defaultInstalled: false,
        maxFuseA: 400,
      },
    ],
  },
  ports: [
    dcPort({ id: 'main', label: 'Main Circuit', topology: 'bus', role: 'bus', maxCurrentA: 400 }),
    dcPort({ id: 'slot_1', label: 'Fuse Output', topology: 'bus', role: 'bus', maxCurrentA: 400 }),
  ],
});

export default product;
