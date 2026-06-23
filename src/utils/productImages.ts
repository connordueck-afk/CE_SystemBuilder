import type { Product, ProductType } from '../types/system';

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

const VICTRON_IMAGE_BASE = '/product-images/victron/';
const DISCOVER_IMAGE_BASE = '/product-images/discover/';

const VICTRON_PART_IMAGE_MAP: Record<string, string> = {
  ASS030537010: 'vebus_smart_dongle',
  ASS030543020: 'globallink_520',
  BPP900455050: 'gx_touch_50',
  BPP900455070: 'gx_touch_70',
  BPP900480100: 'ekrano_gx',
  LYN020102010: 'lynx_class_t_power_in',
  LYN034160200: 'lynx_smart_bms_500',
  ORI121222120: 'orion_tr_smart_medium_isolated',
  ORI122424120: 'orion_tr_smart_medium_isolated',
  ORI122436120: 'orion_tr_smart_large_isolated',
  ORI124838120: 'orion_tr_smart_large_isolated',
  ORI241224120: 'orion_tr_smart_medium_isolated',
  ORI241236120: 'orion_tr_smart_large_isolated',
  ORI242417040: 'orion_xs_1400',
  ORI242428120: 'orion_tr_smart_medium_isolated',
  ORI242440120: 'orion_tr_smart_large_isolated',
  ORI244840120: 'orion_tr_smart_medium_isolated',
  PIN122122500: 'inverter_vedirect_medium_120v',
  PMP122200102: 'multiplus_3000_120v',
  PMP122405200: 'multiplus_ii_12v_4k_120v',
  PMP242305132: 'multiplus_ii_24v_120v',
  PMP482305102: 'multiplus_ii_48v_120v',
  PMP482505110: 'multiplus_ii_48v_5000_120v',
  QUA122305130: 'quattro_3000_2x120v',
  QUA242305130: 'quattro_3000_2x120v',
  SCC075015060R: 'smartsolar_mppt_small_screw_terminal',
  SCC110020160R: 'smartsolar_mppt_small_screw_terminal',
  SCC110030210: 'smartsolar_mppt_medium_screw_terminal',
  SCC110050210: 'smartsolar_mppt_medium_screw_terminal',
  SCC115035210: 'smartsolar_mppt_medium_screw_terminal',
  SCC115045212: 'smartsolar_mppt_medium_screw_terminal',
  SCC115070211: 'smartsolar_mppt_large_tr',
  SCC115085411: 'smartsolar_mppt_large_ve_can_tr',
  SCC125070421: 'smartsolar_mppt_large_ve_can_tr',
  SHU050150050: 'smartshunt_standard',
  SHU050210050: 'smartshunt_large',
  SHU050220050: 'smartshunt_large',
};

function victronImage(assetId: string): string {
  return `${VICTRON_IMAGE_BASE}${assetId}.svg`;
}

function discoverImage(assetId: string): string {
  return `${DISCOVER_IMAGE_BASE}${assetId}.svg`;
}

function victronFallbackAssetId(product: Product): string | undefined {
  const name = product.name.toLowerCase();

  if (product.productType === 'mppt') {
    if (name.includes('75/15') || name.includes('100/20')) return 'smartsolar_mppt_small_screw_terminal';
    if (name.includes('100/30') || name.includes('100/50') || name.includes('150/35') || name.includes('150/45')) {
      return 'smartsolar_mppt_medium_screw_terminal';
    }
    if (name.includes('150/60') || name.includes('150/70')) return 'smartsolar_mppt_large_tr';
    if (name.includes('150/85') || name.includes('150/100') || name.includes('250/70') || name.includes('250/100')) {
      return 'smartsolar_mppt_large_ve_can_tr';
    }
  }

  if (product.productType === 'battery') {
    if (name.includes('smartlithium') || name.includes('lithium battery ng')) {
      return 'lithium_smart_battery_12v_200ah';
    }
  }

  if (product.productType === 'dc_dc_charger') {
    if (name.includes('orion xs')) return 'orion_xs_1400';
    if (name.includes('orion-tr smart')) {
      return product.maxCurrentA != null && product.maxCurrentA >= 15
        ? 'orion_tr_smart_large_isolated'
        : 'orion_tr_smart_medium_isolated';
    }
  }

  if (product.productType === 'inverter_charger') {
    if (name.includes('phoenix inverter')) return 'inverter_vedirect_medium_120v';
    if (name.includes('quattro') && (name.includes('10000') || name.includes('15000'))) return 'quattro_10000_120v';
    if (name.includes('quattro') && name.includes('5000')) return 'quattro_5000_120v';
    if (name.includes('quattro')) return 'quattro_3000_2x120v';
    if (name.includes('multiplus-ii') && name.includes('12/4000')) return 'multiplus_ii_12v_4k_120v';
    if (name.includes('multiplus-ii') && name.includes('48/5000')) return 'multiplus_ii_48v_5000_120v';
    if (name.includes('multiplus-ii') && name.includes('48/')) return 'multiplus_ii_48v_120v';
    if (name.includes('multiplus-ii') && name.includes('24/')) return 'multiplus_ii_24v_120v';
    if (name.includes('multiplus-ii')) return 'multiplus_ii_12v_120v';
    if (name.includes('multiplus')) return 'multiplus_3000_120v';
  }

  if (product.productType === 'dc_distribution') {
    if (name.includes('lynx distributor')) return 'lynx_distributor';
    if (name.includes('lynx class-t')) return 'lynx_class_t_power_in';
    if (name.includes('lynx power in')) return 'lynx_power_in';
    if (name.includes('lynx shunt')) return 'lynx_shunt_ve_can';
    if (name.includes('lynx smart bms') && name.includes('1000')) return 'lynx_smart_bms_1000';
    if (name.includes('lynx smart bms')) return 'lynx_smart_bms_500';
  }

  if (product.productType === 'monitor') {
    if (name.includes('bmv')) return 'bmv_round_display';
    if (name.includes('cerbo')) return 'cerbo_gx';
    if (name.includes('smartshunt') && name.includes('1000')) return 'smartshunt_large';
    if (name.includes('smartshunt')) return 'smartshunt_standard';
  }

  if (product.productType === 'accessory') {
    if (name.includes('ve.bus smart dongle')) return 'vebus_smart_dongle';
    if (name.includes('ve.direct') && name.includes('bluetooth')) return 'vedirect_bluetooth_dongle';
  }

  return undefined;
}

function kisaeFamilyImageUrl(product: Product): string | undefined {
  const partNumber = product.partNumber ?? '';
  const name = product.name.toLowerCase();

  if (/^DMT-?\d+/i.test(partNumber) || name.includes('dmt')) {
    return '/product-images/kisae-dmt1250-no-wires.svg';
  }

  return undefined;
}

function discoverFamilyImageUrl(product: Product): string | undefined {
  const partNumber = product.partNumber ?? '';
  const name = product.name.toLowerCase();

  if (/^DLP-GC2-/i.test(partNumber) || name.includes('dlp lifepo4')) {
    return discoverImage('discover_dlp_gc2_xxv');
  }

  if (/^AES-B-GC2-/i.test(partNumber) || name.includes('aes lifepo4')) {
    return discoverImage('discover_aes_b_gcxxxxx');
  }

  if (name.includes('helios')) {
    return discoverImage('discover_helios');
  }

  return undefined;
}

export function getProductDisplayImageUrl(product: Product): string | undefined {
  if (product.manufacturer === 'Victron') {
    const assetId = product.partNumber ? VICTRON_PART_IMAGE_MAP[product.partNumber] : undefined;
    if (assetId) return victronImage(assetId);

    const fallbackAssetId = victronFallbackAssetId(product);
    if (fallbackAssetId) return victronImage(fallbackAssetId);
  }
  if (product.manufacturer === 'KISAE') {
    const imageUrl = kisaeFamilyImageUrl(product);
    if (imageUrl) return imageUrl;
  }
  if (product.manufacturer === 'Discover Battery') {
    const imageUrl = discoverFamilyImageUrl(product);
    if (imageUrl) return imageUrl;
  }
  if (product.imageUrl) return product.imageUrl;
  return getProductImageUrl(product.productType);
}

export function resolveProductImageUrl(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined;
  if (/^(?:[a-z]+:)?\/\//i.test(imageUrl) || imageUrl.startsWith('data:')) return imageUrl;
  if (!imageUrl.startsWith('/')) return imageUrl;

  const baseUrl = import.meta.env.BASE_URL || '/';
  return `${baseUrl.replace(/\/?$/, '/')}${imageUrl.replace(/^\/+/, '')}`;
}
