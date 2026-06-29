import { defineGenericBusbar } from '../../helpers/distributionCatalog';

export default defineGenericBusbar({
  id: 'dist-generic-busbar-8pt',
  name: 'Generic Busbar 8-point',
  connectionCount: 8,
  maxCurrentA: 600,
  msrpUsd: 93,
  oemPriceUsd: 65,
  width: 172,
  offsets: [-68, -48.57, -29.14, -9.71, 9.71, 29.14, 48.57, 68],
});
