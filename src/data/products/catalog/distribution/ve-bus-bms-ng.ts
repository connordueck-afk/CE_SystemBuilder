import {
  commGroup,
  commPort,
  commTerminal,
  communicationPort,
  connector,
  dcPort,
  dcStudTerminal,
  defineDistributionProduct,
  powerGroup,
} from '../../helpers/distributionCatalog';

const product = defineDistributionProduct({
  id: 've-bus-bms-ng',
  manufacturer: 'Victron',
  name: 'VE.Bus BMS NG',
  productType: 'dc_distribution',
  nominalVoltage: [12, 24, 48],
  msrpUsd: 260,
  description: 'Victron VE.Bus BMS NG - battery management system for Victron Lithium NG batteries. VE.Bus / Bluetooth.',
  partNumber: 'VE.Bus BMS NG',
  source: 'Victron 2025',
  dataQuality: 'partial',
  notes: 'Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.',
  width: 80,
  height: 60,
  terminals: [
    dcStudTerminal({ id: 'bat_pos', label: 'Bat+', terminalGroupId: 'bat_pos_sense', side: 'left', offsetX: -40, offsetY: 0, maxCurrentA: 1, connector: connector('comm'), notes: 'Low-current battery positive sense/control reference.' }),
    commTerminal({ id: 'signal', label: 'VE.Bus', terminalGroupId: 've_bus_iface', side: 'right', offsetX: 40, offsetY: 0 }),
  ],
  terminalGroups: [
    powerGroup({ id: 'bat_pos_sense', portId: 'dc_sense', label: 'Battery Positive Sense', polarity: 'positive', internallyCommon: false, maxCurrentA: 1 }),
    commGroup('ve_bus_iface', 've_bus', 'VE.Bus Interface'),
  ],
  ports: [
    dcPort({ id: 'dc_sense', label: 'Battery Sense', topology: 'bus', role: 'sense', direction: 'input', maxCurrentA: 1 }),
    commPort({ id: 've_bus', label: 'VE.Bus', protocols: ['VE.Bus'] }),
  ],
  communicationPorts: [
    communicationPort('signal', 'VE.Bus', ['VE.Bus']),
  ],
});

export default product;
