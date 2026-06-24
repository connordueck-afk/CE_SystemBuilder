import type { Product } from '../../../types/system';

interface Props {
  product: Product;
  selected: boolean;
}

/** Protective earth symbol (IEC 60417-5019) */
function EarthSymbol({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  const s = size;
  return (
    <g>
      {/* Vertical stem */}
      <line x1={x} y1={y} x2={x} y2={y + s * 0.5} stroke={color} strokeWidth={2.5} />
      {/* Horizontal bars (three, decreasing width) */}
      <line x1={x - s * 0.5} y1={y + s * 0.5} x2={x + s * 0.5} y2={y + s * 0.5} stroke={color} strokeWidth={2.5} />
      <line x1={x - s * 0.35} y1={y + s * 0.7} x2={x + s * 0.35} y2={y + s * 0.7} stroke={color} strokeWidth={2.5} />
      <line x1={x - s * 0.2} y1={y + s * 0.9} x2={x + s * 0.2} y2={y + s * 0.9} stroke={color} strokeWidth={2.5} />
    </g>
  );
}

/** Chassis ground symbol (three downward spikes) */
function ChassisSymbol({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  const s = size;
  return (
    <g>
      {/* Vertical stem */}
      <line x1={x} y1={y} x2={x} y2={y + s * 0.4} stroke={color} strokeWidth={2.5} />
      {/* Horizontal base line */}
      <line x1={x - s * 0.5} y1={y + s * 0.4} x2={x + s * 0.5} y2={y + s * 0.4} stroke={color} strokeWidth={2.5} />
      {/* Three downward spikes */}
      <line x1={x - s * 0.35} y1={y + s * 0.4} x2={x - s * 0.35} y2={y + s * 0.9} stroke={color} strokeWidth={2} />
      <line x1={x} y1={y + s * 0.4} x2={x} y2={y + s * 0.9} stroke={color} strokeWidth={2} />
      <line x1={x + s * 0.35} y1={y + s * 0.4} x2={x + s * 0.35} y2={y + s * 0.9} stroke={color} strokeWidth={2} />
    </g>
  );
}

export function ConnectionPointSymbol({ product, selected }: Props) {
  const w = product.width;
  const h = product.height;
  const isEarth = product.id === 'system-ac-earth';
  const color = selected ? '#1769d2' : (isEarth ? '#2f9461' : '#46546a');
  const symbolSize = 18;
  const symbolY = -h / 2 + 4;

  return (
    <g>
      {selected && (
        <rect
          x={-w / 2 - 3} y={-h / 2 - 3} width={w + 6} height={h + 6}
          rx={6} fill="none" stroke="#1769d2" strokeWidth={2} strokeDasharray="4 2" opacity={0.7}
        />
      )}
      {isEarth
        ? <EarthSymbol x={0} y={symbolY} size={symbolSize} color={color} />
        : <ChassisSymbol x={0} y={symbolY} size={symbolSize} color={color} />
      }
      <text
        x={0} y={h / 2 - 8}
        textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={8} fontWeight={700}
      >
        {product.name}
      </text>
    </g>
  );
}
