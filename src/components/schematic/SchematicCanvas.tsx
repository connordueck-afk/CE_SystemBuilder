import { useRef, useState, useCallback, useEffect } from 'react';
import type { SystemDesign, SystemComponent, Product } from '../../types/system';
import { ComponentNode } from './ComponentNode';
import { ConnectionLayer } from './ConnectionLayer';
import { TextAnnotationNode } from './TextAnnotationNode';
import { getEffectiveTerminal } from '../../utils/effectiveTerminals';
import { getEffectiveProductForComponent } from '../../utils/solarCalculations';
import type { ProtectionRecommendation } from '../../utils/protectionRecommendations';
import type { BusColorMap } from '../../utils/busColors';
import { isVerticalOrientation, transformOrientationOffset } from '../../utils/componentOrientation';

interface DragState {
  componentId: string;
  startMouseX: number;
  startMouseY: number;
  startCompX: number;
  startCompY: number;
}

interface PendingConn {
  fromComponentId: string;
  fromTerminalId: string;
  startX: number;
  startY: number;
}

interface PanState {
  startClientX: number;
  startClientY: number;
  startCenterX: number;
  startCenterY: number;
  startViewportWidth: number;
  startViewportHeight: number;
}

interface ScrollDragState {
  axis: 'x' | 'y';
  startClient: number;
  startCenter: number;
}

interface CanvasSize {
  width: number;
  height: number;
}

interface Props {
  system: SystemDesign;
  products: Map<string, Product>;
  selectedComponentId: string | null;
  selectedConnectionId: string | null;
  selectedAnnotationId: string | null;
  protectionRecommendations: ProtectionRecommendation[];
  busColors: BusColorMap;
  focusedComponentId: string | null;
  focusRequestId: number;
  onViewportCenterChange: (center: { x: number; y: number }) => void;
  onSelectComponent: (id: string | null) => void;
  onSelectConnection: (id: string | null) => void;
  onSelectAnnotation: (id: string | null) => void;
  onMoveComponent: (id: string, x: number, y: number) => void;
  onMoveAnnotation: (id: string, x: number, y: number) => void;
  onResizeAnnotation: (id: string, width: number, height: number) => void;
  onRotateComponent: (id: string) => void;
  onRemoveComponent: (id: string) => void;
  onRemoveConnection: (id: string) => void;
  onRemoveAnnotation: (id: string) => void;
  onMoveConnectionRoute: (id: string, routePoints: Array<{ x: number; y: number }>) => void;
  onAddConnection: (
    fromComp: string,
    fromTerm: string,
    toComp: string,
    toTerm: string
  ) => void;
}

const VIEW_W = 1200;
const VIEW_H = 760;
const WORLD_X = -600;
const WORLD_Y = -420;
const WORLD_W = 2400;
const WORLD_H = 1600;
const GRID = 20;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.2;
const TRACKPAD_ZOOM_SENSITIVITY = 0.004;
const FIT_PADDING = 80;

function snapToGrid(v: number): number {
  return Math.round(v / GRID) * GRID;
}

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function viewportFor(center: { x: number; y: number }, zoom: number, size: CanvasSize) {
  const width = size.width / zoom;
  const height = size.height / zoom;
  return {
    x: center.x - width / 2,
    y: center.y - height / 2,
    width,
    height,
  };
}

function clampCenter(center: { x: number; y: number }, zoom: number, size: CanvasSize): { x: number; y: number } {
  const width = size.width / zoom;
  const height = size.height / zoom;
  const minX = WORLD_X + width / 2;
  const maxX = WORLD_X + WORLD_W - width / 2;
  const minY = WORLD_Y + height / 2;
  const maxY = WORLD_Y + WORLD_H - height / 2;

  return {
    x: width >= WORLD_W ? WORLD_X + WORLD_W / 2 : Math.min(maxX, Math.max(minX, center.x)),
    y: height >= WORLD_H ? WORLD_Y + WORLD_H / 2 : Math.min(maxY, Math.max(minY, center.y)),
  };
}

function componentFootprint(product: Product, rotationDeg = 0): { halfWidth: number; halfHeight: number } {
  const rotated = isVerticalOrientation(rotationDeg);
  const symbolWidth = rotated ? product.height : product.width;
  const symbolHeight = rotated ? product.width : product.height;

  return {
    halfWidth: symbolWidth / 2,
    halfHeight: Math.max(symbolHeight / 2, product.height / 2 + 22),
  };
}

function clampComponentToWorld(
  point: { x: number; y: number },
  product: Product,
  rotationDeg = 0
): { x: number; y: number } {
  const { halfWidth, halfHeight } = componentFootprint(product, rotationDeg);
  return {
    x: Math.min(WORLD_X + WORLD_W - halfWidth, Math.max(WORLD_X + halfWidth, point.x)),
    y: Math.min(WORLD_Y + WORLD_H - halfHeight, Math.max(WORLD_Y + halfHeight, point.y)),
  };
}

function diagramBounds(system: SystemDesign, products: Map<string, Product>) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const component of system.components) {
    const product = getEffectiveProductForComponent(component, products.get(component.productId));
    if (!product) continue;
    const footprint = componentFootprint(product, component.rotationDeg);
    minX = Math.min(minX, component.x - footprint.halfWidth);
    minY = Math.min(minY, component.y - footprint.halfHeight);
    maxX = Math.max(maxX, component.x + footprint.halfWidth);
    maxY = Math.max(maxY, component.y + footprint.halfHeight);
  }

  for (const annotation of system.annotations ?? []) {
    minX = Math.min(minX, annotation.x);
    minY = Math.min(minY, annotation.y);
    maxX = Math.max(maxX, annotation.x + annotation.width);
    maxY = Math.max(maxY, annotation.y + annotation.height);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}

function svgCoords(e: { clientX: number; clientY: number }, svgEl: SVGSVGElement): { x: number; y: number } {
  const point = svgEl.createSVGPoint();
  point.x = e.clientX;
  point.y = e.clientY;
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const transformed = point.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}

function terminalOffset(comp: SystemComponent, terminal: { offsetX: number; offsetY: number }): { x: number; y: number } {
  return transformOrientationOffset(comp.rotationDeg, terminal.offsetX, terminal.offsetY);
}

export function SchematicCanvas({
  system,
  products,
  selectedComponentId,
  selectedConnectionId,
  selectedAnnotationId,
  protectionRecommendations,
  busColors,
  focusedComponentId,
  focusRequestId,
  onViewportCenterChange,
  onSelectComponent,
  onSelectConnection,
  onSelectAnnotation,
  onMoveComponent,
  onMoveAnnotation,
  onResizeAnnotation,
  onRotateComponent,
  onRemoveComponent,
  onRemoveConnection,
  onRemoveAnnotation,
  onMoveConnectionRoute,
  onAddConnection,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [pendingConn, setPendingConn] = useState<PendingConn | null>(null);
  const [panning, setPanning] = useState<PanState | null>(null);
  const [scrollDragging, setScrollDragging] = useState<ScrollDragState | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [viewportCenter, setViewportCenter] = useState({ x: VIEW_W / 2, y: VIEW_H / 2 });
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: VIEW_W, height: VIEW_H });
  const didPanRef = useRef(false);

  const viewport = viewportFor(viewportCenter, zoom, canvasSize);

  useEffect(() => {
    onViewportCenterChange(viewportCenter);
  }, [onViewportCenterChange, viewportCenter]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const updateSize = () => {
      const rect = canvasEl.getBoundingClientRect();
      setCanvasSize({
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvasEl);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    setViewportCenter((center) => clampCenter(center, zoom, canvasSize));
  }, [canvasSize, zoom]);

  useEffect(() => {
    if (!focusedComponentId) return;
    const component = system.components.find((c) => c.id === focusedComponentId);
    if (!component) return;
    setViewportCenter(clampCenter({ x: component.x, y: component.y }, zoom, canvasSize));
  }, [canvasSize, focusRequestId, focusedComponentId, system.components, zoom]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable) return;
      if (e.key === 'Delete') {
        if (selectedComponentId) {
          e.preventDefault();
          onRemoveComponent(selectedComponentId);
          return;
        }
        if (selectedConnectionId) {
          e.preventDefault();
          onRemoveConnection(selectedConnectionId);
          return;
        }
        if (selectedAnnotationId) {
          e.preventDefault();
          onRemoveAnnotation(selectedAnnotationId);
        }
        return;
      }

      if (e.key.toLowerCase() === 'r' && selectedComponentId) {
        e.preventDefault();
        onRotateComponent(selectedComponentId);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRemoveAnnotation, onRemoveComponent, onRemoveConnection, onRotateComponent, selectedAnnotationId, selectedComponentId, selectedConnectionId]);

  const updateZoom = useCallback((delta: number) => {
    setZoom((current) => {
      const next = clampZoom(Number((current + delta).toFixed(2)));
      setViewportCenter((center) => clampCenter(center, next, canvasSize));
      return next;
    });
  }, [canvasSize]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!svgRef.current) return;
    e.preventDefault();

    if (e.ctrlKey) {
      const point = svgCoords(e, svgRef.current);

      setZoom((currentZoom) => {
        const zoomDelta = -e.deltaY * TRACKPAD_ZOOM_SENSITIVITY;
        const nextZoom = clampZoom(Number((currentZoom + zoomDelta).toFixed(3)));
        if (nextZoom === currentZoom) return currentZoom;

        setViewportCenter((currentCenter) => {
          const currentViewport = viewportFor(currentCenter, currentZoom, canvasSize);
          const nextWidth = canvasSize.width / nextZoom;
          const nextHeight = canvasSize.height / nextZoom;
          const cursorRatioX = (point.x - currentViewport.x) / currentViewport.width;
          const cursorRatioY = (point.y - currentViewport.y) / currentViewport.height;
          const nextX = point.x - cursorRatioX * nextWidth;
          const nextY = point.y - cursorRatioY * nextHeight;
          return clampCenter({ x: nextX + nextWidth / 2, y: nextY + nextHeight / 2 }, nextZoom, canvasSize);
        });

        return nextZoom;
      });

      return;
    }

    setViewportCenter((currentCenter) => {
      const panScale = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? GRID : 1;
      return clampCenter({
        x: currentCenter.x + (e.deltaX * panScale) / zoom,
        y: currentCenter.y + (e.deltaY * panScale) / zoom,
      }, zoom, canvasSize);
    });
  }, [canvasSize, zoom]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    canvasEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvasEl.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setViewportCenter(clampCenter({ x: VIEW_W / 2, y: VIEW_H / 2 }, 1, canvasSize));
  }, [canvasSize]);

  const fitDiagram = useCallback(() => {
    const bounds = diagramBounds(system, products);
    if (!bounds) {
      resetZoom();
      return;
    }

    const width = Math.max(1, bounds.maxX - bounds.minX + FIT_PADDING * 2);
    const height = Math.max(1, bounds.maxY - bounds.minY + FIT_PADDING * 2);
    const nextZoom = clampZoom(Math.min(canvasSize.width / width, canvasSize.height / height));
    const center = {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    };

    setZoom(nextZoom);
    setViewportCenter(clampCenter(center, nextZoom, canvasSize));
  }, [canvasSize, products, resetZoom, system]);

  const moveViewportTo = useCallback((center: { x: number; y: number }) => {
    setViewportCenter(clampCenter(center, zoom, canvasSize));
  }, [canvasSize, zoom]);

  const scrollToRatio = useCallback((axis: 'x' | 'y', ratio: number) => {
    const boundedRatio = Math.min(1, Math.max(0, ratio));
    setViewportCenter((center) => {
      if (axis === 'x') {
        const range = Math.max(0, WORLD_W - viewport.width);
        return clampCenter({
          x: WORLD_X + viewport.width / 2 + range * boundedRatio,
          y: center.y,
        }, zoom, canvasSize);
      }

      const range = Math.max(0, WORLD_H - viewport.height);
      return clampCenter({
        x: center.x,
        y: WORLD_Y + viewport.height / 2 + range * boundedRatio,
      }, zoom, canvasSize);
    });
  }, [canvasSize, viewport.height, viewport.width, zoom]);

  const handleScrollTrackPointerDown = useCallback((axis: 'x' | 'y', e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const client = axis === 'x' ? e.clientX : e.clientY;
    const start = axis === 'x' ? rect.left : rect.top;
    const length = axis === 'x' ? rect.width : rect.height;
    const thumbRatio = axis === 'x'
      ? Math.min(1, viewport.width / WORLD_W)
      : Math.min(1, viewport.height / WORLD_H);
    const ratio = (client - start - (length * thumbRatio) / 2) / Math.max(1, length * (1 - thumbRatio));
    scrollToRatio(axis, ratio);
  }, [scrollToRatio, viewport.height, viewport.width]);

  const handleScrollThumbPointerDown = useCallback((axis: 'x' | 'y', e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrollDragging({
      axis,
      startClient: axis === 'x' ? e.clientX : e.clientY,
      startCenter: axis === 'x' ? viewportCenter.x : viewportCenter.y,
    });
  }, [viewportCenter.x, viewportCenter.y]);

  const handleScrollThumbPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollDragging) return;

    const trackLength = scrollDragging.axis === 'x' ? canvasSize.width - 28 : canvasSize.height - 28;
    const viewportLength = scrollDragging.axis === 'x' ? viewport.width : viewport.height;
    const worldLength = scrollDragging.axis === 'x' ? WORLD_W : WORLD_H;
    const thumbRatio = Math.min(1, viewportLength / worldLength);
    const thumbTravel = Math.max(1, trackLength * (1 - thumbRatio));
    const worldTravel = Math.max(0, worldLength - viewportLength);
    const client = scrollDragging.axis === 'x' ? e.clientX : e.clientY;
    const delta = ((client - scrollDragging.startClient) / thumbTravel) * worldTravel;

    if (scrollDragging.axis === 'x') {
      moveViewportTo({ x: scrollDragging.startCenter + delta, y: viewportCenter.y });
    } else {
      moveViewportTo({ x: viewportCenter.x, y: scrollDragging.startCenter + delta });
    }
  }, [canvasSize.height, canvasSize.width, moveViewportTo, scrollDragging, viewport.height, viewport.width, viewportCenter.x, viewportCenter.y]);

  const handleScrollThumbPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (scrollDragging) e.currentTarget.releasePointerCapture(e.pointerId);
    setScrollDragging(null);
  }, [scrollDragging]);

  const handleDragStart = useCallback((componentId: string, e: React.MouseEvent) => {
    if (!svgRef.current || pendingConn) return;
    const pos = svgCoords(e, svgRef.current);
    const comp = system.components.find((c) => c.id === componentId);
    if (!comp) return;
    e.stopPropagation();
    setDragging({
      componentId,
      startMouseX: pos.x,
      startMouseY: pos.y,
      startCompX: comp.x,
      startCompY: comp.y,
    });
  }, [system.components, pendingConn]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const pos = svgCoords(e, svgRef.current);
    setMousePos(pos);

    if (dragging) {
      const dx = pos.x - dragging.startMouseX;
      const dy = pos.y - dragging.startMouseY;
      const comp = system.components.find((c) => c.id === dragging.componentId);
      const product = comp ? products.get(comp.productId) : undefined;
      if (!comp || !product) return;
      const nextPos = clampComponentToWorld({
        x: snapToGrid(dragging.startCompX + dx),
        y: snapToGrid(dragging.startCompY + dy),
      }, product, comp.rotationDeg);
      onMoveComponent(
        dragging.componentId,
        nextPos.x,
        nextPos.y
      );
    }

    if (panning) {
      const rect = svgRef.current.getBoundingClientRect();
      const dx = ((e.clientX - panning.startClientX) / rect.width) * panning.startViewportWidth;
      const dy = ((e.clientY - panning.startClientY) / rect.height) * panning.startViewportHeight;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) didPanRef.current = true;
      setViewportCenter(clampCenter({
        x: panning.startCenterX - dx,
        y: panning.startCenterY - dy,
      }, zoom, canvasSize));
    }
  }, [canvasSize, dragging, onMoveComponent, panning, products, system.components, zoom]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setPanning(null);
    setScrollDragging(null);
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || pendingConn || e.button !== 0) return;
    const target = e.target as Element;
    if (target !== e.currentTarget && target.getAttribute('data-canvas-bg') !== 'true') return;
    didPanRef.current = false;
    setPanning({
      startClientX: e.clientX,
      startClientY: e.clientY,
      startCenterX: viewportCenter.x,
      startCenterY: viewportCenter.y,
      startViewportWidth: viewport.width,
      startViewportHeight: viewport.height,
    });
  }, [pendingConn, viewportCenter, viewport.width, viewport.height]);

  const handleTerminalMouseDown = useCallback((compId: string, termId: string, e: React.MouseEvent) => {
    if (!svgRef.current) return;
    e.stopPropagation();
    const pos = svgCoords(e, svgRef.current);

    if (pendingConn) {
      if (pendingConn.fromComponentId !== compId || pendingConn.fromTerminalId !== termId) {
        onAddConnection(pendingConn.fromComponentId, pendingConn.fromTerminalId, compId, termId);
      }
      setPendingConn(null);
    } else {
      const comp = system.components.find((c) => c.id === compId);
      const prod = comp ? products.get(comp.productId) : undefined;
      const terminal = comp && prod ? getEffectiveTerminal(prod, termId, comp) : undefined;
      const offset = comp && terminal ? terminalOffset(comp, terminal) : { x: 0, y: 0 };
      setPendingConn({
        fromComponentId: compId,
        fromTerminalId: termId,
        startX: comp ? comp.x + offset.x : pos.x,
        startY: comp ? comp.y + offset.y : pos.y,
      });
    }
  }, [pendingConn, onAddConnection, system.components, products]);

  const handleCanvasClick = useCallback(() => {
    if (didPanRef.current) {
      didPanRef.current = false;
      return;
    }
    if (pendingConn) {
      setPendingConn(null);
      return;
    }
    onSelectComponent(null);
    onSelectConnection(null);
    onSelectAnnotation(null);
  }, [pendingConn, onSelectAnnotation, onSelectComponent, onSelectConnection]);

  const pendingLine = pendingConn && mousePos
    ? { x1: pendingConn.startX, y1: pendingConn.startY, x2: mousePos.x, y2: mousePos.y }
    : null;

  const horizontalThumbSize = Math.max(8, Math.min(100, (viewport.width / WORLD_W) * 100));
  const verticalThumbSize = Math.max(8, Math.min(100, (viewport.height / WORLD_H) * 100));
  const horizontalScrollRatio = (viewport.x - WORLD_X) / Math.max(1, WORLD_W - viewport.width);
  const verticalScrollRatio = (viewport.y - WORLD_Y) / Math.max(1, WORLD_H - viewport.height);
  const horizontalThumb = {
    width: `${horizontalThumbSize}%`,
    left: `${Math.max(0, Math.min(100 - horizontalThumbSize, horizontalScrollRatio * (100 - horizontalThumbSize)))}%`,
  };
  const verticalThumb = {
    height: `${verticalThumbSize}%`,
    top: `${Math.max(0, Math.min(100 - verticalThumbSize, verticalScrollRatio * (100 - verticalThumbSize)))}%`,
  };

  return (
    <div ref={canvasRef} className="canvas-shell">
      <div className="canvas-zoom-controls" aria-label="Canvas zoom controls">
        <button type="button" className="canvas-zoom-btn" onClick={() => updateZoom(-ZOOM_STEP)} title="Zoom out">
          -
        </button>
        <button type="button" className="canvas-zoom-value" onClick={resetZoom} title="Reset zoom">
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" className="canvas-zoom-btn" onClick={() => updateZoom(ZOOM_STEP)} title="Zoom in">
          +
        </button>
        <button type="button" className="canvas-zoom-btn canvas-fit-btn" onClick={fitDiagram} title="Fit diagram to screen">
          Fit
        </button>
      </div>
      {pendingConn && (
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          background: '#eaf4ff', color: '#1769d2', padding: '6px 12px',
          borderRadius: 8, fontSize: 11, fontWeight: 800, zIndex: 10, pointerEvents: 'none',
          border: '1px solid #cfe1f8',
          boxShadow: '0 8px 20px rgb(30 45 70 / 8%)',
        }}>
          Click another terminal to connect - Escape or click canvas to cancel
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        style={{ display: 'block', cursor: pendingConn ? 'crosshair' : dragging || panning ? 'grabbing' : 'grab' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {/* Grid dots */}
        <defs>
          <pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
            <circle cx={GRID / 2} cy={GRID / 2} r={0.75} fill="#cbd6e4" />
          </pattern>
        </defs>
        <rect data-canvas-bg="true" x={WORLD_X} y={WORLD_Y} width={WORLD_W} height={WORLD_H} fill="#f4f7fb" />
        <rect data-canvas-bg="true" x={WORLD_X} y={WORLD_Y} width={WORLD_W} height={WORLD_H} fill="url(#grid)" />

        {/* Connections behind components */}
        <ConnectionLayer
          connections={system.connections}
          components={system.components}
          products={products}
          selectedConnectionId={selectedConnectionId}
          protectionRecommendations={protectionRecommendations}
          busColors={busColors}
          onSelectConnection={(id) => {
            onSelectConnection(id);
            onSelectComponent(null);
          }}
          onMoveConnectionRoute={onMoveConnectionRoute}
          pendingLine={pendingLine}
        />

        {/* Components */}
        {system.components.map((comp) => {
          const product = getEffectiveProductForComponent(comp, products.get(comp.productId));
          if (!product) return null;
          return (
            <ComponentNode
              key={comp.id}
              component={comp}
              product={product}
              selected={comp.id === selectedComponentId}
              pendingFromTerminal={pendingConn?.fromTerminalId ?? null}
              busColors={busColors}
              onSelect={onSelectComponent}
              onDragStart={handleDragStart}
              onTerminalMouseDown={handleTerminalMouseDown}
            />
          );
        })}

        {(system.annotations ?? []).map((annotation) => (
          <TextAnnotationNode
            key={annotation.id}
            annotation={annotation}
            selected={annotation.id === selectedAnnotationId}
            onSelect={(id) => {
              onSelectAnnotation(id);
              onSelectComponent(null);
              onSelectConnection(null);
            }}
            onMove={onMoveAnnotation}
            onResize={onResizeAnnotation}
          />
        ))}
      </svg>
      <div
        className="canvas-scrollbar canvas-scrollbar-horizontal"
        onPointerDown={(e) => handleScrollTrackPointerDown('x', e)}
      >
        <div
          className="canvas-scrollbar-thumb"
          style={horizontalThumb}
          onPointerDown={(e) => handleScrollThumbPointerDown('x', e)}
          onPointerMove={handleScrollThumbPointerMove}
          onPointerUp={handleScrollThumbPointerUp}
          onPointerCancel={handleScrollThumbPointerUp}
        />
      </div>
      <div
        className="canvas-scrollbar canvas-scrollbar-vertical"
        onPointerDown={(e) => handleScrollTrackPointerDown('y', e)}
      >
        <div
          className="canvas-scrollbar-thumb"
          style={verticalThumb}
          onPointerDown={(e) => handleScrollThumbPointerDown('y', e)}
          onPointerMove={handleScrollThumbPointerMove}
          onPointerUp={handleScrollThumbPointerUp}
          onPointerCancel={handleScrollThumbPointerUp}
        />
      </div>
    </div>
  );
}
