import { defineGenericBusbar } from '../../helpers/distributionCatalog';

export default defineGenericBusbar({
  id: 'dist-generic-busbar',
  name: 'Generic Busbar 4-point',
  connectionCount: 4,
  maxCurrentA: 400,
  msrpUsd: 61,
  oemPriceUsd: 43,
  width: 140,
  offsets: [-52, -17.33, 17.33, 52],
});
