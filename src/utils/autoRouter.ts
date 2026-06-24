import type { SystemComponent, SystemConnection, Product, SystemDiagramAnnotation } from '../types/system';
import { getConnectionTerminalPos, offsetFromSide, orthogonalizePoints, simplifyPoints, type Point, type TerminalPos } from './connectionGeometry';
import { getEffectiveProductForComponent } from './solarCalculations';
import { componentScale, scaledProductSize } from './componentScale';
import { isVerticalOrientation } from './componentOrientation';

export const OBSTACLE_PADDING = 14;

export interface RoutingObstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function buildObstacles(
  components: SystemComponent[],
  products: Map<string, Product>,
  annotations: SystemDiagramAnnotation[],
  padding = OBSTACLE_PADDING
): RoutingObstacle[] {
  const obstacles: RoutingObstacle[] = [];

  for (const comp of components) {
    const product = getEffectiveProductForComponent(comp, products.get(comp.productId));
    if (!product) continue;
    const scale = componentScale(comp);
    const { width, height } = scaledProductSize(product, scale);
    const isVertical = isVerticalOrientation(comp.rotationDeg);
    const symbolW = isVertical ? height : width;
    const symbolH = isVertical ? width : height;
    const halfW = symbolW / 2 + padding;
    const halfH = Math.max(symbolH / 2, height / 2 + 22) + padding;
    obstacles.push({
      id: comp.id,
      x: comp.x - halfW,
      y: comp.y - halfH,
      width: halfW * 2,
      height: halfH * 2,
    });
  }

  for (const ann of annotations) {
    obstacles.push({
      id: ann.id,
      x: ann.x - padding,
      y: ann.y - padding,
      width: ann.width + padding * 2,
      height: ann.height + padding * 2,
    });
  }

  return obstacles;
}

function segmentIntersectsRect(p1: Point, p2: Point, rect: RoutingObstacle): boolean {
  const rx1 = rect.x;
  const rx2 = rect.x + rect.width;
  const ry1 = rect.y;
  const ry2 = rect.y + rect.height;

  if (Math.abs(p1.x - p2.x) < 0.01) {
    // Vertical segment
    if (p1.x <= rx1 || p1.x >= rx2) return false;
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    return maxY > ry1 && minY < ry2;
  } else {
    // Horizontal segment
    if (p1.y <= ry1 || p1.y >= ry2) return false;
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    return maxX > rx1 && minX < rx2;
  }
}

function pathIntersectionCount(points: Point[], obstacles: RoutingObstacle[], excludeIds: Set<string>): number {
  let count = 0;
  for (let i = 0; i < points.length - 1; i++) {
    for (const obs of obstacles) {
      if (excludeIds.has(obs.id)) continue;
      if (segmentIntersectsRect(points[i], points[i + 1], obs)) count++;
    }
  }
  return count;
}

function manhattanLength(points: Point[]): number {
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    len += Math.abs(points[i + 1].x - points[i].x) + Math.abs(points[i + 1].y - points[i].y);
  }
  return len;
}

function renderCandidate(from: TerminalPos, mid: Point[], to: TerminalPos): Point[] {
  return simplifyPoints(orthogonalizePoints([{ x: from.x, y: from.y }, ...mid, { x: to.x, y: to.y }]));
}

function scoreCandidate(
  rendered: Point[],
  obstacles: RoutingObstacle[],
  excludeIds: Set<string>
): number {
  const intersections = pathIntersectionCount(rendered, obstacles, excludeIds);
  const length = manhattanLength(rendered);
  const bends = Math.max(0, rendered.length - 2);
  return intersections * 10000 + length + bends * 50;
}

function generateCandidates(fStub: Point, tStub: Point, obstacles: RoutingObstacle[]): Point[][] {
  const midX = (fStub.x + tStub.x) / 2;
  const midY = (fStub.y + tStub.y) / 2;

  const candidates: Point[][] = [
    // L-shapes
    [fStub, { x: tStub.x, y: fStub.y }, tStub],
    [fStub, { x: fStub.x, y: tStub.y }, tStub],
    // Z-shapes via midpoints
    [fStub, { x: midX, y: fStub.y }, { x: midX, y: tStub.y }, tStub],
    [fStub, { x: fStub.x, y: midY }, { x: tStub.x, y: midY }, tStub],
  ];

  // Detour candidates routing around each obstacle's edges
  for (const obs of obstacles) {
    const left = obs.x;
    const right = obs.x + obs.width;
    const top = obs.y;
    const bottom = obs.y + obs.height;

    // 3-segment detours: go to corridor X/Y, cross, come back
    candidates.push([fStub, { x: left, y: fStub.y }, { x: left, y: tStub.y }, tStub]);
    candidates.push([fStub, { x: right, y: fStub.y }, { x: right, y: tStub.y }, tStub]);
    candidates.push([fStub, { x: fStub.x, y: top }, { x: tStub.x, y: top }, tStub]);
    candidates.push([fStub, { x: fStub.x, y: bottom }, { x: tStub.x, y: bottom }, tStub]);

    // 5-segment detours: combine obstacle edge with midpoint
    candidates.push([fStub, { x: left, y: fStub.y }, { x: left, y: midY }, { x: tStub.x, y: midY }, tStub]);
    candidates.push([fStub, { x: right, y: fStub.y }, { x: right, y: midY }, { x: tStub.x, y: midY }, tStub]);
    candidates.push([fStub, { x: midX, y: fStub.y }, { x: midX, y: top }, { x: tStub.x, y: top }, tStub]);
    candidates.push([fStub, { x: midX, y: fStub.y }, { x: midX, y: bottom }, { x: tStub.x, y: bottom }, tStub]);
    candidates.push([fStub, { x: fStub.x, y: top }, { x: midX, y: top }, { x: midX, y: tStub.y }, tStub]);
    candidates.push([fStub, { x: fStub.x, y: bottom }, { x: midX, y: bottom }, { x: midX, y: tStub.y }, tStub]);
  }

  return candidates;
}

/**
 * Route a single connection between two terminals, avoiding obstacles.
 * Returns routePoints (intermediate waypoints, excluding the terminal positions themselves).
 */
export function routeConnection(
  from: TerminalPos,
  to: TerminalPos,
  obstacles: RoutingObstacle[],
  excludeIds: Set<string>
): Point[] {
  const fStub = offsetFromSide(from);
  const tStub = offsetFromSide(to);
  const candidates = generateCandidates(fStub, tStub, obstacles);

  let bestCandidate = candidates[0];
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const rendered = renderCandidate(from, candidate, to);
    const score = scoreCandidate(rendered, obstacles, excludeIds);
    if (score < bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  // Return intermediate waypoints (without from/to terminals)
  const full = renderCandidate(from, bestCandidate, to);
  return full.slice(1, -1);
}

/**
 * Re-route all connections in the system, building obstacles from components and annotations.
 */
export function autoRouteConnections(
  connections: SystemConnection[],
  components: SystemComponent[],
  products: Map<string, Product>,
  annotations: SystemDiagramAnnotation[]
): SystemConnection[] {
  const obstacles = buildObstacles(components, products, annotations);
  const compMap = new Map(components.map((c) => [c.id, c]));

  return connections.map((conn) => {
    try {
      const fromComp = compMap.get(conn.fromComponentId);
      const toComp = compMap.get(conn.toComponentId);
      if (!fromComp || !toComp) return conn;
      const fromProd = products.get(fromComp.productId);
      const toProd = products.get(toComp.productId);
      if (!fromProd || !toProd) return conn;
      const from = getConnectionTerminalPos(fromComp, conn.fromTerminalId, fromProd);
      const to = getConnectionTerminalPos(toComp, conn.toTerminalId, toProd);
      if (!from || !to) return conn;

      const excludeIds = new Set([conn.fromComponentId, conn.toComponentId]);
      const routePoints = routeConnection(from, to, obstacles, excludeIds);
      return { ...conn, routePoints, routeMode: 'auto' as const };
    } catch {
      return conn;
    }
  });
}
