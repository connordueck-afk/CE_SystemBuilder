import type { Product } from '../../../types/system';

interface Props {
  product: Product;
  selected: boolean;
}

export function LynxDistributionSymbol({ product, selected }: Props) {
  const w = product.width;
  const h = product.height;
  const hw = w / 2;
  const hh = h / 2;

  return (
    <g>
      <rect
        x={-hw} y={-hh} width={w} height={h} rx={4}
        fill="#ffffff" stroke={selected ? '#1769d2' : '#3975c5'} strokeWidth={selected ? 3 : 2}
      />
      <text x={0} y={-18} textAnchor="middle" fill="#3975c5" fontSize={10} fontWeight="bold">DC BUS</text>
      {/* Busbar representation */}
      <rect x={-hw + 10} y={-4} width={w - 20} height={8} rx={2} fill="#eaf4ff" stroke="#3975c5" strokeWidth={0.8} />
      {/* Out stubs */}
      {[-30, 0].map((dy, i) => (
        <g key={i}>
          <rect x={hw - 25} y={dy - 4} width={20} height={8} rx={1}
            fill="#eaf4ff" stroke="#3975c5" strokeWidth={0.8} />
        </g>
      ))}
      <text x={0} y={hh - 6} textAnchor="middle" fill="#46546a" fontSize={8} fontWeight={800}>
        {product.name.includes('Lynx') ? 'Victron Lynx' : 'DC Distribution'}
      </text>
    </g>
  );
}
