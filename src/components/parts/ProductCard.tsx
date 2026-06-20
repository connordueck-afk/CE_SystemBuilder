import type { Product } from '../../types/system';
import { PRODUCT_TYPE_LABELS } from '../../data/products';
import { fmt } from '../../utils/priceCalculations';

interface Props {
  product: Product;
  onAdd: (productId: string) => void;
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  battery:          '#3975c5',
  inverter_charger: '#7c61c7',
  mppt:             '#c98518',
  solar_array:      '#c98518',
  solar_combiner:   '#c98518',
  dc_distribution:  '#3975c5',
  fuse:             '#b93232',
  breaker:          '#b93232',
  monitor:          '#3975c5',
  dc_dc_charger:    '#2f9461',
  shore_charger:    '#2f9461',
  busbar:           '#3975c5',
  dc_load:          '#617089',
  ac_load:          '#d8752b',
  accessory:        '#617089',
};

function specLine(product: Product): string {
  const parts: string[] = [];
  if (product.nominalVoltage != null) {
    const v = Array.isArray(product.nominalVoltage)
      ? product.nominalVoltage.join('/')
      : product.nominalVoltage;
    parts.push(`${v}V`);
  }
  if (product.capacityWh) parts.push(`${(product.capacityWh / 1000).toFixed(1)} kWh`);
  if (product.continuousPowerW) parts.push(`${product.continuousPowerW}W`);
  if (product.maxCurrentA) parts.push(`${product.maxCurrentA}A`);
  if (product.maxPvVoltageV) parts.push(`PV ${product.maxPvVoltageV}V`);
  return parts.join(' · ');
}

export function ProductCard({ product, onAdd }: Props) {
  const badgeColor = TYPE_BADGE_COLORS[product.productType] ?? '#617089';
  const specs = specLine(product);

  return (
    <div className="product-card">
      <div className="product-card-header">
        <span
          className="product-type-badge"
          style={{ background: badgeColor + '33', color: badgeColor, borderColor: badgeColor + '66' }}
        >
          {PRODUCT_TYPE_LABELS[product.productType] ?? product.productType}
        </span>
        <span className="product-manufacturer">{product.manufacturer}</span>
      </div>
      <div className="product-name">{product.name}</div>
      {specs && <div className="product-specs">{specs}</div>}
      <div className="product-card-footer">
        <span className="product-price">
          {fmt(product.msrpUsd ?? null)}
          {product.oemPriceUsd != null && (
            <span className="product-oem-price"> / {fmt(product.oemPriceUsd)}</span>
          )}
        </span>
        <button
          className="btn-add"
          onClick={() => onAdd(product.id)}
          title="Add to system"
        >
          + Add
        </button>
      </div>
    </div>
  );
}
