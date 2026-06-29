import { defineGenericBusbar } from '../../helpers/distributionCatalog';

export default defineGenericBusbar({
  id: 'dist-generic-busbar-7pt',
  name: 'Generic Busbar 7-point',
  connectionCount: 7,
  maxCurrentA: 600,
  msrpUsd: 85,
  oemPriceUsd: 59,
  width: 154,
  offsets: [-59, -39.33, -19.67, 0, 19.67, 39.33, 59],
});
