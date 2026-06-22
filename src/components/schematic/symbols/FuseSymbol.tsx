import type { Product, SystemComponent } from '../../../types/system';

interface Props {
  product: Product;
  component: SystemComponent;
  selected: boolean;
}

export function FuseSymbol({ product, component, selected }: Props) {
  const w = product.width;
  const h = product.height;
  const hw = w / 2;
  const hh = h / 2;
  const isBreaker = product.productType === 'breaker';
  const color = selected ? '#1769d2' : '#b93232';

  return (
    <g>
      <rect
        x={-hw} y={-hh} width={w} height={h} rx={3}
        fill="#ffffff" stroke={color} strokeWidth={selected ? 3 : 2}
      />
      {/* Fuse wire / breaker symbol */}
      <line x1={-hw} y1={0} x2={-hw + 10} y2={0} stroke={color} strokeWidth={2} />
      {isBreaker ? (
        <path d={`M ${-hw + 10} 0 L ${-hw + 20} -8 L ${hw - 10} 8`}
          fill="none" stroke={color} strokeWidth={1.5} />
      ) : (
        <ellipse cx={0} cy={0} rx={hw - 10} ry={hh - 4}
          fill="none" stroke={color} strokeWidth={1.5} />
      )}
      <line x1={hw - 10} y1={0} x2={hw} y2={0} stroke={color} strokeWidth={2} />
    </g>
  );
}
