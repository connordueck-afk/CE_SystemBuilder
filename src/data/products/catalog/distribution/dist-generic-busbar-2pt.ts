import { defineGenericBusbar } from '../../helpers/distributionCatalog';

export default defineGenericBusbar({
  id: 'dist-generic-busbar-2pt',
  name: 'Generic Busbar 2-point',
  connectionCount: 2,
  maxCurrentA: 400,
  msrpUsd: 45,
  oemPriceUsd: 31,
  width: 140,
  offsets: [-52, 52],
});
