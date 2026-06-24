import type { Product, SystemComponent } from '../../types/system';
import { BatterySymbol } from './symbols/BatterySymbol';
import { MpptSymbol } from './symbols/MpptSymbol';
import { SolarArraySymbol } from './symbols/SolarArraySymbol';
import { InverterChargerSymbol } from './symbols/InverterChargerSymbol';
import { LynxDistributionSymbol } from './symbols/LynxDistributionSymbol';
import { FuseSymbol } from './symbols/FuseSymbol';
import { GenericSymbol } from './symbols/GenericSymbol';
import { ConnectionPointSymbol } from './symbols/ConnectionPointSymbol';
import { Terminal } from './Terminal';
import { getEffectiveTerminals } from '../../utils/effectiveTerminals';
import { getProductDisplayImageUrl, resolveProductImageUrl } from '../../utils/productImages';
import type { BusColorMap } from '../../utils/busColors';
import { orientationTransform } from '../../utils/componentOrientation';
import { getDcBusNominalVoltage, isDcBusProduct } from '../../utils/dcBusVoltage';
import { componentScale, scaledProductSize, scaledTerminalOffset } from '../../utils/componentScale';

interface Props {
  component: SystemComponent;
  product: Product;
  selected: boolean;
  /** Key of the terminal that initiated the pending connection ("compId:termId"), or null. */
  pendingSourceKey: string | null;
  /** Set of "compId:termId" keys that are valid targets for the pending connection, or null when not connecting. */
  validTargetTerminals: Set<string> | null;
  busColors: BusColorMap;
  onSelect: (id: string) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onContextMenu: (id: string, e: React.MouseEvent) => void;
  onTerminalMouseDown: (compId: string, termId: string, e: React.MouseEvent) => void;
  onScaleHandleMouseDown: (id: string, e: React.MouseEvent) => void;
}

function Symbol({
  product,
  component,
  selected,
}: {
  product: Product;
  component: SystemComponent;
  selected: boolean;
}) {
  const scale = componentScale(component);
  const { width: w, height: h } = scaledProductSize(product, scale);
  const scaledProduct = { ...product, width: w, height: h };
  // Fused distribution modules are drawn as schematic symbols (not the product
  // photo) so every tap/passthrough terminal lands exactly on the drawn shape.
  const useSchematicSymbol = product.distributionTopology != null;
  const imageUrl = useSchematicSymbol
    ? undefined
    : resolveProductImageUrl(getProductDisplayImageUrl(product));

  if (imageUrl) {
    return (
      <>
        <image
          href={imageUrl}
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
        />
        {selected && (
          <rect
            x={-w / 2 - 2}
            y={-h / 2 - 2}
            width={w + 4}
            height={h + 4}
            rx={7}
            fill="none"
            stroke="#1769d2"
            strokeWidth={2.5}
            opacity={0.85}
          />
        )}
      </>
    );
  }

  switch (product.productType) {
    case 'battery':
      return <BatterySymbol product={scaledProduct} component={component} selected={selected} />;
    case 'mppt':
      return <MpptSymbol product={scaledProduct} selected={selected} />;
    case 'solar_array':
      return <SolarArraySymbol product={scaledProduct} component={component} selected={selected} />;
    case 'inverter_charger':
      return <InverterChargerSymbol product={scaledProduct} selected={selected} />;
    case 'dc_distribution':
    case 'busbar':
      return <LynxDistributionSymbol product={product} scale={scale} selected={selected} />;
    case 'fuse':
    case 'breaker':
      return <FuseSymbol product={scaledProduct} component={component} selected={selected} />;
    case 'connection_point':
      return <ConnectionPointSymbol product={scaledProduct} selected={selected} />;
    default:
      return <GenericSymbol product={scaledProduct} selected={selected} />;
  }
}

function protectionRatingLabel(product: Product): string {
  const ratingA = product.protectionRatings?.currentRatingA ?? product.maxCurrentA;
  return ratingA != null ? `${ratingA}A` : '';
}

export function ComponentNode({
  component,
  product,
  selected,
  pendingSourceKey,
  validTargetTerminals,
  busColors,
  onSelect,
  onDragStart,
  onContextMenu,
  onTerminalMouseDown,
  onScaleHandleMouseDown,
}: Props) {
  const label = component.label ?? product.name;
  const displayLabel = label.length > 22 ? label.slice(0, 21) + '...' : label;
  const rotation = component.rotationDeg ?? 0;
  const scale = componentScale(component);
  const { width: scaledWidth, height: scaledHeight } = scaledProductSize(product, scale);
  const terminals = getEffectiveTerminals(product, component);
  const ratingLabel = product.productType === 'fuse' || product.productType === 'breaker'
    ? protectionRatingLabel(product)
    : '';
  const dcBusVoltage = isDcBusProduct(product)
    ? getDcBusNominalVoltage(component, product)
    : undefined;

  return (
    <g
      transform={`translate(${component.x}, ${component.y})`}
      style={{ cursor: component.locked ? 'default' : 'grab' }}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        onDragStart(component.id, e);
      }}
      onContextMenu={(e) => onContextMenu(component.id, e)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
    >
      <g transform={orientationTransform(rotation)}>
        <Symbol product={product} component={component} selected={selected} />

        {/* Auto-generated badge */}
        {component.autoGenerated && (
          <g transform={`translate(${-scaledWidth / 2 + 8}, ${-scaledHeight / 2 + 8})`}>
            <circle r={5} fill="#fff7e7" stroke="#c98518" strokeWidth={1} />
            <text textAnchor="middle" dominantBaseline="middle" fill="#935f0d" fontSize={7} fontWeight={600}>A</text>
          </g>
        )}

        {component.locked && (
          <g transform={`translate(${scaledWidth / 2 - 11}, ${-scaledHeight / 2 + 11})`}>
            <circle r={8} fill="#ffffff" stroke="#617089" strokeWidth={1.4} />
            <path
              d="M -4 -1 L -4 5 L 4 5 L 4 -1 Z M -2 -1 L -2 -3 C -2 -5 2 -5 2 -3 L 2 -1"
              fill="none"
              stroke="#33435a"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* Terminals */}
        {terminals.map((t) => {
          const offset = scaledTerminalOffset(component, t);
          const key = `${component.id}:${t.id}`;
          const isSource = pendingSourceKey === key;
          const isHighlighted = !isSource && (validTargetTerminals?.has(key) ?? false);
          const isDisabled = validTargetTerminals !== null && !isSource && !isHighlighted;
          return (
            <Terminal
              key={t.id}
              terminal={{ ...t, ...offset }}
              componentId={component.id}
              isHighlighted={isHighlighted}
              isPending={false}
              isSource={isSource}
              isDisabled={isDisabled}
              busColors={busColors}
              onMouseDown={onTerminalMouseDown}
            />
          );
        })}

        {/* Scale handle — bottom-right corner of bounding box */}
        {selected && (
          <g
            transform={`translate(${scaledWidth / 2 + 2}, ${scaledHeight / 2 + 2})`}
            style={{ cursor: 'nwse-resize' }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onScaleHandleMouseDown(component.id, e);
            }}
          >
            <circle r={7} fill="#1769d2" stroke="#ffffff" strokeWidth={2} opacity={0.9} />
            <path
              d="M -2.5 2.5 L 2.5 2.5 L 2.5 -2.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
      </g>

      {ratingLabel && (
        <text
          x={0}
          y={-scaledHeight / 2 - 8}
          textAnchor="middle"
          fill={selected ? '#1769d2' : product.productType === 'fuse' ? '#b93232' : 'var(--schematic-label)'}
          stroke="var(--schematic-label-halo)"
          strokeWidth={3}
          paintOrder="stroke fill"
          fontSize={9}
          fontWeight={700}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {ratingLabel}
        </text>
      )}

      {/* Component label below */}
      <text
        x={0}
        y={scaledHeight / 2 + 14}
        textAnchor="middle"
        fill={selected ? '#1769d2' : 'var(--schematic-label)'}
        stroke="var(--schematic-label-halo)"
        strokeWidth={3}
        paintOrder="stroke fill"
        fontSize={10}
        fontWeight={selected ? 700 : 600}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {displayLabel}
      </text>
      {dcBusVoltage != null && (
        <text
          x={0}
          y={scaledHeight / 2 + 28}
          textAnchor="middle"
          fill={selected ? '#1769d2' : 'var(--schematic-label-muted)'}
          stroke="var(--schematic-label-halo)"
          strokeWidth={3}
          paintOrder="stroke fill"
          fontSize={10}
          fontWeight={700}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {dcBusVoltage} VDC
        </text>
      )}
    </g>
  );
}

