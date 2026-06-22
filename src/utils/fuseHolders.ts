import type { Product } from '../types/system';

export interface FuseHolderDefinition {
  id: string;
  fuseStyle: string;
  name: string;
  description: string;
  manufacturer: string;
  unitMsrpUsd: number | null;
  unitOemUsd: number | null;
  priceSource: string;
}

const HOLDER_BY_STYLE: Record<string, FuseHolderDefinition> = {
  MIDI: {
    id: 'holder-midi',
    fuseStyle: 'MIDI',
    name: 'MIDI Fuse Holder',
    description: 'Holder/base for MIDI fuse installation.',
    manufacturer: 'Generic',
    unitMsrpUsd: null,
    unitOemUsd: null,
    priceSource: 'Holder pricing unavailable',
  },
  MEGA: {
    id: 'holder-mega',
    fuseStyle: 'MEGA',
    name: 'MEGA Fuse Holder',
    description: 'Holder/base for MEGA fuse installation.',
    manufacturer: 'Generic',
    unitMsrpUsd: null,
    unitOemUsd: null,
    priceSource: 'Holder pricing unavailable',
  },
  ANL: {
    id: 'holder-anl',
    fuseStyle: 'ANL',
    name: 'ANL Fuse Holder',
    description: 'Holder/base for ANL fuse installation.',
    manufacturer: 'Generic',
    unitMsrpUsd: null,
    unitOemUsd: null,
    priceSource: 'Holder pricing unavailable',
  },
  'Class T': {
    id: 'holder-class-t',
    fuseStyle: 'Class T',
    name: 'Class-T Fuse Holder',
    description: 'Holder/base for Class-T fuse installation.',
    manufacturer: 'Generic',
    unitMsrpUsd: null,
    unitOemUsd: null,
    priceSource: 'Holder pricing unavailable',
  },
};

export function getFuseStyleForHolder(product: Product): string | undefined {
  if (product.productType !== 'fuse') return undefined;
  return product.protectionRatings?.fuseStyle ?? product.category;
}

export function getFuseHolderForProduct(product: Product): FuseHolderDefinition | null {
  const style = getFuseStyleForHolder(product);
  if (!style) return null;
  return HOLDER_BY_STYLE[style] ?? null;
}

export function isFuseHolderApplicable(product: Product): boolean {
  return getFuseHolderForProduct(product) != null;
}
