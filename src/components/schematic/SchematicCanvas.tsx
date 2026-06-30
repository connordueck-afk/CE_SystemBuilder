import { memo, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import type { SystemDesign, SystemComponent, Product } from '../../types/system';
import { ComponentNode } from './ComponentNode';
import { ConnectionLayer } from './ConnectionLayer';
import { TerminalLayer } from './TerminalLayer';
import { TextAnnotationNode } from './TextAnnotationNode';
import { ShapeAnnotationNode } from './ShapeAnnotationNode';
import { getEffectiveTerminal, getEffectiveTerminals } from '../../utils/effectiveTerminals';
import { getEffectiveProductForComponent } from '../../utils/solarCalculations';
import type { ProtectionRecommendation } from '../../utils/protectionRecommendations';
import type { BusColorMap } from '../../utils/busColors';
import type { PathMarker } from '../../utils/connectionGeometry';
import { isVerticalOrientation, transformOrientationOffset } from '../../utils/componentOrientation';
import { clampComponentScale, componentScale, scaledProductSize, scaledTerminalOffset } from '../../utils/componentScale';
import { validateSystemConnection } from '../../utils/connectionRules';
import { isTerminalFull } from '../../utils/connectorLimits';

interface DragState {
  componentId: string;
  startMouseX: number;
  startMouseY: number;
  startCompX: number;
  startCompY: number;
  companions?: { id: string; startX: number; startY: number }[];
}

interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface PendingConn {
  fromComponentId: string;
  fromTerminalId: string;
  startX: number;
  startY: number;
}

interface FusePrompt {
  connectionId: string;
  recommendation: ProtectionRecommendation;
  marker: PathMarker;
}

interface ScaleDragState {
  componentId: string;
  startDist: number;
  startScale: number;
}

interface ComponentMovePreview {
  id: string;
  x: number;
  y: number;
}

interface ComponentScalePreview {
  id: string;
  imageScale: number;
}

interface ConnectionRoutePreview {
  connectionId: string;
  routePoints: Array<{ x: number; y: number }>;
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

interface ComponentContextMenuState {
  componentId: string;
  x: number;
  y: number;
}

interface CanvasContextMenuState {
  x: number;
  y: number;
}

interface ComponentLayerProps {
  components: SystemComponent[];
  products: Map<string, Product>;
  selectedComponentId: string | null;
  selectedComponentIds: string[];
  onSelect: (id: string) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onContextMenu: (id: string, e: React.MouseEvent) => void;
  onScaleHandleMouseDown: (id: string, e: React.MouseEvent) => void;
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
  focusedConnectionId: string | null;
  focusConnectionRequestId: number;
  cancelInteractionRequestId: number;
  onViewportCenterChange: (center: { x: number; y: number }) => void;
  onSelectComponent: (id: string | null) => void;
  onSelectConnection: (id: string | null) => void;
  onSelectAnnotation: (id: string | null) => void;
  onMoveComponent: (id: string, x: number, y: number) => void;
  onMoveAnnotation: (id: string, x: number, y: number) => void;
  onResizeAnnotation: (id: string, width: number, height: number) => void;
  onUndo: () => void;
  onPasteComponent: () => void;
  onCopyComponent: (id: string) => void;
  onCutComponent: (id: string) => void;
  onRotateComponent: (id: string) => void;
  onToggleComponentLock: (id: string) => void;
  onRemoveComponent: (id: string) => void;
  onRemoveConnection: (id: string) => void;
  onRemoveAnnotation: (id: string) => void;
  onMoveConnectionRoute: (id: string, routePoints: Array<{ x: number; y: number }>) => void;
  onInsertProtection: (recommendation: ProtectionRecommendation, marker: PathMarker) => void;
  onEnterFullView: () => void;
  onScaleComponent: (id: string, scale: number) => void;
  onAddConnection: (
    fromComp: string,
    fromTerm: string,
    toComp: string,
    toTerm: string
  ) => void;
  selectedComponentIds: string[];
  onSelectMultipleComponents: (ids: string[]) => void;
  onClearMultiSelect: () => void;
  onMoveComponents: (moves: { id: string; x: number; y: number }[]) => void;
  onCopyMultiple: (ids: string[]) => void;
  onCutMultiple: (ids: string[]) => void;
  onRemoveMultiple: (ids: string[]) => void;
  onAutoRouteAll: () => void;
}

const VIEW_W = 1200;
const VIEW_H = 760;
const WORLD_X = -10000;
const WORLD_Y = -10000;
const WORLD_W = 30000;
const WORLD_H = 30000;
const GRID = 20;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.2;
const TRACKPAD_ZOOM_SENSITIVITY = 0.004;
const FIT_PADDING = 80;
const EDGE_SCROLL_ZONE = 80; // screen px from canvas edge to trigger auto-scroll
const EDGE_SCROLL_MAX = 10;  // screen px per frame at maximum scroll speed

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

function clampComponentToWorld(
  point: { x: number; y: number },
  product: Product,
  rotationDeg = 0,
  scale = 1
): { x: number; y: number } {
  const { halfWidth, halfHeight } = componentFootprint(product, rotationDeg, scale);
  return {
    x: Math.min(WORLD_X + WORLD_W - halfWidth, Math.max(WORLD_X + halfWidth, point.x)),
    y: Math.min(WORLD_Y + WORLD_H - halfHeight, Math.max(WORLD_Y + halfHeight, point.y)),
  };
}

function sameComponentMovePreview(a: ComponentMovePreview[] | null, b: ComponentMovePreview[] | null): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    const left = a[index];
    const right = b[index];
    if (left.id !== right.id || left.x !== right.x || left.y !== right.y) return false;
  }
  return true;
}

function sameComponentScalePreview(a: ComponentScalePreview | null, b: ComponentScalePreview | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.id === b.id && a.imageScale === b.imageScale;
}

function diagramBounds(system: SystemDesign, products: Map<string, Product>) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const component of system.components) {
    const product = getEffectiveProductForComponent(component, products.get(component.productId));
    if (!product) continue;
    const footprint = componentFootprint(product, component.rotationDeg, componentScale(component));
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
  const scaledOffset = scaledTerminalOffset(comp, terminal);
  return transformOrientationOffset(comp.rotationDeg, scaledOffset.offsetX, scaledOffset.offsetY);
}

function MenuIcon({
  name,
}: {
  name: 'undo' | 'paste' | 'fit' | 'copy' | 'cut' | 'delete' | 'rotate' | 'lock' | 'unlock';
}) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <svg className="canvas-context-menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      {name === 'undo' && (
        <>
          <path d="M 9 7 L 4 12 L 9 17" {...common} />
          <path d="M 5 12 L 15 12 C 18 12 20 14 20 17 C 20 18.5 19.4 19.7 18.4 20.6" {...common} />
        </>
      )}
      {name === 'paste' && (
        <>
          <path d="M 9 4 L 15 4 L 15 7 L 9 7 Z" {...common} />
          <path d="M 7 6 L 5 6 L 5 21 L 19 21 L 19 6 L 17 6" {...common} />
          <path d="M 8 12 L 16 12 M 8 16 L 14 16" {...common} />
        </>
      )}
      {name === 'fit' && (
        <>
          <path d="M 4 9 L 4 4 L 9 4 M 15 4 L 20 4 L 20 9 M 20 15 L 20 20 L 15 20 M 9 20 L 4 20 L 4 15" {...common} />
          <path d="M 9 9 L 15 15 M 15 9 L 9 15" {...common} />
        </>
      )}
      {name === 'copy' && (
        <>
          <rect x="8" y="8" width="10" height="10" rx="2" {...common} />
          <path d="M 6 14 L 5 14 C 4 14 3 13 3 12 L 3 5 C 3 4 4 3 5 3 L 12 3 C 13 3 14 4 14 5 L 14 6" {...common} />
        </>
      )}
      {name === 'cut' && (
        <>
          <circle cx="6" cy="6" r="2" {...common} />
          <circle cx="6" cy="18" r="2" {...common} />
          <path d="M 8 8 L 19 19 M 8 16 L 19 5" {...common} />
        </>
      )}
      {name === 'delete' && (
        <>
          <path d="M 4 7 L 20 7 M 10 11 L 10 17 M 14 11 L 14 17" {...common} />
          <path d="M 9 7 L 9 5 L 15 5 L 15 7 M 6 7 L 7 21 L 17 21 L 18 7" {...common} />
        </>
      )}
      {name === 'rotate' && (
        <>
          <path d="M 20 12 A 8 8 0 1 1 17.7 6.4" {...common} />
          <path d="M 18 3 L 18 7 L 22 7" {...common} />
        </>
      )}
      {name === 'lock' && (
        <>
          <rect x="5" y="10" width="14" height="10" rx="2" {...common} />
          <path d="M 8 10 L 8 7 A 4 4 0 0 1 16 7 L 16 10" {...common} />
        </>
      )}
      {name === 'unlock' && (
        <>
          <rect x="5" y="10" width="14" height="10" rx="2" {...common} />
          <path d="M 8 10 L 8 7 A 4 4 0 0 1 15 4.4" {...common} />
        </>
      )}
    </svg>
  );
}

const ComponentLayer = memo(function ComponentLayer({
  components,
  products,
  selectedComponentId,
  selectedComponentIds,
  onSelect,
  onDragStart,
  onContextMenu,
  onScaleHandleMouseDown,
}: ComponentLayerProps) {
  return (
    <>
      {components.map((comp) => {
        const product = getEffectiveProductForComponent(comp, products.get(comp.productId));
        if (!product) return null;
        return (
          <ComponentNode
            key={comp.id}
            component={comp}
            product={product}
            selected={comp.id === selectedComponentId || selectedComponentIds.includes(comp.id)}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onContextMenu={onContextMenu}
            onScaleHandleMouseDown={onScaleHandleMouseDown}
          />
        );
      })}
    </>
  );
});

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
  focusedConnectionId,
  focusConnectionRequestId,
  cancelInteractionRequestId,
  onViewportCenterChange,
  onSelectComponent,
  onSelectConnection,
  onSelectAnnotation,
  onMoveComponent,
  onMoveAnnotation,
  onResizeAnnotation,
  onUndo,
  onPasteComponent,
  onCopyComponent,
  onCutComponent,
  onRotateComponent,
  onToggleComponentLock,
  onRemoveComponent,
  onRemoveConnection,
  onRemoveAnnotation,
  onMoveConnectionRoute,
  onInsertProtection,
  onEnterFullView,
  onScaleComponent,
  onAddConnection,
  selectedComponentIds,
  onSelectMultipleComponents,
  onClearMultiSelect,
  onMoveComponents,
  onCopyMultiple,
  onCutMultiple,
  onRemoveMultiple,
  onAutoRouteAll,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [scaleDragging, setScaleDragging] = useState<ScaleDragState | null>(null);
  const [pendingConn, setPendingConn] = useState<PendingConn | null>(null);
  const [panning, setPanning] = useState<PanState | null>(null);
  const [scrollDragging, setScrollDragging] = useState<ScrollDragState | null>(null);
  const [fusePrompt, setFusePrompt] = useState<FusePrompt | null>(null);
  const [componentContextMenu, setComponentContextMenu] = useState<ComponentContextMenuState | null>(null);
  const [canvasContextMenu, setCanvasContextMenu] = useState<CanvasContextMenuState | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [viewportCenter, setViewportCenter] = useState({ x: VIEW_W / 2, y: VIEW_H / 2 });
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: VIEW_W, height: VIEW_H });
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [showAutoRouteDialog, setShowAutoRouteDialog] = useState(false);
  const [componentMovePreview, setComponentMovePreview] = useState<ComponentMovePreview[] | null>(null);
  const [componentScalePreview, setComponentScalePreview] = useState<ComponentScalePreview | null>(null);
  const [connectionRoutePreview, setConnectionRoutePreview] = useState<ConnectionRoutePreview | null>(null);
  const isBoxSelectRef = useRef(false);
  const didPanRef = useRef(false);
  const didBoxSelectRef = useRef(false);
  const handledFocusRequestIdRef = useRef(0);
  const handledFocusConnectionRequestIdRef = useRef(0);
  const handledCancelInteractionRequestIdRef = useRef(0);
  const mouseClientRef = useRef<{ x: number; y: number } | null>(null);
  const autoScrollRafRef = useRef<number | null>(null);
  const componentMovePreviewRef = useRef<ComponentMovePreview[] | null>(null);
  const componentMovePreviewRafRef = useRef<number | null>(null);
  const pendingComponentMovePreviewRef = useRef<ComponentMovePreview[] | null>(null);
  const componentScalePreviewRef = useRef<ComponentScalePreview | null>(null);
  const componentScalePreviewRafRef = useRef<number | null>(null);
  const pendingComponentScalePreviewRef = useRef<ComponentScalePreview | null>(null);
  const connectionRoutePreviewRef = useRef<ConnectionRoutePreview | null>(null);
  const zoomRef = useRef(zoom);
  const canvasSizeRef = useRef(canvasSize);
  zoomRef.current = zoom;
  canvasSizeRef.current = canvasSize;

  const viewport = viewportFor(viewportCenter, zoom, canvasSize);

  const applyComponentMovePreview = useCallback((preview: ComponentMovePreview[] | null) => {
    componentMovePreviewRef.current = preview;
    setComponentMovePreview(preview);
  }, []);

  const scheduleComponentMovePreview = useCallback((preview: ComponentMovePreview[] | null) => {
    const current = pendingComponentMovePreviewRef.current ?? componentMovePreviewRef.current;
    if (sameComponentMovePreview(current, preview)) return;
    pendingComponentMovePreviewRef.current = preview;
    componentMovePreviewRef.current = preview;
    if (componentMovePreviewRafRef.current !== null) return;
    componentMovePreviewRafRef.current = requestAnimationFrame(() => {
      componentMovePreviewRafRef.current = null;
      const next = pendingComponentMovePreviewRef.current;
      pendingComponentMovePreviewRef.current = null;
      setComponentMovePreview(next);
    });
  }, []);

  const clearComponentMovePreview = useCallback(() => {
    pendingComponentMovePreviewRef.current = null;
    if (componentMovePreviewRafRef.current !== null) {
      cancelAnimationFrame(componentMovePreviewRafRef.current);
      componentMovePreviewRafRef.current = null;
    }
    applyComponentMovePreview(null);
  }, [applyComponentMovePreview]);

  const applyComponentScalePreview = useCallback((preview: ComponentScalePreview | null) => {
    componentScalePreviewRef.current = preview;
    setComponentScalePreview(preview);
  }, []);

  const scheduleComponentScalePreview = useCallback((preview: ComponentScalePreview | null) => {
    const current = pendingComponentScalePreviewRef.current ?? componentScalePreviewRef.current;
    if (sameComponentScalePreview(current, preview)) return;
    pendingComponentScalePreviewRef.current = preview;
    componentScalePreviewRef.current = preview;
    if (componentScalePreviewRafRef.current !== null) return;
    componentScalePreviewRafRef.current = requestAnimationFrame(() => {
      componentScalePreviewRafRef.current = null;
      const next = pendingComponentScalePreviewRef.current;
      pendingComponentScalePreviewRef.current = null;
      setComponentScalePreview(next);
    });
  }, []);

  const clearComponentScalePreview = useCallback(() => {
    pendingComponentScalePreviewRef.current = null;
    if (componentScalePreviewRafRef.current !== null) {
      cancelAnimationFrame(componentScalePreviewRafRef.current);
      componentScalePreviewRafRef.current = null;
    }
    applyComponentScalePreview(null);
  }, [applyComponentScalePreview]);

  const handlePreviewConnectionRoute = useCallback((connectionId: string, routePoints: Array<{ x: number; y: number }>) => {
    const current = connectionRoutePreviewRef.current;
    if (
      current?.connectionId === connectionId &&
      current.routePoints.length === routePoints.length &&
      current.routePoints.every((point, index) => point.x === routePoints[index].x && point.y === routePoints[index].y)
    ) {
      return;
    }

    const preview = { connectionId, routePoints };
    connectionRoutePreviewRef.current = preview;
    setConnectionRoutePreview(preview);
  }, []);

  const handleCommitConnectionRoute = useCallback((connectionId: string) => {
    const preview = connectionRoutePreviewRef.current;
    if (preview?.connectionId === connectionId) {
      onMoveConnectionRoute(connectionId, preview.routePoints);
    }
    connectionRoutePreviewRef.current = null;
    setConnectionRoutePreview(null);
  }, [onMoveConnectionRoute]);

  const handleCancelConnectionRoutePreview = useCallback(() => {
    connectionRoutePreviewRef.current = null;
    setConnectionRoutePreview(null);
  }, []);

  const displayComponents = useMemo(() => {
    if (!componentMovePreview && !componentScalePreview) return system.components;
    const moveMap = componentMovePreview
      ? new Map(componentMovePreview.map((preview) => [preview.id, preview]))
      : null;

    return system.components.map((component) => {
      const move = moveMap?.get(component.id);
      const scale = componentScalePreview?.id === component.id ? componentScalePreview.imageScale : undefined;
      if (!move && scale == null) return component;
      return {
        ...component,
        ...(move ? { x: move.x, y: move.y } : {}),
        ...(scale != null ? { imageScale: scale } : {}),
      };
    });
  }, [componentMovePreview, componentScalePreview, system.components]);

  const displayConnections = useMemo(() => {
    if (!connectionRoutePreview) return system.connections;
    return system.connections.map((connection) =>
      connection.id === connectionRoutePreview.connectionId
        ? { ...connection, routePoints: connectionRoutePreview.routePoints, routeMode: 'manual' as const }
        : connection
    );
  }, [connectionRoutePreview, system.connections]);

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
    if (focusRequestId === handledFocusRequestIdRef.current) return;
    const component = system.components.find((c) => c.id === focusedComponentId);
    if (!component) return;
    handledFocusRequestIdRef.current = focusRequestId;
    setViewportCenter(clampCenter({ x: component.x, y: component.y }, zoom, canvasSize));
  }, [canvasSize, focusRequestId, focusedComponentId, system.components, zoom]);

  useEffect(() => {
    if (!focusedConnectionId) return;
    if (focusConnectionRequestId === handledFocusConnectionRequestIdRef.current) return;
    const connection = system.connections.find((c) => c.id === focusedConnectionId);
    if (!connection) return;
    const fromComp = system.components.find((c) => c.id === connection.fromComponentId);
    const toComp = system.components.find((c) => c.id === connection.toComponentId);
    if (!fromComp || !toComp) return;
    handledFocusConnectionRequestIdRef.current = focusConnectionRequestId;
    setViewportCenter(clampCenter({
      x: (fromComp.x + toComp.x) / 2,
      y: (fromComp.y + toComp.y) / 2,
    }, zoom, canvasSize));
  }, [canvasSize, focusConnectionRequestId, focusedConnectionId, system.connections, system.components, zoom]);

  useEffect(() => {
    if (!dragging && !panning && !scrollDragging && !scaleDragging && !selectionBox) return;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    window.getSelection()?.removeAllRanges();

    return () => {
      document.body.style.userSelect = previousUserSelect;
      window.getSelection()?.removeAllRanges();
    };
  }, [dragging, panning, scaleDragging, scrollDragging, selectionBox]);

  useEffect(() => {
    if (fusePrompt && selectedConnectionId !== fusePrompt.connectionId) {
      setFusePrompt(null);
    }
  }, [fusePrompt, selectedConnectionId]);

  useEffect(() => {
    if (cancelInteractionRequestId === handledCancelInteractionRequestIdRef.current) return;
    handledCancelInteractionRequestIdRef.current = cancelInteractionRequestId;
    setPendingConn(null);
    setFusePrompt(null);
    setDragging(null);
    setScaleDragging(null);
    setPanning(null);
    setScrollDragging(null);
    setSelectionBox(null);
    clearComponentMovePreview();
    clearComponentScalePreview();
    handleCancelConnectionRoutePreview();
    setComponentContextMenu(null);
    setCanvasContextMenu(null);
    isBoxSelectRef.current = false;
    didPanRef.current = false;
    didBoxSelectRef.current = false;
  }, [cancelInteractionRequestId, clearComponentMovePreview, clearComponentScalePreview, handleCancelConnectionRoutePreview]);

  useEffect(() => {
    return () => {
      if (componentMovePreviewRafRef.current !== null) {
        cancelAnimationFrame(componentMovePreviewRafRef.current);
      }
      if (componentScalePreviewRafRef.current !== null) {
        cancelAnimationFrame(componentScalePreviewRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!componentContextMenu && !canvasContextMenu) return;

    function closeMenu() {
      setComponentContextMenu(null);
      setCanvasContextMenu(null);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu();
    }

    window.addEventListener('pointerdown', closeMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', closeMenu);
    return () => {
      window.removeEventListener('pointerdown', closeMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', closeMenu);
    };
  }, [canvasContextMenu, componentContextMenu]);

  useEffect(() => {
    if (!dragging) return;

    const tick = () => {
      autoScrollRafRef.current = requestAnimationFrame(tick);
      const canvas = canvasRef.current;
      const mouse = mouseClientRef.current;
      if (!canvas || !mouse) return;

      const rect = canvas.getBoundingClientRect();
      const z = zoomRef.current;
      const cs = canvasSizeRef.current;

      let px = 0;
      let py = 0;
      const dl = mouse.x - rect.left;
      const dr = rect.right - mouse.x;
      const dt = mouse.y - rect.top;
      const db = rect.bottom - mouse.y;

      if (dl >= 0 && dl < EDGE_SCROLL_ZONE) px = -EDGE_SCROLL_MAX * (1 - dl / EDGE_SCROLL_ZONE);
      else if (dr >= 0 && dr < EDGE_SCROLL_ZONE) px = EDGE_SCROLL_MAX * (1 - dr / EDGE_SCROLL_ZONE);
      if (dt >= 0 && dt < EDGE_SCROLL_ZONE) py = -EDGE_SCROLL_MAX * (1 - dt / EDGE_SCROLL_ZONE);
      else if (db >= 0 && db < EDGE_SCROLL_ZONE) py = EDGE_SCROLL_MAX * (1 - db / EDGE_SCROLL_ZONE);

      if (px === 0 && py === 0) return;

      setViewportCenter((center) =>
        clampCenter({ x: center.x + px / z, y: center.y + py / z }, z, cs)
      );
    };

    autoScrollRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (autoScrollRafRef.current !== null) {
        cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = null;
      }
    };
  }, [dragging]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable) return;
      if (e.key === 'Delete') {
        if (selectedComponentIds.length > 0) {
          e.preventDefault();
          onRemoveMultiple(selectedComponentIds);
          return;
        }
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
  }, [onRemoveAnnotation, onRemoveComponent, onRemoveConnection, onRemoveMultiple, onRotateComponent, selectedAnnotationId, selectedComponentId, selectedComponentIds, selectedConnectionId]);

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
    e.preventDefault();
    const pos = svgCoords(e, svgRef.current);
    const comp = system.components.find((c) => c.id === componentId);
    if (!comp) return;
    if (comp.locked) {
      e.stopPropagation();
      onSelectComponent(componentId);
      setComponentContextMenu(null);
      setCanvasContextMenu(null);
      return;
    }
    e.stopPropagation();
    setFusePrompt(null);
    setComponentContextMenu(null);
    setCanvasContextMenu(null);
    clearComponentMovePreview();
    clearComponentScalePreview();

    const companions = selectedComponentIds.length > 1 && selectedComponentIds.includes(componentId)
      ? system.components
          .filter((c) => c.id !== componentId && selectedComponentIds.includes(c.id) && !c.locked)
          .map((c) => ({ id: c.id, startX: c.x, startY: c.y }))
      : undefined;

    setDragging({
      componentId,
      startMouseX: pos.x,
      startMouseY: pos.y,
      startCompX: comp.x,
      startCompY: comp.y,
      companions,
    });
  }, [clearComponentMovePreview, clearComponentScalePreview, onSelectComponent, selectedComponentIds, system.components, pendingConn]);

  const handleScaleDragStart = useCallback((componentId: string, e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const pos = svgCoords(e, svgRef.current);
    const comp = system.components.find((c) => c.id === componentId);
    if (!comp) return;
    const dx = pos.x - comp.x;
    const dy = pos.y - comp.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    setScaleDragging({
      componentId,
      startDist: Math.max(dist, 1),
      startScale: componentScale(comp),
    });
    clearComponentMovePreview();
  }, [clearComponentMovePreview, system.components]);

  const handleComponentContextMenu = useCallback((componentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFusePrompt(null);
    setPendingConn(null);
    setPanning(null);
    setDragging(null);
    clearComponentMovePreview();
    clearComponentScalePreview();
    setCanvasContextMenu(null);
    if (selectedComponentIds.length > 1 && selectedComponentIds.includes(componentId)) {
      // Keep multi-selection intact
      setComponentContextMenu({ componentId, x: e.clientX, y: e.clientY });
    } else {
      onClearMultiSelect();
      onSelectComponent(componentId);
      onSelectConnection(null);
      onSelectAnnotation(null);
      setComponentContextMenu({ componentId, x: e.clientX, y: e.clientY });
    }
  }, [clearComponentMovePreview, clearComponentScalePreview, onSelectAnnotation, onSelectComponent, onSelectConnection, onClearMultiSelect, selectedComponentIds]);

  const runComponentMenuAction = useCallback((action: (componentId: string) => void) => {
    const componentId = componentContextMenu?.componentId;
    if (!componentId) return;
    action(componentId);
    setComponentContextMenu(null);
  }, [componentContextMenu]);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as Element;
    if (target !== e.currentTarget && target.getAttribute('data-canvas-bg') !== 'true') return;

    e.preventDefault();
    e.stopPropagation();
    setFusePrompt(null);
    setPendingConn(null);
    setPanning(null);
    setDragging(null);
    clearComponentMovePreview();
    clearComponentScalePreview();
    setComponentContextMenu(null);
    onSelectComponent(null);
    onSelectConnection(null);
    onSelectAnnotation(null);
    setCanvasContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  }, [clearComponentMovePreview, clearComponentScalePreview, onSelectAnnotation, onSelectComponent, onSelectConnection]);

  const runCanvasMenuAction = useCallback((action: () => void) => {
    action();
    setCanvasContextMenu(null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return;
    mouseClientRef.current = { x: e.clientX, y: e.clientY };
    const pos = svgCoords(e, svgRef.current);
    if (pendingConn) setMousePos(pos);

    if (isBoxSelectRef.current) {
      setSelectionBox((prev) => prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null);
      return;
    }

    if (dragging) {
      const dx = pos.x - dragging.startMouseX;
      const dy = pos.y - dragging.startMouseY;
      const comp = system.components.find((c) => c.id === dragging.componentId);
      const product = comp ? products.get(comp.productId) : undefined;
      if (!comp || !product) return;
      const nextPos = clampComponentToWorld({
        x: snapToGrid(dragging.startCompX + dx),
        y: snapToGrid(dragging.startCompY + dy),
      }, product, comp.rotationDeg, componentScale(comp));
      if (dragging.companions && dragging.companions.length > 0) {
        scheduleComponentMovePreview([
          { id: dragging.componentId, x: nextPos.x, y: nextPos.y },
          ...dragging.companions.map((c) => ({
            id: c.id,
            x: snapToGrid(c.startX + dx),
            y: snapToGrid(c.startY + dy),
          })),
        ]);
      } else {
        scheduleComponentMovePreview([{ id: dragging.componentId, x: nextPos.x, y: nextPos.y }]);
      }
    }

    if (scaleDragging) {
      const comp = system.components.find((c) => c.id === scaleDragging.componentId);
      const product = comp ? products.get(comp.productId) : undefined;
      if (comp && product) {
        const dx = pos.x - comp.x;
        const dy = pos.y - comp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const newScale = clampComponentScale(scaleDragging.startScale * dist / scaleDragging.startDist);
        const bounded = clampComponentToWorld({ x: comp.x, y: comp.y }, product, comp.rotationDeg, newScale);
        scheduleComponentScalePreview({ id: scaleDragging.componentId, imageScale: newScale });
        if (bounded.x !== comp.x || bounded.y !== comp.y) {
          scheduleComponentMovePreview([{ id: scaleDragging.componentId, x: bounded.x, y: bounded.y }]);
        } else {
          clearComponentMovePreview();
        }
      }
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
  }, [canvasSize, clearComponentMovePreview, dragging, panning, pendingConn, products, scaleDragging, scheduleComponentMovePreview, scheduleComponentScalePreview, system.components, zoom]);

  const handleMouseUp = useCallback(() => {
    if (selectionBox) {
      const minX = Math.min(selectionBox.startX, selectionBox.currentX);
      const maxX = Math.max(selectionBox.startX, selectionBox.currentX);
      const minY = Math.min(selectionBox.startY, selectionBox.currentY);
      const maxY = Math.max(selectionBox.startY, selectionBox.currentY);
      if (maxX - minX > 4 && maxY - minY > 4) {
        const ids = system.components
          .filter((c) => c.x >= minX && c.x <= maxX && c.y >= minY && c.y <= maxY)
          .map((c) => c.id);
        if (ids.length > 0) {
          onSelectMultipleComponents(ids);
          didBoxSelectRef.current = true;
        }
      }
      isBoxSelectRef.current = false;
      setSelectionBox(null);
    }
    if (dragging) {
      const preview = componentMovePreviewRef.current;
      if (preview && preview.length > 0) {
        if (preview.length > 1) {
          onMoveComponents(preview);
        } else {
          const move = preview[0];
          onMoveComponent(move.id, move.x, move.y);
        }
      }
      clearComponentMovePreview();
    }
    if (scaleDragging) {
      const preview = componentScalePreviewRef.current;
      if (preview?.id === scaleDragging.componentId) {
        onScaleComponent(preview.id, preview.imageScale);
      }
      clearComponentScalePreview();
      clearComponentMovePreview();
    }
    setDragging(null);
    setScaleDragging(null);
    setPanning(null);
    setScrollDragging(null);
  }, [
    clearComponentMovePreview,
    clearComponentScalePreview,
    dragging,
    onMoveComponent,
    onMoveComponents,
    onScaleComponent,
    scaleDragging,
    selectionBox,
    system.components,
    onSelectMultipleComponents,
  ]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || pendingConn || e.button !== 0) return;
    const target = e.target as Element;
    if (target !== e.currentTarget && target.getAttribute('data-canvas-bg') !== 'true') return;
    e.preventDefault();
    if (e.shiftKey) {
      const pos = svgCoords(e, svgRef.current);
      isBoxSelectRef.current = true;
      setSelectionBox({ startX: pos.x, startY: pos.y, currentX: pos.x, currentY: pos.y });
      return;
    }
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

  const fullTerminals = useMemo<Set<string>>(() => {
    const full = new Set<string>();
    for (const comp of system.components) {
      const product = products.get(comp.productId);
      if (!product) continue;
      const effectiveProduct = getEffectiveProductForComponent(comp, product);
      if (!effectiveProduct) continue;
      const terminals = getEffectiveTerminals(effectiveProduct, comp);
      for (const term of terminals) {
        const commPort = effectiveProduct.communicationPorts?.find((p) => p.id === term.id);
        if (isTerminalFull(term, commPort, system.connections, comp.id)) {
          full.add(`${comp.id}:${term.id}`);
        }
      }
    }
    return full;
  }, [system.components, system.connections, products]);

  const validTargetTerminals = useMemo<Set<string> | null>(() => {
    if (!pendingConn) return null;
    const targets = new Set<string>();
    for (const comp of system.components) {
      const product = products.get(comp.productId);
      if (!product) continue;
      const effectiveProduct = getEffectiveProductForComponent(comp, product);
      if (!effectiveProduct) continue;
      const terminals = getEffectiveTerminals(effectiveProduct, comp);
      for (const term of terminals) {
        if (comp.id === pendingConn.fromComponentId && term.id === pendingConn.fromTerminalId) continue;
        const result = validateSystemConnection(
          {
            fromComponentId: pendingConn.fromComponentId,
            fromTerminalId: pendingConn.fromTerminalId,
            toComponentId: comp.id,
            toTerminalId: term.id,
          },
          system.components,
          products,
          system.connections
        );
        if (result.valid) targets.add(`${comp.id}:${term.id}`);
      }
    }
    return targets;
  }, [pendingConn, system.components, system.connections, products]);

  const pendingSourceKey = pendingConn
    ? `${pendingConn.fromComponentId}:${pendingConn.fromTerminalId}`
    : null;

  const pendingConnLabel = useMemo(() => {
    if (!pendingConn) return null;
    const comp = system.components.find((c) => c.id === pendingConn.fromComponentId);
    const prod = comp ? products.get(comp.productId) : undefined;
    if (!comp || !prod) return null;
    const terminal = getEffectiveTerminal(prod, pendingConn.fromTerminalId, comp);
    const compLabel = comp.label ?? prod.name;
    const termLabel = terminal?.label ?? pendingConn.fromTerminalId;
    return `${compLabel} — ${termLabel}`;
  }, [pendingConn, system.components, products]);

  const handleTerminalMouseDown = useCallback((compId: string, termId: string, e: React.MouseEvent) => {
    if (!svgRef.current) return;
    e.stopPropagation();
    setFusePrompt(null);
    const pos = svgCoords(e, svgRef.current);

    if (pendingConn) {
      const isSelf = pendingConn.fromComponentId === compId && pendingConn.fromTerminalId === termId;
      if (!isSelf && validTargetTerminals?.has(`${compId}:${termId}`)) {
        onAddConnection(pendingConn.fromComponentId, pendingConn.fromTerminalId, compId, termId);
      }
      setPendingConn(null);
    } else {
      // Don't start a new connection from a terminal that's already at capacity
      if (fullTerminals.has(`${compId}:${termId}`)) return;
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
  }, [pendingConn, validTargetTerminals, fullTerminals, onAddConnection, system.components, products]);

  const handleCanvasClick = useCallback(() => {
    setComponentContextMenu(null);
    setCanvasContextMenu(null);
    if (didPanRef.current) {
      didPanRef.current = false;
      return;
    }
    if (didBoxSelectRef.current) {
      didBoxSelectRef.current = false;
      return;
    }
    if (pendingConn) {
      setPendingConn(null);
      setFusePrompt(null);
      return;
    }
    setFusePrompt(null);
    onClearMultiSelect();
    onSelectComponent(null);
    onSelectConnection(null);
    onSelectAnnotation(null);
  }, [pendingConn, onSelectAnnotation, onSelectComponent, onSelectConnection, onClearMultiSelect]);

  const handleComponentNodeSelect = useCallback((id: string) => {
    setFusePrompt(null);
    onSelectComponent(id);
  }, [onSelectComponent]);

  const handleConnectionSelect = useCallback((id: string) => {
    setFusePrompt(null);
    onSelectConnection(id);
    onSelectComponent(null);
  }, [onSelectComponent, onSelectConnection]);

  const handleShowProtectionPrompt = useCallback((connectionId: string, recommendation: ProtectionRecommendation, marker: PathMarker) => {
    setFusePrompt({ connectionId, recommendation, marker });
  }, []);

  const handleClearProtectionPrompt = useCallback(() => {
    setFusePrompt(null);
  }, []);

  const handleAnnotationSelect = useCallback((id: string) => {
    setFusePrompt(null);
    onSelectAnnotation(id);
    onSelectComponent(null);
    onSelectConnection(null);
  }, [onSelectAnnotation, onSelectComponent, onSelectConnection]);

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
  const menuComponent = componentContextMenu
    ? system.components.find((component) => component.id === componentContextMenu.componentId)
    : undefined;

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
        <button type="button" className="canvas-zoom-btn canvas-full-btn" onClick={onEnterFullView} title="Collapse side panels">
          Full
        </button>
        <button
          type="button"
          className="canvas-zoom-btn"
          onClick={() => setShowAutoRouteDialog(true)}
          title="Auto-route all connections"
          style={{ marginLeft: 8, fontSize: 12, padding: '3px 10px' }}
        >
          Auto-Route
        </button>
      </div>
      {pendingConn && (
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          background: '#eaf4ff', color: '#1769d2', padding: '6px 14px',
          borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 10, pointerEvents: 'none',
          border: '1px solid #cfe1f8',
          boxShadow: '0 8px 20px rgb(30 45 70 / 8%)',
          whiteSpace: 'nowrap',
        }}>
          {pendingConnLabel && (
            <span style={{ marginRight: 10, color: '#0f4fa8' }}>{pendingConnLabel}</span>
          )}
          <span style={{ fontWeight: 500, color: '#3d6baa' }}>
            Click a terminal to connect · Esc or click canvas to cancel
          </span>
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        style={{ display: 'block', cursor: pendingConn || selectionBox ? 'crosshair' : scaleDragging ? 'nwse-resize' : dragging || panning ? 'grabbing' : 'grab' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
      >
        {/* Grid dots */}
        <defs>
          <pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
            <circle cx={GRID / 2} cy={GRID / 2} r={0.75} fill="var(--canvas-grid)" />
          </pattern>
        </defs>
        <rect data-canvas-bg="true" x={WORLD_X} y={WORLD_Y} width={WORLD_W} height={WORLD_H} fill="var(--canvas)" />
        <rect data-canvas-bg="true" x={WORLD_X} y={WORLD_Y} width={WORLD_W} height={WORLD_H} fill="url(#grid)" />

        {/* Components */}
        <ComponentLayer
          components={displayComponents}
          products={products}
          selectedComponentId={selectedComponentId}
          selectedComponentIds={selectedComponentIds}
          onSelect={handleComponentNodeSelect}
          onDragStart={handleDragStart}
          onContextMenu={handleComponentContextMenu}
          onScaleHandleMouseDown={handleScaleDragStart}
        />

        {/* Visible connections above product images */}
        <ConnectionLayer
          connections={displayConnections}
          components={displayComponents}
          products={products}
          selectedConnectionId={selectedConnectionId}
          protectionRecommendations={protectionRecommendations}
          busColors={busColors}
          onSelectConnection={handleConnectionSelect}
          onShowProtectionPrompt={handleShowProtectionPrompt}
          onClearProtectionPrompt={handleClearProtectionPrompt}
          onPreviewConnectionRoute={handlePreviewConnectionRoute}
          onCommitConnectionRoute={handleCommitConnectionRoute}
          onCancelConnectionRoutePreview={handleCancelConnectionRoutePreview}
          pendingLine={pendingLine}
          layer="visual"
        />

        {(system.annotations ?? []).map((annotation) => {
          const commonProps = {
            key: annotation.id,
            selected: annotation.id === selectedAnnotationId,
            onSelect: handleAnnotationSelect,
            onMove: onMoveAnnotation,
            onResize: onResizeAnnotation,
          };

          return annotation.kind === 'shape'
            ? <ShapeAnnotationNode {...commonProps} annotation={annotation} />
            : <TextAnnotationNode {...commonProps} annotation={annotation} />;
        })}

        {/* Connection hit areas — topmost layer so cables are selectable/draggable over product images */}
        <ConnectionLayer
          connections={displayConnections}
          components={displayComponents}
          products={products}
          selectedConnectionId={selectedConnectionId}
          protectionRecommendations={protectionRecommendations}
          busColors={busColors}
          onSelectConnection={handleConnectionSelect}
          onShowProtectionPrompt={handleShowProtectionPrompt}
          onClearProtectionPrompt={handleClearProtectionPrompt}
          onPreviewConnectionRoute={handlePreviewConnectionRoute}
          onCommitConnectionRoute={handleCommitConnectionRoute}
          onCancelConnectionRoutePreview={handleCancelConnectionRoutePreview}
          pendingLine={pendingLine}
          layer="interactive"
        />

        {/* Connection nodes — topmost, above the cable hit areas, so terminals
            stay clickable when starting or completing a connection. */}
        <TerminalLayer
          components={displayComponents}
          products={products}
          pendingSourceKey={pendingSourceKey}
          validTargetTerminals={validTargetTerminals}
          fullTerminals={fullTerminals}
          busColors={busColors}
          onTerminalMouseDown={handleTerminalMouseDown}
        />

        {selectionBox && (
          <rect
            x={Math.min(selectionBox.startX, selectionBox.currentX)}
            y={Math.min(selectionBox.startY, selectionBox.currentY)}
            width={Math.abs(selectionBox.currentX - selectionBox.startX)}
            height={Math.abs(selectionBox.currentY - selectionBox.startY)}
            fill="rgba(23, 105, 210, 0.08)"
            stroke="#1769d2"
            strokeWidth={1 / zoom}
            strokeDasharray={`${4 / zoom} ${2 / zoom}`}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {fusePrompt && (() => {
          const label = (fusePrompt.recommendation.busType === 'ac_line' || fusePrompt.recommendation.busType === 'ac_line2') ? 'Add Breaker' : 'Add Fuse';

          return (
            <g
              transform={`translate(${fusePrompt.marker.point.x + 16} ${fusePrompt.marker.point.y + 14})`}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                onInsertProtection(fusePrompt.recommendation, fusePrompt.marker);
                setFusePrompt(null);
              }}
            >
              <title>{label}</title>
              <rect
                x={0}
                y={0}
                width={82}
                height={24}
                rx={6}
                fill="#1769d2"
                stroke="#1055ad"
                strokeWidth={1}
              />
              <text
                x={41}
                y={16}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={10}
                fontWeight={700}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {label}
              </text>
            </g>
          );
        })()}
      </svg>
      {componentContextMenu && menuComponent && (
        <div
          className="canvas-context-menu"
          style={{
            left: componentContextMenu.x,
            top: componentContextMenu.y,
          }}
          role="menu"
          aria-label="Component actions"
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {selectedComponentIds.length > 1 && selectedComponentIds.includes(componentContextMenu.componentId) ? (
            <>
              <button type="button" role="menuitem" onClick={() => { onCopyMultiple(selectedComponentIds); setComponentContextMenu(null); }}>
                <MenuIcon name="copy" />
                <span>Copy {selectedComponentIds.length} items</span>
              </button>
              <button type="button" role="menuitem" onClick={() => { onCutMultiple(selectedComponentIds); setComponentContextMenu(null); }}>
                <MenuIcon name="cut" />
                <span>Cut {selectedComponentIds.length} items</span>
              </button>
              <button type="button" role="menuitem" onClick={() => { onRemoveMultiple(selectedComponentIds); setComponentContextMenu(null); }}>
                <MenuIcon name="delete" />
                <span>Delete {selectedComponentIds.length} items</span>
              </button>
            </>
          ) : (
            <>
              <button type="button" role="menuitem" onClick={() => runComponentMenuAction(onCopyComponent)}>
                <MenuIcon name="copy" />
                <span>Copy</span>
              </button>
              <button type="button" role="menuitem" onClick={() => runComponentMenuAction(onCutComponent)}>
                <MenuIcon name="cut" />
                <span>Cut</span>
              </button>
              <button type="button" role="menuitem" onClick={() => runComponentMenuAction(onRemoveComponent)}>
                <MenuIcon name="delete" />
                <span>Delete</span>
              </button>
              <button type="button" role="menuitem" onClick={() => runComponentMenuAction(onRotateComponent)}>
                <MenuIcon name="rotate" />
                <span>Rotate</span>
              </button>
              <button type="button" role="menuitem" onClick={() => runComponentMenuAction(onToggleComponentLock)}>
                <MenuIcon name={menuComponent.locked ? 'unlock' : 'lock'} />
                <span>{menuComponent.locked ? 'Unlock' : 'Lock'}</span>
              </button>
            </>
          )}
        </div>
      )}
      {canvasContextMenu && (
        <div
          className="canvas-context-menu"
          style={{
            left: canvasContextMenu.x,
            top: canvasContextMenu.y,
          }}
          role="menu"
          aria-label="Canvas actions"
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button type="button" role="menuitem" onClick={() => runCanvasMenuAction(onUndo)}>
            <MenuIcon name="undo" />
            <span>Undo</span>
          </button>
          <button type="button" role="menuitem" onClick={() => runCanvasMenuAction(onPasteComponent)}>
            <MenuIcon name="paste" />
            <span>Paste</span>
          </button>
          <button type="button" role="menuitem" onClick={() => runCanvasMenuAction(fitDiagram)}>
            <MenuIcon name="fit" />
            <span>Fit</span>
          </button>
        </div>
      )}
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

      {showAutoRouteDialog && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onPointerDown={() => setShowAutoRouteDialog(false)}
        >
          <div
            style={{
              background: 'var(--bg-primary, #fff)', borderRadius: 12, padding: '28px 32px',
              maxWidth: 420, width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Auto-route all connections?</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-secondary, #555)', lineHeight: 1.5 }}>
              This will recalculate routes for all connections and may overwrite manually adjusted cable paths. Continue?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAutoRouteDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  onAutoRouteAll();
                  setShowAutoRouteDialog(false);
                }}
              >
                Auto-Route All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

