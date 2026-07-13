import type { Product, SystemComponent } from '../../../types/system';
import { breakerPoleCount } from '../../../utils/breakerSemantics';

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
  const poleCount = isBreaker ? breakerPoleCount(product) : 1;
  const color = selected ? '#1769d2' : '#b93232';

  return (
    <g>
      <rect
        x={-hw} y={-hh} width={w} height={h} rx={3}
        fill="#ffffff" stroke={color} strokeWidth={selected ? 3 : 2}
      />
      {isBreaker ? (
        <g>
          {Array.from({ length: poleCount }, (_, index) => {
            const x = poleCount === 1 ? 0 : -hw + ((index + 1) * w) / (poleCount + 1);
            return (
              <g key={index}>
                <line x1={x} y1={-hh} x2={x} y2={-8} stroke={color} strokeWidth={2} />
                <path d={`M ${x} -8 L ${x + Math.min(10, w / 8)} 8`} fill="none" stroke={color} strokeWidth={1.8} />
                <line x1={x} y1={8} x2={x} y2={hh} stroke={color} strokeWidth={2} />
              </g>
            );
          })}
          {poleCount > 1 && product.breakerDefinition?.tripLinkage === 'common' && (
            <line x1={-hw + 8} y1={0} x2={hw - 8} y2={0} stroke={color} strokeWidth={1} strokeDasharray="3 2" />
          )}
        </g>
      ) : (
        <g>
          <line x1={-hw} y1={0} x2={-hw + 10} y2={0} stroke={color} strokeWidth={2} />
          <ellipse cx={0} cy={0} rx={hw - 10} ry={hh - 4} fill="none" stroke={color} strokeWidth={1.5} />
          <line x1={hw - 10} y1={0} x2={hw} y2={0} stroke={color} strokeWidth={2} />
        </g>
      )}
    </g>
  );
}
