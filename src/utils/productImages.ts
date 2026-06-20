import type { ProductType } from '../types/system';

const GENERIC_IMAGE_MAP: Partial<Record<ProductType, string>> = {
  mppt:             '/product-images/generic-mppt.svg',
  battery:          '/product-images/generic-battery.svg',
  solar_array:      '/product-images/generic-solar.svg',
  solar_combiner:   '/product-images/generic-solar-combiner.svg',
  inverter_charger: '/product-images/generic-inverter-charger.svg',
  dc_dc_charger:    '/product-images/generic-dc-dc-charger.svg',
  shore_charger:    '/product-images/generic-shore-charger.svg',
  fuse:             '/product-images/generic-fuse.svg',
  breaker:          '/product-images/generic-breaker.svg',
  monitor:          '/product-images/generic-monitor.svg',
  batteryMonitor:   '/product-images/generic-monitor.svg',
  busbar:           '/product-images/generic-busbar.svg',
  dc_distribution:  '/product-images/generic-busbar.svg',
  dc_load:          '/product-images/generic-dc-load.svg',
  ac_load:          '/product-images/generic-ac-load.svg',
  ac_distribution:  '/product-images/generic-ac-distribution.svg',
  shorePowerInlet:  '/product-images/generic-shore-power-inlet.svg',
  transferSwitch:   '/product-images/generic-transfer-switch.svg',
  accessory:        '/product-images/generic-accessory.svg',
};

export function getProductImageUrl(productType: ProductType): string | undefined {
  return GENERIC_IMAGE_MAP[productType];
}
