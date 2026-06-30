import type { Product, SystemComponent } from '../../../types/system';
import { calculateSolarStringStats } from '../../../utils/solarCalculations';

interface Props {
  product: Product;
  component: SystemComponent;
  selected: boolean;
}

export function SolarArraySymbol({ product, component, selected }: Props) {
  const w = product.width;
  const h = product.height;
  const hw = w / 2;
  const hh = h / 2;
  const totalW = product.continuousPowerW ?? component.customSolarArrayRatings?.powerW ?? 0;
  const stats = calculateSolarStringStats(component, product);
  const ratingLabel = stats?.powerW ?? totalW;

  return (
    <g>
      <rect
        x={-hw} y={-hh} width={w} height={h} rx={4}
        fill="#ffffff" stroke={selected ? '#1769d2' : '#c98518'} strokeWidth={selected ? 3 : 2}
      />
      {/* Panel grid */}
      <line x1={-hw} y1={-hh + h / 3} x2={hw} y2={-hh + h / 3} stroke="#c98518" strokeWidth={0.8} opacity={0.55} />
      <line x1={-hw} y1={-hh + (2 * h) / 3} x2={hw} y2={-hh + (2 * h) / 3} stroke="#c98518" strokeWidth={0.8} opacity={0.55} />
      <line x1={-hw + w / 3} y1={-hh} x2={-hw + w / 3} y2={hh} stroke="#c98518" strokeWidth={0.8} opacity={0.55} />
      <line x1={-hw + (2 * w) / 3} y1={-hh} x2={-hw + (2 * w) / 3} y2={hh} stroke="#c98518" strokeWidth={0.8} opacity={0.55} />
      {/* Sun rays */}
      <circle cx={hw - 14} cy={-hh + 12} r={6} fill="#fff7e7" stroke="#c98518" strokeWidth={1} />
      <line x1={hw - 14} y1={-hh + 3} x2={hw - 14} y2={-hh + 1} stroke="#c98518" strokeWidth={1} />
      <line x1={hw - 6} y1={-hh + 10} x2={hw - 4} y2={-hh + 9} stroke="#c98518" strokeWidth={1} />
      {/* Label */}
      <text x={0} y={hh - 10} textAnchor="middle" fill="#935f0d" fontSize={9} fontWeight={700}>
        {ratingLabel ? `${Math.round(ratingLabel)}W` : product.productType === 'custom_solar_array' ? 'Custom' : ''}
      </text>
      {product.productType === 'custom_solar_array' && (
        <text x={0} y={hh - 22} textAnchor="middle" fill="#935f0d" fontSize={7} fontWeight={600}>
          Array
        </text>
      )}
    </g>
  );
}

