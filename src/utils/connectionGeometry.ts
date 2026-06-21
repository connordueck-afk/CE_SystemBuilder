import type { Product, SystemComponent, SystemConnection, TerminalSide } from '../types/system';
import { getEffectiveTerminal } from './effectiveTerminals';
import { transformOrientationOffset, transformOrientationSide } from './componentOrientation';

export interface Point {
  x: number;
  y: number;
}

export interface TerminalPos extends Point {
  side: TerminalSide;
}

export interface PathMarker {
  point: Point;
  angleDeg: 0 | 90 | 180 | 270;
  segmentIndex: number;
}

const STUB_DISTANCE = 36;

function rotateOffset(comp: SystemComponent, offsetX: number, offsetY: number): Point {
  return transformOrientationOffset(comp.rotationDeg, offsetX, offsetY);
}

function rotateSide(comp: SystemComponent, side: TerminalSide): TerminalSide {
  return transformOrientationSide(comp.rotationDeg, side);
}

export function getConnectionTerminalPos(
  comp: SystemComponent,
  terminalId: string,
  product: Product
): TerminalPos | null {
  const terminal = getEffectiveTerminal(product, terminalId, comp);
  if (!terminal) return null;
  const offset = rotateOffset(comp, terminal.offsetX, terminal.offsetY);
  return {
    x: comp.x + offset.x,
    y: comp.y + offset.y,
    side: rotateSide(comp, terminal.side),
  };
}

function offsetFromSide(pos: TerminalPos, dist = STUB_DISTANCE): Point {
  switch (pos.side) {
    case 'left':   return { x: pos.x - dist, y: pos.y };
    case 'right':  return { x: pos.x + dist, y: pos.y };
    case 'top':    return { x: pos.x, y: pos.y - dist };
    case 'bottom': return { x: pos.x, y: pos.y + dist };
    default:       return { x: pos.x, y: pos.y };
  }
}

export function simplifyPoints(points: Point[]): Point[] {
  return points.filter((point, index) => {
    const prev = points[index - 1];
    const next = points[index + 1];
    if (!prev || !next) return true;
    return !(
      (prev.x === point.x && point.x === next.x) ||
      (prev.y === point.y && point.y === next.y)
    );
  });
}

export function orthogonalizePoints(points: Point[]): Point[] {
  const orthogonal: Point[] = [];

  points.forEach((point) => {
    const prev = orthogonal[orthogonal.length - 1];
    if (!prev) {
      orthogonal.push(point);
      return;
    }

    if (prev.x !== point.x && prev.y !== point.y) {
      orthogonal.push({ x: point.x, y: prev.y });
    }
    orthogonal.push(point);
  });

  return simplifyPoints(orthogonal);
}

export function defaultOrthogonalPoints(from: TerminalPos, to: TerminalPos): Point[] {
  const fromStub = offsetFromSide(from);
  const toStub = offsetFromSide(to);
  const points: Point[] = [
    { x: from.x, y: from.y },
    fromStub,
  ];

  if (fromStub.x === toStub.x || fromStub.y === toStub.y) {
    points.push(toStub);
  } else if (
    (from.side === 'left' || from.side === 'right') &&
    (to.side === 'top' || to.side === 'bottom')
  ) {
    points.push({ x: toStub.x, y: fromStub.y }, toStub);
  } else if (
    (from.side === 'top' || from.side === 'bottom') &&
    (to.side === 'left' || to.side === 'right')
  ) {
    points.push({ x: fromStub.x, y: toStub.y }, toStub);
  } else if (from.side === 'left' || from.side === 'right') {
    const midX = (fromStub.x + toStub.x) / 2;
    points.push({ x: midX, y: fromStub.y }, { x: midX, y: toStub.y }, toStub);
  } else {
    const midY = (fromStub.y + toStub.y) / 2;
    points.push({ x: fromStub.x, y: midY }, { x: toStub.x, y: midY }, toStub);
  }

  points.push({ x: to.x, y: to.y });
  return simplifyPoints(points);
}

export function connectionPoints(conn: SystemConnection, from: TerminalPos, to: TerminalPos): Point[] {
  if (!conn.routePoints || conn.routePoints.length === 0) {
    return defaultOrthogonalPoints(from, to);
  }

  return orthogonalizePoints([
    { x: from.x, y: from.y },
    ...conn.routePoints,
    { x: to.x, y: to.y },
  ]);
}

function segmentLength(a: Point, b: Point): number {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

function segmentAngle(a: Point, b: Point): 0 | 90 | 180 | 270 {
  if (Math.abs(b.x - a.x) >= Math.abs(b.y - a.y)) {
    return b.x >= a.x ? 0 : 180;
  }
  return b.y >= a.y ? 90 : 270;
}

export function pathMidpointWithAngle(points: Point[]): PathMarker {
  if (points.length === 0) return { point: { x: 0, y: 0 }, angleDeg: 0, segmentIndex: 0 };
  if (points.length === 1) return { point: points[0], angleDeg: 0, segmentIndex: 0 };

  const segmentLengths = points.slice(0, -1).map((point, index) => segmentLength(point, points[index + 1]));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
  let remaining = totalLength / 2;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    const point = points[index];
    const next = points[index + 1];
    if (remaining <= length) {
      const ratio = length === 0 ? 0 : remaining / length;
      return {
        point: {
          x: point.x + (next.x - point.x) * ratio,
          y: point.y + (next.y - point.y) * ratio,
        },
        angleDeg: segmentAngle(point, next),
        segmentIndex: index,
      };
    }
    remaining -= length;
  }

  const lastIndex = Math.max(0, points.length - 2);
  return {
    point: points[points.length - 1],
    angleDeg: segmentAngle(points[lastIndex], points[points.length - 1]),
    segmentIndex: lastIndex,
  };
}

export function splitPointsAtMarker(points: Point[], marker: PathMarker): { before: Point[]; after: Point[] } {
  const segmentIndex = Math.max(0, Math.min(marker.segmentIndex, points.length - 2));
  return {
    before: simplifyPoints([...points.slice(0, segmentIndex + 1), marker.point]),
    after: simplifyPoints([marker.point, ...points.slice(segmentIndex + 1)]),
  };
}
