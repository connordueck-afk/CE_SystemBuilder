import type { SystemDesign, Product, SystemComponent } from '../types/system';
import type { BusColorMap } from '../utils/busColors';
import type { BusType } from '../utils/electricalNetlist';
import type { ProtectionRecommendation } from '../utils/protectionRecommendations';
import { ComponentNode } from '../components/schematic/ComponentNode';
import { ConnectionLayer } from '../components/schematic/ConnectionLayer';
import { getEffectiveProductForComponent } from '../utils/solarCalculations';
import { componentScale, scaledProductSize } from '../utils/componentScale';

export type SchematicFilter = 'all' | 'dc' | 'ac' | 'communication';

const FILTER_BUS_TYPES: Record<SchematicFilter, BusType[] | null> = {
  all: null,
  dc: ['dc_pos', 'dc_neg', 'chassis_ground'],
  ac: ['ac_line', 'ac_line2', 'ac_neutral', 'ac_ground'],
  communication: ['communication'],
};

const PAD = 80;
const NO_RECS: ProtectionRecommendation[] = [];
const NOOP = () => {};

function computeBounds(components: SystemComponent[], products: Map<string, Product>) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const comp of components) {
    const product = products.get(comp.productId);
    if (!product) continue;
    const scale = componentScale(comp);
    const { width: w, height: h } = scaledProductSize(product, scale);
    minX = Math.min(minX, comp.x - w / 2);
    maxX = Math.max(maxX, comp.x + w / 2);
    minY = Math.min(minY, comp.y - h / 2);
    maxY = Math.max(maxY, comp.y + h / 2);
  }
  if (!isFinite(minX)) return { x: 0, y: 0, w: 800, h: 500 };
  return { x: minX - PAD, y: minY - PAD, w: maxX - minX + PAD * 2, h: maxY - minY + PAD * 2 };
}

function connectionMidpoint(conn: SystemConnection, components: SystemComponent[]) {
  if (conn.routePoints && conn.routePoints.length > 0) {
    return conn.routePoints[Math.floor(conn.routePoints.length / 2)];
  }
  const from = components.find((c) => c.id === conn.fromComponentId);
  const to = components.find((c) => c.id === conn.toComponentId);
  if (!from || !to) return null;
  return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
}

type SystemConnection = SystemDesign['connections'][0];

interface Props {
  system: SystemDesign;
  products: Map<string, Product>;
  busColors: BusColorMap;
  filter: SchematicFilter;
}

export function StaticSchematic({ system, products, busColors, filter }: Props) {
  const allowedBusTypes = FILTER_BUS_TYPES[filter];

  const visibleConnections = allowedBusTypes === null
    ? system.connections
    : system.connections.filter((c) => {
        if (c.wireKind === 'communication') return allowedBusTypes.includes('communication');
        return c.busType != null && (allowedBusTypes as string[]).includes(c.busType);
      });

  const activeComponentIds: Set<string> | null = allowedBusTypes === null
    ? null
    : new Set(visibleConnections.flatMap((c) => [c.fromComponentId, c.toComponentId]));

  const activeComponents = activeComponentIds === null
    ? system.components
    : system.components.filter((c) => activeComponentIds.has(c.id));

  // Always use all components for bounds so filtered pages have a consistent
  // viewBox — active connections/components are highlighted, inactive ghosted.
  const bounds = computeBounds(system.components, products);

  return (
    <svg
      viewBox={`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', background: 'white' }}
    >
      {/* All components: inactive ones ghosted for context */}
      {system.components.map((comp) => {
        const product = getEffectiveProductForComponent(comp, products.get(comp.productId));
        if (!product) return null;
        const isActive = activeComponentIds === null || activeComponentIds.has(comp.id);
        return (
          <g key={comp.id} opacity={isActive ? 1 : 0.12}>
            <ComponentNode
              component={comp}
              product={product}
              selected={false}
              preferVectorSymbol
              onSelect={NOOP}
              onDragStart={NOOP}
              onContextMenu={NOOP}
              onScaleHandleMouseDown={NOOP}
            />
          </g>
        );
      })}

      {/* Active connections */}
      <ConnectionLayer
        connections={visibleConnections}
        components={system.components}
        products={products}
        selectedConnectionId={null}
        protectionRecommendations={NO_RECS}
        busColors={busColors}
        onSelectConnection={NOOP}
        onShowProtectionPrompt={NOOP}
        onClearProtectionPrompt={NOOP}
        onMoveConnectionRoute={NOOP}
        pendingLine={null}
        layer="visual"
      />

      {/* AWG labels */}
      {visibleConnections.map((conn) => {
        const label = conn.manualCableAwg ?? conn.recommendedCableAwg;
        if (!label) return null;
        const mid = connectionMidpoint(conn, system.components);
        if (!mid) return null;
        return (
          <text
            key={`awg-${conn.id}`}
            x={mid.x}
            y={mid.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontFamily="sans-serif"
            fill="#fff"
            stroke="#444"
            strokeWidth={2.5}
            paintOrder="stroke"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
