import {
  dcPort,
  dcStudTerminal,
  defineDistributionProduct,
  powerGroup,
} from '../../helpers/distributionCatalog';

const product = defineDistributionProduct({
  id: 'holder-midi-1pos-inline',
  manufacturer: 'Littelfuse',
  name: 'MIDI Fuse Holder 1-Position',
  productType: 'fuse_holder',
  category: 'Fuse Holders',
  maxCurrentA: 200,
  msrpUsd: 15,
  oemPriceUsd: 10.50,
  description: 'Littelfuse 1-position inline MIDI fuse holder. M6 studs for cable connection.',
  partNumber: 'TBD',
  productUrl: 'https://www.littelfuse.com/products/fuse-blocks-fuseholders-and-fuse-accessories/fuseholders.aspx',
  source: 'Littelfuse catalog 2024',
  dataQuality: 'placeholder',
  imageUrl: '/product-images/holder-midi-1pos.svg',
  width: 70,
  height: 32,
  terminals: [
    dcStudTerminal({ id: 'in_pos', label: 'IN+', terminalGroupId: 'positive_bus', side: 'left', offsetX: -20, offsetY: 0, notes: 'Input positive stud, M6.', connector: { kind: 'stud', holeSize: 'M6' } }),
    dcStudTerminal({ id: 'out_pos', label: 'OUT+', terminalGroupId: 'slot_out', side: 'right', offsetX: 20, offsetY: 0, notes: 'Fused output positive stud, M6.', connector: { kind: 'stud', holeSize: 'M6' } }),
  ],
  terminalGroups: [
    powerGroup({ id: 'positive_bus', portId: 'main', label: 'Positive Bus', polarity: 'positive', maxCurrentA: 200 }),
    powerGroup({ id: 'slot_out', portId: 'slot_1', label: 'Fuse Output', polarity: 'positive', internallyCommon: false, maxCurrentA: 200 }),
  ],
  distributionTopology: {
    buses: [
      {
        id: 'positive_bus',
        label: 'Positive Bus',
        busType: 'dc_pos',
        terminalIds: ['in_pos'],
        maxCurrentA: 200,
      },
    ],
    fuseSlots: [
      {
        id: 'slot_1',
        label: 'MIDI Fuse',
        upstreamBusId: 'positive_bus',
        downstreamTerminalId: 'out_pos',
        fuseStyle: 'MIDI',
        protectionType: 'fuse',
        defaultInstalled: false,
        maxFuseA: 200,
      },
    ],
  },
  ports: [
    dcPort({ id: 'main', label: 'Main Circuit', topology: 'bus', role: 'bus', maxCurrentA: 200 }),
    dcPort({ id: 'slot_1', label: 'Fuse Output', topology: 'bus', role: 'bus', maxCurrentA: 200 }),
  ],
});

export default product;
