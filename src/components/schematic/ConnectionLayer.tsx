import { useState } from 'react';
import type { SystemConnection, SystemComponent, Product } from '../../types/system';
import { getEffectiveTerminal } from '../../utils/effectiveTerminals';
import type { ProtectionRecommendation } from '../../utils/protectionRecommendations';
import { busTypeFromTerminal } from '../../utils/electricalNetlist';
import type { BusColorMap } from '../../utils/busColors';
import {
  connectionPoints,
  getConnectionTerminalPos,
  orthogonalizePoints,
  pathMidpointWithAngle,
  simplifyPoints,
  type PathMarker,
  type Point,
} from '../../utils/connectionGeometry';

interface SegmentDrag {
  connectionId: string;
  segmentIndex: number;
  orientation: 'horizontal' | 'vertical';
  startMouse: Point;
  startPoints: Point[];
  pointerId: number;
}

const ROUTE_GRID = 10;
const CORNER_RADIUS = 10;

function snapRouteValue(value: number): number {
  return Math.round(value / ROUTE_GRID) * ROUTE_GRID;
}

function pendingOrthogonalPath(line: Props['pendingLine']): string {
  if (!line) return '';
  const midX = (line.x1 + line.x2) / 2;
  return pointsToRoundedPath([
    { x: line.x1, y: line.y1 },
    { x: midX, y: line.y1 },
    { x: midX, y: line.y2 },
    { x: line.x2, y: line.y2 },
  ]);
}

function pointsToPath(points: Point[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function pointToward(from: Point, to: Point, amount: number): Point {
  const length = distance(from, to);
  if (length === 0) return from;
  const ratio = Math.min(1, amount / length);
  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

function pointsToRoundedPath(points: Point[], radius = CORNER_RADIUS): string {
  if (points.length <= 2) return pointsToPath(points);

  const commands: string[] = [`M ${points[0].x} ${points[0].y}`];

  for (let index = 1; index < points.length - 1; index += 1) {
    const prev = points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    const prevLength = distance(prev, current);
    const nextLength = distance(current, next);
    const cornerRadius = Math.min(radius, prevLength / 2, nextLength / 2);

    if (cornerRadius <= 0 || prev.x !== current.x && prev.y !== current.y || current.x !== next.x && current.y !== next.y) {
      commands.push(`L ${current.x} ${current.y}`);
      continue;
    }

    const before = pointToward(current, prev, cornerRadius);
    const after = pointToward(current, next, cornerRadius);
    commands.push(`L ${before.x} ${before.y}`);
    commands.push(`Q ${current.x} ${current.y} ${after.x} ${after.y}`);
  }

  const last = points[points.length - 1];
  commands.push(`L ${last.x} ${last.y}`);
  return commands.join(' ');
}

function prepareSegmentDrag(points: Point[], segmentIndex: number, orientation: 'horizontal' | 'vertical'): Pick<SegmentDrag, 'segmentIndex' | 'startPoints'> {
  if (segmentIndex === 0) {
    const endpoint = points[0];
    const next = points[1];
    const inserted = orientation === 'horizontal'
      ? [
          endpoint,
          { x: endpoint.x, y: endpoint.y },
          { x: next.x, y: endpoint.y },
          ...points.slice(1),
        ]
      : [
          endpoint,
          { x: endpoint.x, y: endpoint.y },
          { x: endpoint.x, y: next.y },
          ...points.slice(1),
        ];

    return { segmentIndex: 1, startPoints: inserted };
  }

  if (segmentIndex === points.length - 2) {
    const prev = points[points.length - 2];
    const endpoint = points[points.length - 1];
    const inserted = orientation === 'horizontal'
      ? [
          ...points.slice(0, -1),
          { x: prev.x, y: endpoint.y },
          { x: endpoint.x, y: endpoint.y },
          endpoint,
        ]
      : [
          ...points.slice(0, -1),
          { x: endpoint.x, y: prev.y },
          { x: endpoint.x, y: endpoint.y },
          endpoint,
        ];

    return { segmentIndex: points.length - 1, startPoints: inserted };
  }

  return { segmentIndex, startPoints: points };
}

function svgCoords(e: React.PointerEvent<SVGPathElement>): Point {
  const svg = e.currentTarget.ownerSVGElement;
  if (!svg) return { x: 0, y: 0 };
  const point = svg.createSVGPoint();
  point.x = e.clientX;
  point.y = e.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const transformed = point.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}

function connectionColor(conn: SystemConnection, fromComp: SystemComponent, fromProd: Product, busColors: BusColorMap): string {
  const terminal = getEffectiveTerminal(fromProd, conn.fromTerminalId, fromComp);
  return terminal ? busColors[busTypeFromTerminal(terminal)] : busColors.unknown;
}

function connectionStrokeWidth(conn: SystemConnection): number {
  switch (conn.recommendedCableAwg) {
    case '4/0':
      return 6;
    case '2/0':
      return 5.25;
    case '1/0':
      return 4.75;
    case '1':
    case '2':
      return 4.25;
    case '4':
      return 3.75;
    case '6':
      return 3.25;
    case '8':
    case '10':
      return 2.75;
    case '12':
    case '14':
      return 2.25;
    case '16':
    case '18':
      return 1.75;
    default:
      return 2;
  }
}

interface Props {
  connections: SystemConnection[];
  components: SystemComponent[];
  products: Map<string, Product>;
  selectedConnectionId: string | null;
  protectionRecommendations: ProtectionRecommendation[];
  busColors: BusColorMap;
  onSelectConnection: (id: string) => void;
  onShowProtectionPrompt: (connectionId: string, recommendation: ProtectionRecommendation, marker: PathMarker) => void;
  onClearProtectionPrompt: () => void;
  onMoveConnectionRoute: (id: string, routePoints: Point[]) => void;
  pendingLine: { x1: number; y1: number; x2: number; y2: number } | null;
}

export function ConnectionLayer({
  connections,
  components,
  products,
  selectedConnectionId,
  protectionRecommendations,
  busColors,
  onSelectConnection,
  onShowProtectionPrompt,
  onClearProtectionPrompt,
  onMoveConnectionRoute,
  pendingLine,
}: Props) {
  const [segmentDrag, setSegmentDrag] = useState<SegmentDrag | null>(null);
  const compMap = new Map(components.map((c) => [c.id, c]));
  const recommendationByConnection = new Map(
    protectionRecommendations.map((recommendation) => [recommendation.connectionId, recommendation])
  );

  const handleSegmentPointerMove = (e: React.PointerEvent<SVGPathElement>) => {
    if (!segmentDrag || e.pointerId !== segmentDrag.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    const pos = svgCoords(e);
    const dx = pos.x - segmentDrag.startMouse.x;
    const dy = pos.y - segmentDrag.startMouse.y;
    const nextPoints = segmentDrag.startPoints.map((point) => ({ ...point }));
    const a = nextPoints[segmentDrag.segmentIndex];
    const b = nextPoints[segmentDrag.segmentIndex + 1];
    if (!a || !b) return;

    if (segmentDrag.orientation === 'horizontal') {
      const nextY = snapRouteValue(a.y + dy);
      a.y = nextY;
      b.y = nextY;
    } else {
      const nextX = snapRouteValue(a.x + dx);
      a.x = nextX;
      b.x = nextX;
    }

    const routed = simplifyPoints(orthogonalizePoints(nextPoints));
    onMoveConnectionRoute(segmentDrag.connectionId, routed.slice(1, -1));
  };

  const handleSegmentPointerUp = (e: React.PointerEvent<SVGPathElement>) => {
    if (!segmentDrag || e.pointerId !== segmentDrag.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setSegmentDrag(null);
  };

  return (
    <g>
      {/* Rendered connections */}
      {connections.map((conn) => {
        const fromComp = compMap.get(conn.fromComponentId);
        const toComp = compMap.get(conn.toComponentId);
        if (!fromComp || !toComp) return null;
        const fromProd = products.get(fromComp.productId);
        const toProd = products.get(toComp.productId);
        if (!fromProd || !toProd) return null;

        const from = getConnectionTerminalPos(fromComp, conn.fromTerminalId, fromProd);
        const to = getConnectionTerminalPos(toComp, conn.toTerminalId, toProd);
        if (!from || !to) return null;

        const isSelected = conn.id === selectedConnectionId;
        const color = connectionColor(conn, fromComp, fromProd, busColors);
        const points = connectionPoints(conn, from, to);
        const path = pointsToPath(points);
        const roundedPath = pointsToRoundedPath(points);
        const marker = pathMidpointWithAngle(points);
        const markerPoint = marker.point;
        const strokeWidth = connectionStrokeWidth(conn);
        const protectionRecommendation = recommendationByConnection.get(conn.id);
        const hasProtectionRecommendation = Boolean(protectionRecommendation);

        return (
          <g key={conn.id}>
            {/* Wide invisible hit area for selecting the whole wire */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={Math.max(14, strokeWidth + 10)}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                onClearProtectionPrompt();
                onSelectConnection(conn.id);
              }}
            />
            {points.slice(0, -1).map((point, index) => {
              const next = points[index + 1];
              const orientation = point.y === next.y ? 'horizontal' : point.x === next.x ? 'vertical' : null;
              if (!orientation) return null;

              return (
                <path
                  key={`${conn.id}-segment-${index}`}
                  d={pointsToPath([point, next])}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={18}
                  style={{ cursor: orientation === 'horizontal' ? 'ns-resize' : 'ew-resize' }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    onClearProtectionPrompt();
                    onSelectConnection(conn.id);
                    const dragRoute = prepareSegmentDrag(points, index, orientation);
                    setSegmentDrag({
                      connectionId: conn.id,
                      segmentIndex: dragRoute.segmentIndex,
                      orientation,
                      startMouse: svgCoords(e),
                      startPoints: dragRoute.startPoints,
                      pointerId: e.pointerId,
                    });
                  }}
                  onPointerMove={handleSegmentPointerMove}
                  onPointerUp={handleSegmentPointerUp}
                  onPointerCancel={handleSegmentPointerUp}
                  onClick={(e) => e.stopPropagation()}
                />
              );
            })}
            {/* Visible wire */}
            <path
              d={roundedPath}
              fill="none"
              stroke={isSelected ? '#1769d2' : hasProtectionRecommendation ? '#c2410c' : color}
              strokeWidth={strokeWidth + (isSelected || hasProtectionRecommendation ? 1 : 0)}
              strokeDasharray={conn.autoGenerated ? '6 3' : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={hasProtectionRecommendation ? 0.95 : 0.85}
              style={{ pointerEvents: 'none' }}
            />
            {/* AWG label near midpoint */}
            {conn.recommendedCableAwg && (
              <text
                x={markerPoint.x}
                y={markerPoint.y - (hasProtectionRecommendation ? 18 : 8)}
                textAnchor="middle"
                fill={isSelected ? '#1769d2' : hasProtectionRecommendation ? '#c2410c' : '#6d7b90'}
                fontSize={8}
                fontWeight={800}
                style={{ pointerEvents: 'none' }}
              >
                {conn.recommendedCableAwg} AWG
              </text>
            )}
            {protectionRecommendation && (
              <g
                transform={`translate(${markerPoint.x} ${markerPoint.y})`}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectConnection(conn.id);
                  onShowProtectionPrompt(conn.id, protectionRecommendation, marker);
                }}
              >
                <title>{protectionRecommendation.message}</title>
                <circle r={11} fill="#fff7ed" stroke="#c2410c" strokeWidth={2} />
                <path d="M -5 -3 L -1 -3 L -3 3 L 5 3" fill="none" stroke="#c2410c" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fill="#c2410c"
                  fontSize={13}
                  fontWeight={900}
                  style={{ pointerEvents: 'none' }}
                >
                  !
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Pending connection line being drawn */}
      {pendingLine && (
        <path
          d={pendingOrthogonalPath(pendingLine)}
          fill="none"
          stroke="#1769d2"
          strokeWidth={2}
          strokeDasharray="4 4"
          strokeLinejoin="miter"
          opacity={0.7}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </g>
  );
}
