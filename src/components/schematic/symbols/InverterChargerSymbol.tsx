import type { Product } from '../../../types/system';

interface Props {
  product: Product;
  selected: boolean;
}

export function InverterChargerSymbol({ product, selected }: Props) {
  const w = product.width;
  const h = product.height;
  const hw = w / 2;
  const hh = h / 2;

  return (
    <g>
      <rect
        x={-hw} y={-hh} width={w} height={h} rx={4}
        fill="#ffffff" stroke={selected ? '#1769d2' : '#7c61c7'} strokeWidth={selected ? 3 : 2}
      />
      <text x={0} y={-14} textAnchor="middle" fill="#7c61c7" fontSize={10} fontWeight="bold">INV / CHG</text>
      <text x={0} y={0} textAnchor="middle" fill="#46546a" fontSize={8} fontWeight={800}>
        {product.continuousPowerW ? `${(product.continuousPowerW / 1000).toFixed(1)}kW` : ''}
      </text>
      {/* DC label left */}
      <text x={-hw + 4} y={-14} fill="#2f9461" fontSize={7} fontWeight={800}>DC</text>
      {/* AC label right */}
      <text x={hw - 14} y={-14} fill="#d8752b" fontSize={7} fontWeight={800}>AC</text>
      {/* Sine wave symbol */}
      <path d="M -18 8 Q -10 0 0 8 Q 10 16 18 8" fill="none" stroke="#7c61c7" strokeWidth={1.6} opacity={0.85} />
    </g>
  );
}
