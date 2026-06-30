import type { CSSProperties } from 'react';
import type { SystemDesign, Product, SystemComponent } from '../types/system';
import type { BusColorMap } from '../utils/busColors';
import type { BusType } from '../utils/electricalNetlist';
import type { ProtectionRecommendation } from '../utils/protectionRecommendations';
import { ComponentNode } from '../components/schematic/ComponentNode';
import { ConnectionLayer } from '../components/schematic/ConnectionLayer';
import { TerminalLayer } from '../components/schematic/TerminalLayer';
import { TextAnnotationNode } from '../components/schematic/TextAnnotationNode';
import { ShapeAnnotationNode } from '../components/schematic/ShapeAnnotationNode';
import { getEffectiveProductForComponent } from '../utils/solarCalculations';
import { componentScale, scaledProductSize } from '../utils/componentScale';
import { isVerticalOrientation } from '../utils/componentOrientation';
import { getEffectiveTerminals } from '../utils/effectiveTerminals';
import { isTerminalFull } from '../utils/connectorLimits';

export type SchematicFilter = 'all' | 'dc' | 'ac' | 'communication';

const FILTER_BUS_TYPES: Record<SchematicFilter, BusType[] | null> = {
  all: null,
  dc: ['dc_pos', 'dc_neg', 'chassis_ground'],
  ac: ['ac_line', 'ac_line2', 'ac_neutral', 'ac_ground'],
  communication: ['communication'],
};

const PAD = 80;
const GRID = 20;
const NO_RECS: ProtectionRecommendation[] = [];
const NOOP = () => {};
const PRINT_CANVAS_STYLE = {
  display: 'block',
  background: '#ffffff',
  '--canvas': '#ffffff',
  '--canvas-grid': '#eeeeee',
  '--schematic-label-halo': 'rgb(255 255 255 / 88%)',
} as CSSProperties;

function componentFootprint(product: Product, rotationDeg = 0, scale = 1): { halfWidth: number; halfHeight: number } {
  const { width, height } = scaledProductSize(product, scale);
  const rotated = isVerticalOrientation(rotationDeg);
  const symbolWidth = rotated ? height : width;
  const symbolHeight = rotated ? width : height;

  return {
    halfWidth: symbolWidth / 2,
    halfHeight: Math.max(symbolHeight / 2, height / 2 + 22),
  };
}

function computeBounds(components: SystemComponent[], products: Map<string, Product>) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const comp of components) {
    const product = getEffectiveProductForComponent(comp, products.get(comp.productId));
    if (!product) continue;
    const footprint = componentFootprint(product, comp.rotationDeg, componentScale(comp));
    minX = Math.min(minX, comp.x - footprint.halfWidth);
    maxX = Math.max(maxX, comp.x + footprint.halfWidth);
    minY = Math.min(minY, comp.y - footprint.halfHeight);
    maxY = Math.max(maxY, comp.y + footprint.halfHeight);
  }
  if (!isFinite(minX)) return { x: 0, y: 0, w: 800, h: 500 };
  return { x: minX - PAD, y: minY - PAD, w: maxX - minX + PAD * 2, h: maxY - minY + PAD * 2 };
}

function computeDiagramBounds(system: SystemDesign, products: Map<string, Product>) {
  const componentBounds = computeBounds(system.components, products);
  let minX = componentBounds.x;
  let minY = componentBounds.y;
  let maxX = componentBounds.x + componentBounds.w;
  let maxY = componentBounds.y + componentBounds.h;

  for (const conn of system.connections) {
    for (const point of conn.routePoints ?? []) {
      minX = Math.min(minX, point.x - PAD);
      minY = Math.min(minY, point.y - PAD);
      maxX = Math.max(maxX, point.x + PAD);
      maxY = Math.max(maxY, point.y + PAD);
    }
  }

  for (const annotation of system.annotations ?? []) {
    minX = Math.min(minX, annotation.x - PAD);
    minY = Math.min(minY, annotation.y - PAD);
    maxX = Math.max(maxX, annotation.x + annotation.width + PAD);
    maxY = Math.max(maxY, annotation.y + annotation.height + PAD);
  }

  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function fullTerminalSet(system: SystemDesign, products: Map<string, Product>): Set<string> {
  const full = new Set<string>();
  for (const comp of system.components) {
    const product = getEffectiveProductForComponent(comp, products.get(comp.productId));
    if (!product) continue;
    const terminals = getEffectiveTerminals(product, comp);
    for (const term of terminals) {
      const commPort = product.communicationPorts?.find((p) => p.id === term.id);
      if (isTerminalFull(term, commPort, system.connections, comp.id)) {
        full.add(`${comp.id}:${term.id}`);
      }
    }
  }
  return full;
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
  const gridId = `print-grid-${filter}`;

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
  const bounds = computeDiagramBounds(system, products);
  const fullTerminals = fullTerminalSet(system, products);

  return (
    <svg
      viewBox={`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={PRINT_CANVAS_STYLE}
    >
      <defs>
        <pattern id={gridId} width={GRID} height={GRID} patternUnits="userSpaceOnUse">
          <circle cx={GRID / 2} cy={GRID / 2} r={0.75} fill="var(--canvas-grid)" />
        </pattern>
      </defs>
      <rect data-canvas-bg="true" x={bounds.x} y={bounds.y} width={bounds.w} height={bounds.h} fill="var(--canvas)" />
      <rect data-canvas-bg="true" x={bounds.x} y={bounds.y} width={bounds.w} height={bounds.h} fill={`url(#${gridId})`} />

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
        onPreviewConnectionRoute={NOOP}
        onCommitConnectionRoute={NOOP}
        onCancelConnectionRoutePreview={NOOP}
        pendingLine={null}
        layer="visual"
      />

      {(system.annotations ?? []).map((annotation) => {
        const commonProps = {
          key: annotation.id,
          selected: false,
          onSelect: NOOP,
          onMove: NOOP,
          onResize: NOOP,
        };

        return annotation.kind === 'shape'
          ? <ShapeAnnotationNode {...commonProps} annotation={annotation} />
          : <TextAnnotationNode {...commonProps} annotation={annotation} />;
      })}

      <TerminalLayer
        components={activeComponentIds === null ? system.components : activeComponents}
        products={products}
        pendingSourceKey={null}
        validTargetTerminals={null}
        fullTerminals={fullTerminals}
        busColors={busColors}
        onTerminalMouseDown={NOOP}
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
