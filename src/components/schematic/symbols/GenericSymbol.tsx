import type { Product } from '../../../types/system';

interface Props {
  product: Product;
  selected: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  monitor:       '#3975c5',
  dc_dc_charger: '#2f9461',
  shore_charger: '#2f9461',
  solar_combiner: '#c98518',
  dc_load:       '#617089',
  ac_load:       '#d8752b',
  accessory:     '#617089',
  busbar:        '#3975c5',
};

export function GenericSymbol({ product, selected }: Props) {
  const w = product.width;
  const h = product.height;
  const hw = w / 2;
  const hh = h / 2;
  const color = TYPE_COLORS[product.productType] ?? '#617089';
  const label = product.name.length > 14 ? product.name.slice(0, 13) + '...' : product.name;

  return (
    <g>
      <rect
        x={-hw} y={-hh} width={w} height={h} rx={4}
        fill="#ffffff" stroke={selected ? '#1769d2' : color} strokeWidth={selected ? 3 : 2}
      />
      <text x={0} y={0} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={9} fontWeight="bold">
        {label}
      </text>
      <text x={0} y={hh - 8} textAnchor="middle" fill="#6d7b90" fontSize={7} fontWeight={800}>
        {product.manufacturer}
      </text>
    </g>
  );
}
