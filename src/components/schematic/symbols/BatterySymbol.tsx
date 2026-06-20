import type { Product, SystemComponent } from '../../../types/system';

interface Props {
  product: Product;
  component: SystemComponent;
  selected: boolean;
}

export function BatterySymbol({ product, selected }: Props) {
  const w = product.width;
  const h = product.height;
  const hw = w / 2;
  const hh = h / 2;

  const capacityKwh = product.capacityWh
    ? (product.capacityWh / 1000).toFixed(1)
    : null;

  return (
    <g>
      <rect
        x={-hw} y={-hh} width={w} height={h} rx={4}
        fill="#ffffff" stroke={selected ? '#1769d2' : '#3975c5'} strokeWidth={selected ? 3 : 2}
      />
      {/* Battery cell lines */}
      {[-18, -6, 6, 18].map((dy) => (
        <rect key={dy} x={-hw + 12} y={dy - 4} width={w - 24} height={8} rx={1}
          fill="#eaf4ff" stroke="#3975c5" strokeWidth={0.8} />
      ))}
      {/* Positive terminal marker */}
      <text x={hw - 14} y={-hh + 12} textAnchor="middle" fill="#2f9461" fontSize={12} fontWeight="bold">+</text>
      {/* Negative terminal marker */}
      <text x={-hw + 14} y={-hh + 12} textAnchor="middle" fill="#b93232" fontSize={12} fontWeight="bold">-</text>
      {/* Labels */}
      <text x={0} y={hh - 22} textAnchor="middle" fill="#46546a" fontSize={9} fontWeight={800}>
        {product.nominalVoltage}V
      </text>
      {capacityKwh && (
        <text x={0} y={hh - 10} textAnchor="middle" fill="#46546a" fontSize={9} fontWeight={800}>
          {capacityKwh} kWh
        </text>
      )}
    </g>
  );
}
