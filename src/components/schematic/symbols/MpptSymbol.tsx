import type { Product } from '../../../types/system';

interface Props {
  product: Product;
  selected: boolean;
}

export function MpptSymbol({ product, selected }: Props) {
  const w = product.width;
  const h = product.height;
  const hw = w / 2;
  const hh = h / 2;

  return (
    <g>
      <rect
        x={-hw} y={-hh} width={w} height={h} rx={4}
        fill="#ffffff" stroke={selected ? '#1769d2' : '#c98518'} strokeWidth={selected ? 3 : 2}
      />
      <text x={0} y={-8} textAnchor="middle" fill="#c98518" fontSize={11} fontWeight={700}>MPPT</text>
      <text x={0} y={6} textAnchor="middle" fill="#46546a" fontSize={8} fontWeight={600}>
        {product.maxPvVoltageV}V / {product.maxCurrentA}A
      </text>
      {/* PV arrow left */}
      <text x={-hw + 6} y={-12} fill="#c98518" fontSize={8} fontWeight={600}>PV</text>
      {/* BAT arrow right */}
      <text x={hw - 18} y={-12} fill="#2f9461" fontSize={8} fontWeight={600}>BAT</text>
      {/* Arrow symbol */}
      <path d="M -20 0 L 0 -8 L 20 0 L 0 8 Z" fill="#fff7e7" stroke="#c98518" strokeWidth={0.5} />
    </g>
  );
}

