import {
  dcPort,
  dcStudTerminal,
  defineDistributionProduct,
  powerGroup,
} from '../../helpers/distributionCatalog';

const product = defineDistributionProduct({
  id: 'holder-anl-1pos-inline',
  manufacturer: 'Blue Sea Systems',
  name: 'ANL Fuse Holder 1-Position',
  productType: 'fuse_holder',
  category: 'Fuse Holders',
  maxCurrentA: 500,
  msrpUsd: 30,
  oemPriceUsd: 21,
  description: 'Blue Sea Systems ANL fuse holder, 1-position, M8 studs. 500A max.',
  partNumber: '5005100',
  productUrl: 'https://www.bluesea.com/products/5005100/ANL_Fuse_Block',
  source: 'Blue Sea Systems catalog',
  dataQuality: 'partial',
  imageUrl: '/product-images/holder-anl-1pos.svg',
  width: 130,
  height: 50,
  terminals: [
    dcStudTerminal({ id: 'in_pos', label: 'IN+', terminalGroupId: 'positive_bus', side: 'left', offsetX: -42, offsetY: 0, notes: 'Input positive stud, M8.' }),
    dcStudTerminal({ id: 'out_pos', label: 'OUT+', terminalGroupId: 'slot_out', side: 'right', offsetX: 42, offsetY: 0, notes: 'Fused output positive stud, M8.' }),
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
        label: 'ANL Fuse',
        upstreamBusId: 'positive_bus',
        downstreamTerminalId: 'out_pos',
        fuseStyle: 'ANL',
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
