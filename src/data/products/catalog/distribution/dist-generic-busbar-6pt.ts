import { defineGenericBusbar } from '../../helpers/distributionCatalog';

export default defineGenericBusbar({
  id: 'dist-generic-busbar-6pt',
  name: 'Generic Busbar 6-point',
  connectionCount: 6,
  maxCurrentA: 600,
  msrpUsd: 77,
  oemPriceUsd: 54,
  width: 140,
  offsets: [-52, -31.2, -10.4, 10.4, 31.2, 52],
});
