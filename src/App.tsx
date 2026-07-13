import { useState, useMemo, useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import type {
  FuseSlotState,
  SystemDesign,
  NominalVoltage,
  Product,
  SystemComponent,
  SystemConnection,
  CustomSolarArrayRatings,
  SystemTextAnnotation,
  SystemShapeAnnotation,
  ShapeAnnotationType,
} from './types/system';
import { ALL_PRODUCTS, getProduct } from './data/products';
import { DEFAULT_SYSTEM } from './data/defaultSystem';
import { DEFAULT_ASSUMPTIONS } from './data/electricalRules';
import { buildBom } from './utils/bomCalculations';
import { buildPriceSummary } from './utils/priceCalculations';
import { analyzeSystemDesign } from './utils/analysis';
import { validateSystemConnection } from './utils/connectionRules';
import { exportBomCsv } from './utils/csvExport';
import {
  createSystemSaveFile,
  loadCurrentSystem,
  loadSavedSystems,
  parseSystemSaveFile,
  saveCurrentSystem,
  systemSaveFilename,
} from './utils/storage';
import { buildShareUrl, decodeShareParam, getInitialShareParam } from './utils/shareUrl';
import { genId } from './utils/ids';
import { getEffectiveTerminal, isDynamicSingleConductorProduct } from './utils/effectiveTerminals';
import type { BusType } from './utils/electricalNetlist';
import type { ProtectionRecommendation } from './utils/protectionRecommendations';
import { inlineProtectionTerminalIds } from './utils/inlineProtection';
import { buildCableLengthSummary, buildCableBomRows, buildConnectorSummary } from './utils/cableSummary';
import { sharedBusLinkStandard } from './utils/busLinks';
import { DEFAULT_BUS_COLORS, type BusColorMap } from './utils/busColors';
import { isVerticalOrientation } from './utils/componentOrientation';
import { clampComponentScale, componentScale, scaledProductSize } from './utils/componentScale';
import { buildBuilderIssues } from './utils/builderIssues';
import { sanitizeSystemDesign } from './utils/systemSanitization';
import { resolvedDcVoltageDomains } from './utils/voltageDomains';
import { breakerCompatibility, breakerMediumForBusType, breakerPoles, breakerRatingProfiles } from './utils/breakerSemantics';
import { HeaderBar } from './components/layout/HeaderBar';
import { LeftPartSidebar } from './components/layout/LeftPartSidebar';
import { RightInspector } from './components/layout/RightInspector';
import { BomSummaryModal } from './components/layout/BomSummaryModal';
import { NewSystemModal } from './components/layout/NewSystemModal';
import { StartupModal } from './components/layout/StartupModal';
import { AppDialog, type AppDialogRequest } from './components/layout/AppDialog';
import { useModalAccessibility } from './components/layout/useModalAccessibility';
import { SchematicCanvas } from './components/schematic/SchematicCanvas';
import { InlineFuseInsertModal } from './components/parts/InlineFuseInsertModal';
import { FusePickerModal } from './components/parts/FusePickerModal';
import { PrintView } from './export/PrintView';
import {
  connectionPoints,
  getConnectionTerminalPos,
  splitPointsAtMarker,
  type PathMarker,
} from './utils/connectionGeometry';
import { autoRouteConnections, buildObstacles, routeConnection } from './utils/autoRouter';
import './styles/app.css';

const PRODUCT_MAP = new Map(ALL_PRODUCTS.map((p) => [p.id, p]));
const INITIAL_SHARE_PARAM = getInitialShareParam();
const CANVAS_WORLD_X = -10000;
const CANVAS_WORLD_Y = -10000;
const CANVAS_WORLD_W = 30000;
const CANVAS_WORLD_H = 30000;
const PLACEMENT_GRID = 20;
const PASTE_OFFSET = 40;
const HISTORY_LIMIT = 50;
const THEME_STORAGE_KEY = 'system-builder-theme';

type ThemeMode = 'light' | 'dark';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function loadThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

interface PendingProtectionInsert {
  recommendation: ProtectionRecommendation;
  marker: PathMarker;
}

function productFootprint(product: Product, rotationDeg = 0, scale = 1): { halfWidth: number; halfHeight: number } {
  const { width, height } = scaledProductSize(product, scale);
  const rotated = isVerticalOrientation(rotationDeg);
  const symbolWidth = rotated ? height : width;
  const symbolHeight = rotated ? width : height;

  return {
    halfWidth: symbolWidth / 2,
    halfHeight: Math.max(symbolHeight / 2, height / 2 + 22),
  };
}

function clampComponentPosition(
  x: number,
  y: number,
  product: Product,
  rotationDeg = 0,
  scale = 1
): { x: number; y: number } {
  const { halfWidth, halfHeight } = productFootprint(product, rotationDeg, scale);
  return {
    x: Math.min(CANVAS_WORLD_X + CANVAS_WORLD_W - halfWidth, Math.max(CANVAS_WORLD_X + halfWidth, x)),
    y: Math.min(CANVAS_WORLD_Y + CANVAS_WORLD_H - halfHeight, Math.max(CANVAS_WORLD_Y + halfHeight, y)),
  };
}

function snapPlacement(value: number): number {
  return Math.round(value / PLACEMENT_GRID) * PLACEMENT_GRID;
}

function numberedLabel(baseLabel: string, components: SystemComponent[]): string {
  const matcher = new RegExp(`^${baseLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s+(\\d+))?$`);
  const matchingNumbers: number[] = [];

  for (const component of components) {
    const match = component.label?.match(matcher);
    if (!match) continue;
    matchingNumbers.push(match[1] == null ? 1 : Number(match[1]));
  }

  if (matchingNumbers.length === 0) return baseLabel;
  return `${baseLabel} ${Math.max(...matchingNumbers) + 1}`;
}

function defaultComponentLabel(product: Product, components: SystemComponent[]): string {
  if (product.productType === 'fuse') return numberedLabel('Fuse', components);
  if (product.productType === 'breaker') {
    const compatibility = breakerCompatibility(product);
    return numberedLabel(compatibility === 'ac' ? 'AC Breaker' : compatibility === 'dc' ? 'DC Breaker' : 'AC/DC Breaker', components);
  }
  return product.name;
}

function normalizeCardinalRotation(value: number): 0 | 90 | 180 | 270 {
  const normalized = ((value % 360) + 360) % 360;
  if (normalized === 90 || normalized === 180 || normalized === 270) return normalized;
  return 0;
}

function routePointsFromSplit(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> | undefined {
  const routePoints = points.slice(1, -1);
  return routePoints.length > 0 ? routePoints : undefined;
}

function withTimestamp(system: SystemDesign): SystemDesign {
  return { ...system, updatedAt: new Date().toISOString() };
}

function withSingleComponentQuantities(system: SystemDesign): SystemDesign {
  return {
    ...system,
    components: system.components.map((component) => ({ ...component, quantity: 1 })),
  };
}

function normalizeSystem(system: SystemDesign): SystemDesign {
  return enrichConnections(withInferredConductors(sanitizeSystemDesign(withSingleComponentQuantities(system), PRODUCT_MAP)));
}

function withInferredConductors(system: SystemDesign): SystemDesign {
  let components = system.components.map((component) => {
    const product = PRODUCT_MAP.get(component.productId);
    if (!product || !isDynamicSingleConductorProduct(product)) return component;
    const {
      inferredElectricalType,
      inferredConnectionKind,
      inferredPolarity,
      inferredVoltageClass,
      ...baseComponent
    } = component;

    return {
      ...baseComponent,
      busPolarity: undefined,
    };
  });

  const componentById = () => new Map(components.map((component) => [component.id, component]));

  for (let pass = 0; pass < components.length; pass += 1) {
    let changed = false;
    const compMap = componentById();

    for (const connection of system.connections) {
      const endpoints = [
        {
          componentId: connection.fromComponentId,
          terminalId: connection.fromTerminalId,
          otherComponentId: connection.toComponentId,
          otherTerminalId: connection.toTerminalId,
        },
        {
          componentId: connection.toComponentId,
          terminalId: connection.toTerminalId,
          otherComponentId: connection.fromComponentId,
          otherTerminalId: connection.fromTerminalId,
        },
      ];

      for (const endpoint of endpoints) {
        const component = compMap.get(endpoint.componentId);
        const product = component ? PRODUCT_MAP.get(component.productId) : undefined;
        if (!component || !product || !isDynamicSingleConductorProduct(product)) continue;
        if (component.inferredConnectionKind && component.inferredPolarity) continue;

        const otherComponent = compMap.get(endpoint.otherComponentId);
        const otherProduct = otherComponent ? PRODUCT_MAP.get(otherComponent.productId) : undefined;
        const otherTerminal = otherComponent && otherProduct
          ? getEffectiveTerminal(otherProduct, endpoint.otherTerminalId, otherComponent)
          : undefined;
        if (
          !otherTerminal ||
          !['dc_power', 'pv_power', 'ac_power'].includes(otherTerminal.kind) ||
          !otherTerminal.polarity
        ) {
          continue;
        }

        components = components.map((item) => item.id === component.id
          ? {
              ...item,
              inferredElectricalType: otherTerminal.electricalType,
              inferredConnectionKind: otherTerminal.kind,
              inferredPolarity: otherTerminal.polarity,
              inferredVoltageClass: otherTerminal.voltageClass,
            }
          : item
        );
        changed = true;
      }
    }

    if (!changed) break;
  }

  return { ...system, components };
}

function enrichConnections(system: SystemDesign): SystemDesign {
  const analysis = analyzeSystemDesign(system, PRODUCT_MAP).legacy.circuitAnalysis;

  return {
    ...system,
    connections: system.connections.map((conn) => {
      const connectionAnalysis = analysis.connections.get(conn.id);
      if (!connectionAnalysis) return conn;

      // Bus links carry current but have no cable — keep bus type / current for display,
      // but clear all cable sizing so nothing tries to size or warn on a bolted link.
      if (conn.busLink) {
        return {
          ...conn,
          cableLengthFt: 0,
          busType: connectionAnalysis.busType,
          calculatedCurrentA: connectionAnalysis.designCurrentA,
          recommendedFuseA: undefined,
          recommendedCableAwg: undefined,
          voltageDropV: undefined,
          voltageDropPercent: undefined,
          warnings: connectionAnalysis.warnings,
          errors: connectionAnalysis.errors,
        };
      }

      return {
        ...conn,
        busType: connectionAnalysis.busType,
        calculatedCurrentA: connectionAnalysis.designCurrentA,
        recommendedFuseA: connectionAnalysis.recommendedFuseA,
        recommendedCableAwg: connectionAnalysis.recommendedCableAwg,
        voltageDropV: connectionAnalysis.voltageDropV,
        voltageDropPercent: connectionAnalysis.voltageDropPercent,
        warnings: connectionAnalysis.warnings,
        errors: connectionAnalysis.errors,
      };
    }),
  };
}

export function App() {
  const [system, setSystem] = useState<SystemDesign>(() => {
    const saved = loadCurrentSystem();
    return normalizeSystem(saved ?? DEFAULT_SYSTEM);
  });

  const undoStackRef = useRef<SystemDesign[]>([]);
  const redoStackRef = useRef<SystemDesign[]>([]);
  const copiedComponentRef = useRef<SystemComponent | null>(null);
  const copiedComponentsRef = useRef<SystemComponent[]>([]);
  const loadFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [focusedComponentId, setFocusedComponentId] = useState<string | null>(null);
  const [focusRequestId, setFocusRequestId] = useState(0);
  const [focusedConnectionId, setFocusedConnectionId] = useState<string | null>(null);
  const [focusConnectionRequestId, setFocusConnectionRequestId] = useState(0);
  const [canvasCancelRequestId, setCanvasCancelRequestId] = useState(0);
  const [fitDiagramRequestId, setFitDiagramRequestId] = useState(0);
  const [canvasViewportCenter, setCanvasViewportCenter] = useState({ x: 600, y: 380 });
  const [busColors, setBusColors] = useState<BusColorMap>(DEFAULT_BUS_COLORS);
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [newSystemModalOpen, setNewSystemModalOpen] = useState(false);
  const [leftDetailOpen, setLeftDetailOpen] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [pendingProtectionInsert, setPendingProtectionInsert] = useState<PendingProtectionInsert | null>(null);
  const [fusePickerSlot, setFusePickerSlot] = useState<{ componentId: string; slotId: string } | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const loadModalRef = useModalAccessibility(showLoadModal, () => setShowLoadModal(false));
  const [savedSystems, setSavedSystems] = useState(() => loadSavedSystems());
  const [themeMode, setThemeMode] = useState<ThemeMode>(loadThemeMode);
  const [debugMode, setDebugMode] = useState(false);
  const [voltageFilter, setVoltageFilter] = useState<NominalVoltage | 'all'>('all');
  const [startupModalOpen, setStartupModalOpen] = useState(() => INITIAL_SHARE_PARAM === null);
  const [hasCachedSystem] = useState(() => loadCurrentSystem() !== null);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [appDialog, setAppDialog] = useState<AppDialogRequest | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Derived
  const bomRows = useMemo(() => buildBom(system, PRODUCT_MAP), [system]);
  const systemDesignAnalysis = useMemo(() => analyzeSystemDesign(system, PRODUCT_MAP), [system]);
  const resolvedDcVoltages = useMemo(
    () => resolvedDcVoltageDomains(systemDesignAnalysis.graph),
    [systemDesignAnalysis]
  );
  const cableSummary = useMemo(
    () => buildCableLengthSummary(system.connections, systemDesignAnalysis.connections),
    [system.connections, systemDesignAnalysis]
  );
  const cableBomRows = useMemo(
    () => buildCableBomRows(system, PRODUCT_MAP, systemDesignAnalysis.connections),
    [system, systemDesignAnalysis]
  );
  const connectorSummary = useMemo(() => buildConnectorSummary(cableBomRows), [cableBomRows]);
  const priceSummary = useMemo(() => buildPriceSummary(bomRows), [bomRows]);
  const electricalSummary = systemDesignAnalysis.legacy.electricalSummary;
  const warnings = systemDesignAnalysis.warnings;
  const builderIssues = useMemo(
    () => buildBuilderIssues(system, PRODUCT_MAP, systemDesignAnalysis),
    [system, systemDesignAnalysis]
  );
  const protectionRecommendations = systemDesignAnalysis.legacy.protectionRecommendations;

  // Storage migrations normally run in the state initializer. Re-apply them to
  // the live design as well so an already-open dev session is repaired after
  // Fast Refresh without requiring the user to reload or discard the drawing.
  useEffect(() => {
    setSystem((current) => normalizeSystem(current));
  }, []);

  // Auto-save whenever system changes (not while startup modal is open)
  useEffect(() => {
    if (startupModalOpen) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const saved = saveCurrentSystem(system);
      setSaveStatus(saved ? 'saved' : 'error');
      if (saved) setLastSavedAt(new Date());
    }, 800);
    return () => clearTimeout(timer);
  }, [system, startupModalOpen]);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // Theme persistence is optional; autosave status covers design-storage failures.
    }
  }, [themeMode]);

  // Load shared design from URL param on first mount
  useEffect(() => {
    if (!INITIAL_SHARE_PARAM) return;
    decodeShareParam(INITIAL_SHARE_PARAM).then(({ system: loaded, compatibility }) => {
      handleLoadSystem(loaded);
      const url = new URL(window.location.href);
      url.searchParams.delete('d');
      window.history.replaceState({}, '', url.toString());
      if (compatibility.message) {
        setShareToast(compatibility.message);
        setTimeout(() => setShareToast(null), 10000);
      } else {
        setShareToast('Shared design loaded — you\'re viewing a snapshot. Use Save to keep a copy.');
        setTimeout(() => setShareToast(null), 6000);
      }
    }).catch(() => {
      setStartupModalOpen(true);
      setShareToast('Could not load the shared design — the link may be expired or invalid.');
      setTimeout(() => setShareToast(null), 5000);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- System mutation helpers ----

  const updateSystem = useCallback((updater: (s: SystemDesign) => SystemDesign, options?: { recordHistory?: boolean }) => {
    setSystem((prev) => {
      if (options?.recordHistory) {
        undoStackRef.current = [...undoStackRef.current.slice(-(HISTORY_LIMIT - 1)), prev];
        redoStackRef.current = [];
      }

      return withTimestamp(normalizeSystem(updater(prev)));
    });
  }, []);

  const undo = useCallback(() => {
    setSystem((current) => {
      const previous = undoStackRef.current[undoStackRef.current.length - 1];
      if (!previous) return current;
      undoStackRef.current = undoStackRef.current.slice(0, -1);
      redoStackRef.current = [...redoStackRef.current.slice(-(HISTORY_LIMIT - 1)), current];
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setSystem((current) => {
      const next = redoStackRef.current[redoStackRef.current.length - 1];
      if (!next) return current;
      redoStackRef.current = redoStackRef.current.slice(0, -1);
      undoStackRef.current = [...undoStackRef.current.slice(-(HISTORY_LIMIT - 1)), current];
      return next;
    });
  }, []);

  const handleNameChange = useCallback((name: string) => {
    updateSystem((s) => ({ ...s, name }));
  }, [updateSystem]);

  const handleVoltageChange = useCallback((v: NominalVoltage | 'all') => {
    setVoltageFilter(v);
  }, []);

  const handleBusColorChange = useCallback((busType: BusType, color: string) => {
    setBusColors((current) => ({ ...current, [busType]: color }));
  }, []);

  const handleResetBusColors = useCallback(() => {
    setBusColors(DEFAULT_BUS_COLORS);
  }, []);

  const handleAddProduct = useCallback((productId: string, options?: { voltageV?: number; maxCurrentA?: number }) => {
    const product = getProduct(productId);
    if (!product) return;
    const occupied = new Set(system.components.map((c) => `${c.x},${c.y}`));
    let x = snapPlacement(canvasViewportCenter.x);
    let y = snapPlacement(canvasViewportCenter.y);
    while (occupied.has(`${x},${y}`)) {
      x += 40;
      y += 40;
    }
    const bounded = clampComponentPosition(x, y, product);

    const comp: SystemComponent = {
      id: genId('comp'),
      productId,
      label: defaultComponentLabel(product, system.components),
      quantity: 1,
      x: bounded.x,
      y: bounded.y,
      includeInBom: product.productType !== 'custom_solar_array',
      ...(options?.voltageV != null && { instanceVoltageV: options.voltageV }),
      ...(options?.maxCurrentA != null && { instanceMaxCurrentA: options.maxCurrentA }),
    };

    updateSystem((s) => ({ ...s, components: [...s.components, comp] }), { recordHistory: true });
    setSelectedComponentId(comp.id);
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);

    // Auto-open fuse picker if the product is a fuse holder with slots
    const slots = product.distributionTopology?.fuseSlots;
    if (slots && slots.length > 0) {
      setFusePickerSlot({ componentId: comp.id, slotId: slots[0].id });
    }
  }, [canvasViewportCenter.x, canvasViewportCenter.y, system.components, updateSystem]);

  const handleAddTextAnnotation = useCallback(() => {
    const annotation: SystemTextAnnotation = {
      id: genId('txt'),
      kind: 'text',
      x: snapPlacement(canvasViewportCenter.x - 90),
      y: snapPlacement(canvasViewportCenter.y - 30),
      width: 180,
      height: 64,
      text: 'Add note',
      fontSize: 16,
      color: '#182235',
      backgroundColor: '#ffffff',
      showBackground: true,
      bold: false,
      italic: false,
      textAlign: 'left',
    };

    updateSystem((s) => ({ ...s, annotations: [...(s.annotations ?? []), annotation] }), { recordHistory: true });
    setSelectedAnnotationId(annotation.id);
    setSelectedComponentId(null);
    setSelectedConnectionId(null);
  }, [canvasViewportCenter.x, canvasViewportCenter.y, updateSystem]);

  const handleAddShapeAnnotation = useCallback((shapeType: ShapeAnnotationType) => {
    const annotation: SystemShapeAnnotation = {
      id: genId('shape'),
      kind: 'shape',
      shapeType,
      x: snapPlacement(canvasViewportCenter.x - 60),
      y: snapPlacement(canvasViewportCenter.y - 40),
      width: shapeType === 'arrow' ? 140 : 120,
      height: shapeType === 'arrow' ? 48 : 80,
      strokeColor: '#33435a',
      fillColor: '#ffffff',
      showFill: shapeType !== 'arrow',
      strokeWidth: 2,
    };

    updateSystem((s) => ({ ...s, annotations: [...(s.annotations ?? []), annotation] }), { recordHistory: true });
    setSelectedAnnotationId(annotation.id);
    setSelectedComponentId(null);
    setSelectedConnectionId(null);
  }, [canvasViewportCenter.x, canvasViewportCenter.y, updateSystem]);

  const handleMoveComponent = useCallback((id: string, x: number, y: number) => {
    setSystem((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, x, y } : c)),
    }));
  }, []);

  const handleMoveComponents = useCallback((moves: { id: string; x: number; y: number }[]) => {
    const moveMap = new Map(moves.map((m) => [m.id, m]));
    setSystem((prev) => ({
      ...prev,
      components: prev.components.map((c) => {
        const move = moveMap.get(c.id);
        return move ? { ...c, x: move.x, y: move.y } : c;
      }),
    }));
  }, []);

  const handleRotateComponent = useCallback((id: string) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) => {
        if (c.id !== id) return c;
        const product = getProduct(c.productId);
        const rotationDeg = ((c.rotationDeg ?? 0) + 90) % 360;
        if (!product) return { ...c, rotationDeg };
        const bounded = clampComponentPosition(c.x, c.y, product, rotationDeg, componentScale(c));
        return { ...c, rotationDeg, x: bounded.x, y: bounded.y };
      }),
    }));
  }, [updateSystem]);

  const handleSetComponentRotation = useCallback((id: string, rotationDeg: number) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) => {
        if (c.id !== id) return c;
        const product = getProduct(c.productId);
        if (!product) return { ...c, rotationDeg };
        const bounded = clampComponentPosition(c.x, c.y, product, rotationDeg, componentScale(c));
        return { ...c, rotationDeg, x: bounded.x, y: bounded.y };
      }),
    }));
  }, [updateSystem]);

  const handleToggleComponentLock = useCallback((id: string) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, locked: !c.locked } : c
      ),
    }), { recordHistory: true });
  }, [updateSystem]);

  const handleUpdateLabel = useCallback((id: string, label: string) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) => (c.id === id ? { ...c, label } : c)),
    }));
  }, [updateSystem]);

  const handleUpdatePrice = useCallback((id: string, price: number | undefined) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, customPriceUsd: price } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateIncludeInBom = useCallback((id: string, includeInBom: boolean) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, includeInBom } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateInstanceVoltage = useCallback((id: string, voltageV: number | undefined) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, instanceVoltageV: voltageV } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateDcBusNominalVoltage = useCallback((id: string, voltageV: number | undefined) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, dcNominalVoltage: voltageV } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateInstanceMaxCurrent = useCallback((id: string, currentA: number | undefined) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, instanceMaxCurrentA: currentA } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateAvailableFaultCurrent = useCallback((id: string, currentA: number | undefined) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, availableFaultCurrentA: currentA } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateComponentMaxCableAwg = useCallback((id: string, awg: string | undefined) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, maxCableAwg: awg } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateComponentImageScale = useCallback((id: string, scale: number) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) => {
        if (c.id !== id) return c;
        const imageScale = clampComponentScale(scale);
        const product = getProduct(c.productId);
        if (!product) return { ...c, imageScale };
        const bounded = clampComponentPosition(c.x, c.y, product, c.rotationDeg, imageScale);
        return { ...c, imageScale, x: bounded.x, y: bounded.y };
      }),
    }));
  }, [updateSystem]);

  const handleUpdateBusPolarity = useCallback((id: string, busPolarity: SystemComponent['busPolarity']) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) => (c.id === id ? { ...c, busPolarity } : c)),
    }));
  }, [updateSystem]);

  const handleUpdateFuseSlot = useCallback((id: string, slotId: string, patch: FuseSlotState) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) => {
        if (c.id !== id) return c;
        const current = c.fuseSlots?.[slotId] ?? {};
        return {
          ...c,
          fuseSlots: {
            ...(c.fuseSlots ?? {}),
            [slotId]: {
              ...current,
              ...patch,
            },
          },
        };
      }),
    }));
  }, [updateSystem]);

  const handleOpenFusePicker = useCallback((componentId: string, slotId: string) => {
    setFusePickerSlot({ componentId, slotId });
  }, []);

  const handleFusePickerConfirm = useCallback((fuseProductId: string) => {
    if (!fusePickerSlot) return;
    const fuseProduct = getProduct(fuseProductId);
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) => {
        if (c.id !== fusePickerSlot.componentId) return c;
        const current = c.fuseSlots?.[fusePickerSlot.slotId] ?? {};
        return {
          ...c,
          fuseSlots: {
            ...(c.fuseSlots ?? {}),
            [fusePickerSlot.slotId]: {
              ...current,
              installed: true,
              ratingA: fuseProduct ? (fuseProduct.protectionRatings?.currentRatingA ?? fuseProduct.maxCurrentA) : undefined,
              fuseProductId,
            },
          },
        };
      }),
    }));
    setFusePickerSlot(null);
  }, [fusePickerSlot, updateSystem]);

  const handleFusePickerSkip = useCallback(() => {
    setFusePickerSlot(null);
  }, []);

  const handleRemoveFuseSlot = useCallback((componentId: string, slotId: string) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) => {
        if (c.id !== componentId) return c;
        const current = c.fuseSlots?.[slotId] ?? {};
        return {
          ...c,
          fuseSlots: {
            ...(c.fuseSlots ?? {}),
            [slotId]: {
              ...current,
              installed: false,
              ratingA: undefined,
              fuseProductId: undefined,
            },
          },
        };
      }),
    }));
    // If the remove came from the fuse picker, close it
    setFusePickerSlot(null);
  }, [updateSystem]);

  const handleUpdateCustomSolarArrayRatings = useCallback((id: string, ratings: CustomSolarArrayRatings) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id
          ? {
              ...c,
              customSolarArrayRatings: ratings,
            }
          : c
      ),
    }));
  }, [updateSystem]);

  const handleRemoveComponent = useCallback((id: string) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.filter((c) => c.id !== id),
      connections: s.connections.filter(
        (conn) => conn.fromComponentId !== id && conn.toComponentId !== id
      ),
    }), { recordHistory: true });
    setSelectedComponentId(null);
    setSelectedAnnotationId(null);
  }, [updateSystem]);

  const handleChangeComponentProduct = useCallback((id: string, productId: string) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, productId } : c
      ),
    }), { recordHistory: true });
  }, [updateSystem]);

  const handleAddConnection = useCallback(
    (fromComp: string, fromTerm: string, toComp: string, toTerm: string) => {
      const exists = system.connections.some(
        (c) =>
          (
            c.fromComponentId === fromComp &&
            c.fromTerminalId === fromTerm &&
            c.toComponentId === toComp &&
            c.toTerminalId === toTerm
          ) ||
          (
            c.fromComponentId === toComp &&
            c.fromTerminalId === toTerm &&
            c.toComponentId === fromComp &&
            c.toTerminalId === fromTerm
          )
      );
      if (exists) return;

      const validation = validateSystemConnection(
        {
          fromComponentId: fromComp,
          fromTerminalId: fromTerm,
          toComponentId: toComp,
          toTerminalId: toTerm,
        },
        system.components,
        PRODUCT_MAP
      );
      if (!validation.valid) {
        setAppDialog({
          title: 'Connection not allowed',
          message: validation.message ?? 'These terminals are not compatible.',
          tone: 'danger',
        });
        return;
      }

      // Bolt-together busbar terminals (e.g. adjacent Lynx modules) default to a
      // cableless bus link — no cable, but still electrically continuous.
      const fromProduct = PRODUCT_MAP.get(system.components.find((c) => c.id === fromComp)?.productId ?? '');
      const toProduct = PRODUCT_MAP.get(system.components.find((c) => c.id === toComp)?.productId ?? '');
      const isBusLink = sharedBusLinkStandard(fromProduct, fromTerm, toProduct, toTerm) != null;

      // Detect communication wires — connections between 'network' kind terminals
      const fromComponent = system.components.find((c) => c.id === fromComp);
      const toComponent = system.components.find((c) => c.id === toComp);
      const fromTermDef = fromProduct && fromComponent
        ? getEffectiveTerminal(fromProduct, fromTerm, fromComponent)
        : undefined;
      const toTermDef = toProduct && toComponent
        ? getEffectiveTerminal(toProduct, toTerm, toComponent)
        : undefined;
      const isCommWire = fromTermDef?.kind === 'network' && toTermDef?.kind === 'network';

      // Route new connection around obstacles
      let routePoints: Array<{ x: number; y: number }> | undefined;
      if (fromComponent && toComponent && fromProduct && toProduct) {
        try {
          const fromTermPos = getConnectionTerminalPos(fromComponent, fromTerm, fromProduct);
          const toTermPos = getConnectionTerminalPos(toComponent, toTerm, toProduct);
          if (fromTermPos && toTermPos) {
            const obstacles = buildObstacles(system.components, PRODUCT_MAP, system.annotations ?? []);
            const excludeIds = new Set([fromComp, toComp]);
            const pts = routeConnection(fromTermPos, toTermPos, obstacles, excludeIds);
            if (pts.length > 0) routePoints = pts;
          }
        } catch {
          // fall through to default routing
        }
      }

      const conn: SystemConnection = {
        id: genId('conn'),
        fromComponentId: fromComp,
        fromTerminalId: fromTerm,
        toComponentId: toComp,
        toTerminalId: toTerm,
        cableLengthFt: isBusLink ? 0 : system.assumptions.defaultCableLengthFt,
        busLink: isBusLink || undefined,
        ...(isCommWire ? { wireKind: 'communication' as const } : {}),
        ...(routePoints ? { routePoints, routeMode: 'auto' as const } : {}),
      };

      updateSystem((s) => ({ ...s, connections: [...s.connections, conn] }));
    },
    [system.connections, system.components, system.assumptions.defaultCableLengthFt, updateSystem]
  );

  const handleRemoveConnection = useCallback((id: string) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.filter((c) => c.id !== id),
    }));
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);
  }, [updateSystem]);

  const handleUpdateConnectionLength = useCallback((id: string, ft: number) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, cableLengthFt: ft } : c
      ),
    }));
  }, [updateSystem]);

  const handleToggleBusLink = useCallback((id: string, busLink: boolean) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id
          ? {
              ...c,
              busLink: busLink || undefined,
              // Bus link → no cable; reverting → restore a default cable length.
              cableLengthFt: busLink ? 0 : Math.max(c.cableLengthFt, s.assumptions.defaultCableLengthFt),
            }
          : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateConnectionDesignCurrent = useCallback((id: string, currentA: number | undefined) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, designCurrentOverrideA: currentA } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateConnectionCableAwg = useCallback((id: string, awg: string) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, manualCableAwg: awg } : c
      ),
    }));
  }, [updateSystem]);

  const handleAutoConnectionCableAwg = useCallback((id: string) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, manualCableAwg: undefined } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateConnectionCableColor = useCallback((id: string, color: string) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, cableColor: color || undefined } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateConnectionCableType = useCallback((id: string, type: string) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, cableType: type || undefined } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateConnectionCableMode = useCallback((id: string, mode: import('./types/system').CableMode) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, cableMode: mode } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateConnectionPremanufacturedCable = useCallback((id: string, cableId: string | undefined) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, premanufacturedCableId: cableId } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateConfiguredProtocol = useCallback((componentId: string, portId: string, protocol: import('./types/system').CommunicationProtocol | undefined) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) => {
        if (c.id !== componentId) return c;
        const next = { ...c.configuredProtocols };
        if (protocol === undefined) {
          delete next[portId];
        } else {
          next[portId] = protocol;
        }
        return { ...c, configuredProtocols: next };
      }),
    }));
  }, [updateSystem]);

  const handleToggleConnectionIncludeInBOM = useCallback((id: string, include: boolean) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, includeInBOM: include } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateSourceType = useCallback((id: string, sourceType: import('./types/system').DcSourceType | import('./types/system').AcSourceType | undefined) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, sourceType } : c
      ),
    }));
  }, [updateSystem]);

  const handleUpdateBreakerConfiguration = useCallback((id: string, breakerConfigurationId: string | undefined) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((component) => (
        component.id === id ? { ...component, breakerConfigurationId } : component
      )),
    }));
  }, [updateSystem]);

  const handleInsertProtection = useCallback((recommendation: ProtectionRecommendation, marker: PathMarker) => {
    if (recommendation.busType !== 'dc_pos' && recommendation.busType !== 'ac_line' && recommendation.busType !== 'ac_line2' && recommendation.busType !== 'ac_line3') {
      setAppDialog({
        title: 'Protection cannot be inserted here',
        message: 'Inline protection insertion is currently available for DC positive and AC line conductors.',
      });
      return;
    }
    setPendingProtectionInsert({ recommendation, marker });
  }, []);

  const handleConfirmInlineProtection = useCallback((productId: string, slotRatingA?: number) => {
    const pending = pendingProtectionInsert;
    const product = getProduct(productId);
    if (!pending || !product || !['fuse_holder', 'breaker'].includes(product.productType)) return;
    const terminalIds = inlineProtectionTerminalIds(product, pending.recommendation.busType);
    if (!terminalIds) return;

    const original = system.connections.find((connection) => connection.id === pending.recommendation.connectionId);
    if (!original) {
      setPendingProtectionInsert(null);
      return;
    }

    const insertedComponentId = genId('comp');
    const firstLength = Math.max(0.1, original.cableLengthFt / 2);
    const secondLength = Math.max(0.1, original.cableLengthFt - firstLength);
    const commonConnectionFields = {
      designCurrentOverrideA: original.designCurrentOverrideA,
      manualCableAwg: original.manualCableAwg,
      autoGenerated: original.autoGenerated,
    };

    const originalFromComp = system.components.find((component) => component.id === original.fromComponentId);
    const originalToComp = system.components.find((component) => component.id === original.toComponentId);
    const originalFromProduct = originalFromComp ? PRODUCT_MAP.get(originalFromComp.productId) : undefined;
    const originalToProduct = originalToComp ? PRODUCT_MAP.get(originalToComp.productId) : undefined;
    const originalFromPos = originalFromComp && originalFromProduct
      ? getConnectionTerminalPos(originalFromComp, original.fromTerminalId, originalFromProduct)
      : null;
    const originalToPos = originalToComp && originalToProduct
      ? getConnectionTerminalPos(originalToComp, original.toTerminalId, originalToProduct)
      : null;
    const split = originalFromPos && originalToPos
      ? splitPointsAtMarker(connectionPoints(original, originalFromPos, originalToPos), pending.marker)
      : null;

    const slotId = product.distributionTopology?.fuseSlots?.[0]?.id;
    const fuseSlots = product.productType === 'fuse_holder' && slotId && slotRatingA != null
      ? { [slotId]: { installed: true, ratingA: slotRatingA } }
      : undefined;

    if (product.productType === 'breaker') {
      const medium = breakerMediumForBusType(pending.recommendation.busType);
      const matchingProfiles = medium
        ? breakerRatingProfiles(product).filter((profile) => profile.medium === medium)
        : [];
      const profile = matchingProfiles.length === 1 ? matchingProfiles[0] : undefined;
      if (profile && profile.polesRequired > 1) {
        const requiredBusTypes: BusType[] = profile.medium === 'ac'
          ? (['ac_line', 'ac_line2', 'ac_line3'] as BusType[]).slice(0, profile.polesRequired)
          : profile.wiring === 'bipolar'
            ? ['dc_pos', 'dc_neg']
            : [];
        const sameEndpointPair = (connection: SystemConnection) => (
          (connection.fromComponentId === original.fromComponentId && connection.toComponentId === original.toComponentId) ||
          (connection.fromComponentId === original.toComponentId && connection.toComponentId === original.fromComponentId)
        );
        const bundledConnections = requiredBusTypes.map((busType) => system.connections.find((connection) => (
          sameEndpointPair(connection) &&
          (connection.busType ?? systemDesignAnalysis.connections[connection.id]?.busType) === busType
        )));

        if (requiredBusTypes.length !== profile.polesRequired || bundledConnections.some((connection) => !connection)) {
          setAppDialog({
            title: 'Matching conductors required',
            message: `The ${profile.label ?? profile.id} configuration needs ${profile.polesRequired} matching conductors between the same two components. Add or connect those conductors first, then insert the breaker again.`,
          });
          return;
        }

        const rotationDeg = normalizeCardinalRotation(pending.marker.angleDeg);
        const bounded = clampComponentPosition(pending.marker.point.x, pending.marker.point.y, product, rotationDeg);
        const protectionComponent: SystemComponent = {
          id: insertedComponentId,
          productId: product.id,
          label: pending.recommendation.defaultComponentLabel ?? defaultComponentLabel(product, system.components),
          quantity: 1,
          x: bounded.x,
          y: bounded.y,
          rotationDeg,
          includeInBom: true,
          breakerConfigurationId: profile.id,
        };
        const poles = breakerPoles(product).slice(0, profile.polesRequired);
        const replacementConnections: SystemConnection[] = [];
        const candidateComponents = [...system.components, protectionComponent];

        for (let index = 0; index < bundledConnections.length; index += 1) {
          const connection = bundledConnections[index]!;
          const pole = poles[index];
          const inTerminal = product.terminals.find((terminal) => terminal.terminalGroupId === pole.inputTerminalGroupId);
          const outTerminal = product.terminals.find((terminal) => terminal.terminalGroupId === pole.outputTerminalGroupId);
          if (!inTerminal || !outTerminal) return;
          const first = Math.max(0.1, connection.cableLengthFt / 2);
          const second = Math.max(0.1, connection.cableLengthFt - first);
          const shared = {
            designCurrentOverrideA: connection.designCurrentOverrideA,
            manualCableAwg: connection.manualCableAwg,
            autoGenerated: connection.autoGenerated,
          };
          const buildPair = (reverse: boolean): [SystemConnection, SystemConnection] => [{
            ...shared,
            id: genId('conn'),
            fromComponentId: connection.fromComponentId,
            fromTerminalId: connection.fromTerminalId,
            toComponentId: protectionComponent.id,
            toTerminalId: reverse ? outTerminal.id : inTerminal.id,
            cableLengthFt: first,
          }, {
            ...shared,
            id: genId('conn'),
            fromComponentId: protectionComponent.id,
            fromTerminalId: reverse ? inTerminal.id : outTerminal.id,
            toComponentId: connection.toComponentId,
            toTerminalId: connection.toTerminalId,
            cableLengthFt: second,
          }];
          const forwardPair = buildPair(false);
          const forwardValid = forwardPair.every((candidate) => validateSystemConnection(candidate, candidateComponents, PRODUCT_MAP).valid);
          const pair = forwardValid ? forwardPair : buildPair(true);
          if (!pair.every((candidate) => validateSystemConnection(candidate, candidateComponents, PRODUCT_MAP).valid)) {
            setAppDialog({
              title: 'Breaker insertion failed',
              message: `The selected breaker cannot be inserted on ${requiredBusTypes[index]} with the current terminal rules.`,
              tone: 'danger',
            });
            return;
          }
          replacementConnections.push(...pair);
        }

        const replacedIds = new Set(bundledConnections.map((connection) => connection!.id));
        updateSystem((s) => ({
          ...s,
          components: [...s.components, protectionComponent],
          connections: [...s.connections.filter((connection) => !replacedIds.has(connection.id)), ...replacementConnections],
        }), { recordHistory: true });
        setPendingProtectionInsert(null);
        setSelectedComponentId(protectionComponent.id);
        setSelectedConnectionId(null);
        setSelectedAnnotationId(null);
        setFocusedComponentId(protectionComponent.id);
        setFocusRequestId((current) => current + 1);
        return;
      }
    }

    const buildCandidate = (mapping: 'forward' | 'reverse') => {
      const rotationDeg = normalizeCardinalRotation(
        pending.marker.angleDeg + (mapping === 'reverse' ? 180 : 0)
      );
      const bounded = clampComponentPosition(
        pending.marker.point.x,
        pending.marker.point.y,
        product,
        rotationDeg
      );
      const protectionComponent: SystemComponent = {
        id: insertedComponentId,
        productId: product.id,
        label: pending.recommendation.defaultComponentLabel ?? defaultComponentLabel(product, system.components),
        quantity: 1,
        x: bounded.x,
        y: bounded.y,
        rotationDeg,
        includeInBom: true,
        ...(fuseSlots && { fuseSlots }),
      };
      const routeBefore = original.routePoints && split ? routePointsFromSplit(split.before) : undefined;
      const routeAfter = original.routePoints && split ? routePointsFromSplit(split.after) : undefined;
      const before: SystemConnection = {
        ...commonConnectionFields,
        id: genId('conn'),
        fromComponentId: original.fromComponentId,
        fromTerminalId: original.fromTerminalId,
        toComponentId: protectionComponent.id,
        toTerminalId: mapping === 'forward' ? terminalIds.inId : terminalIds.outId,
        cableLengthFt: firstLength,
        routePoints: routeBefore,
      };
      const after: SystemConnection = {
        ...commonConnectionFields,
        id: genId('conn'),
        fromComponentId: protectionComponent.id,
        fromTerminalId: mapping === 'forward' ? terminalIds.outId : terminalIds.inId,
        toComponentId: original.toComponentId,
        toTerminalId: original.toTerminalId,
        cableLengthFt: secondLength,
        routePoints: routeAfter,
      };

      return { protectionComponent, before, after };
    };

    const forward = buildCandidate('forward');
    const forwardComponents = [...system.components, forward.protectionComponent];
    const forwardValid =
      validateSystemConnection(forward.before, forwardComponents, PRODUCT_MAP).valid &&
      validateSystemConnection(forward.after, forwardComponents, PRODUCT_MAP).valid;
    const selected = forwardValid ? forward : buildCandidate('reverse');
    const selectedComponents = [...system.components, selected.protectionComponent];
    const selectedValid =
      validateSystemConnection(selected.before, selectedComponents, PRODUCT_MAP).valid &&
      validateSystemConnection(selected.after, selectedComponents, PRODUCT_MAP).valid;

    if (!selectedValid) {
      setAppDialog({
        title: 'Protection insertion failed',
        message: 'That protection device cannot be inserted into this connection with the current terminal rules.',
        tone: 'danger',
      });
      return;
    }

    updateSystem((s) => ({
      ...s,
      components: [...s.components, selected.protectionComponent],
      connections: [
        ...s.connections.filter((connection) => connection.id !== original.id),
        selected.before,
        selected.after,
      ],
    }), { recordHistory: true });

    setPendingProtectionInsert(null);
    setSelectedComponentId(selected.protectionComponent.id);
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);
    setFocusedComponentId(selected.protectionComponent.id);
    setFocusRequestId((current) => current + 1);
  }, [pendingProtectionInsert, system, updateSystem]);

  const handleMoveConnectionRoute = useCallback((id: string, routePoints: Array<{ x: number; y: number }>) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, routePoints, routeMode: 'manual' as const } : c
      ),
    }));
  }, [updateSystem]);

  const handleMoveAnnotation = useCallback((id: string, x: number, y: number) => {
    setSystem((prev) => ({
      ...prev,
      annotations: (prev.annotations ?? []).map((annotation) =>
        annotation.id === id ? { ...annotation, x, y } : annotation
      ),
    }));
  }, []);

  const handleResizeAnnotation = useCallback((id: string, width: number, height: number) => {
    setSystem((prev) => ({
      ...prev,
      annotations: (prev.annotations ?? []).map((annotation) =>
        annotation.id === id ? { ...annotation, width, height } : annotation
      ),
    }));
  }, []);

  const handleUpdateTextAnnotation = useCallback((id: string, patch: Partial<SystemTextAnnotation>) => {
    updateSystem((s) => ({
      ...s,
      annotations: (s.annotations ?? []).map((annotation) =>
        annotation.id === id && annotation.kind === 'text' ? { ...annotation, ...patch } : annotation
      ),
    }));
  }, [updateSystem]);

  const handleUpdateShapeAnnotation = useCallback((id: string, patch: Partial<SystemShapeAnnotation>) => {
    updateSystem((s) => ({
      ...s,
      annotations: (s.annotations ?? []).map((annotation) =>
        annotation.id === id && annotation.kind === 'shape' ? { ...annotation, ...patch } : annotation
      ),
    }));
  }, [updateSystem]);

  const handleRemoveAnnotation = useCallback((id: string) => {
    updateSystem((s) => ({
      ...s,
      annotations: (s.annotations ?? []).filter((annotation) => annotation.id !== id),
    }), { recordHistory: true });
    setSelectedAnnotationId(null);
  }, [updateSystem]);

  const handleResetConnectionRoute = useCallback((id: string) => {
    updateSystem((s) => ({
      ...s,
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, routePoints: undefined, routeMode: undefined } : c
      ),
    }));
  }, [updateSystem]);

  const handleAutoRouteAll = useCallback(() => {
    updateSystem((s) => ({
      ...s,
      connections: autoRouteConnections(s.connections, s.components, PRODUCT_MAP, s.annotations ?? []),
    }), { recordHistory: true });
  }, [updateSystem]);

  const handleCopyComponent = useCallback((id: string) => {
    const component = system.components.find((c) => c.id === id);
    if (!component) return;
    copiedComponentRef.current = component;
    copiedComponentsRef.current = [component];
  }, [system.components]);

  const handleCopySelectedComponent = useCallback(() => {
    if (!selectedComponentId) return;
    handleCopyComponent(selectedComponentId);
  }, [handleCopyComponent, selectedComponentId]);

  const handleCancelSelection = useCallback(() => {
    setSelectedComponentId(null);
    setSelectedComponentIds([]);
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);
    setCanvasCancelRequestId((current) => current + 1);
  }, []);

  const handleCutComponent = useCallback((id: string) => {
    const component = system.components.find((c) => c.id === id);
    if (!component) return;
    copiedComponentRef.current = component;
    copiedComponentsRef.current = [component];
    handleRemoveComponent(id);
  }, [handleRemoveComponent, system.components]);

  const handleCopyMultipleComponents = useCallback((ids: string[]) => {
    const components = system.components.filter((c) => ids.includes(c.id));
    if (components.length === 0) return;
    copiedComponentsRef.current = components;
    copiedComponentRef.current = components[0];
  }, [system.components]);

  const handleRemoveMultipleComponents = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    updateSystem((s) => ({
      ...s,
      components: s.components.filter((c) => !idSet.has(c.id)),
      connections: s.connections.filter(
        (conn) => !idSet.has(conn.fromComponentId) && !idSet.has(conn.toComponentId)
      ),
    }), { recordHistory: true });
    setSelectedComponentIds([]);
    setSelectedComponentId(null);
  }, [updateSystem]);

  const handleCutMultipleComponents = useCallback((ids: string[]) => {
    handleCopyMultipleComponents(ids);
    handleRemoveMultipleComponents(ids);
  }, [handleCopyMultipleComponents, handleRemoveMultipleComponents]);

  const handlePasteComponent = useCallback(() => {
    const sources = copiedComponentsRef.current;
    if (sources.length === 0) return;

    if (sources.length === 1) {
      const source = sources[0];
      const product = getProduct(source.productId);
      if (!product) return;
      const bounded = clampComponentPosition(
        source.x + PASTE_OFFSET,
        source.y + PASTE_OFFSET,
        product,
        source.rotationDeg,
        componentScale(source)
      );
      const pasted: SystemComponent = {
        ...source,
        id: genId('comp'),
        label: source.label ? `${source.label} Copy` : `${product.name} Copy`,
        x: bounded.x,
        y: bounded.y,
        locked: false,
        inferredElectricalType: undefined,
        inferredConnectionKind: undefined,
        inferredPolarity: undefined,
        inferredVoltageClass: undefined,
      };
      copiedComponentRef.current = pasted;
      copiedComponentsRef.current = [pasted];
      updateSystem((s) => ({ ...s, components: [...s.components, pasted] }), { recordHistory: true });
      setSelectedComponentId(pasted.id);
      setSelectedComponentIds([]);
      setSelectedConnectionId(null);
    } else {
      const pasted: SystemComponent[] = sources.map((source) => ({
        ...source,
        id: genId('comp'),
        x: source.x + PASTE_OFFSET,
        y: source.y + PASTE_OFFSET,
        locked: false,
        inferredElectricalType: undefined,
        inferredConnectionKind: undefined,
        inferredPolarity: undefined,
        inferredVoltageClass: undefined,
      }));
      copiedComponentsRef.current = pasted;
      updateSystem((s) => ({ ...s, components: [...s.components, ...pasted] }), { recordHistory: true });
      setSelectedComponentIds(pasted.map((c) => c.id));
      setSelectedComponentId(null);
    }
  }, [updateSystem]);

  useEffect(() => {
    if (selectedComponentId && !system.components.some((c) => c.id === selectedComponentId)) {
      setSelectedComponentId(null);
    }
    if (selectedConnectionId && !system.connections.some((c) => c.id === selectedConnectionId)) {
      setSelectedConnectionId(null);
    }
    if (selectedAnnotationId && !(system.annotations ?? []).some((annotation) => annotation.id === selectedAnnotationId)) {
      setSelectedAnnotationId(null);
    }
  }, [selectedAnnotationId, selectedComponentId, selectedConnectionId, system.annotations, system.components, system.connections]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelSelection();
        return;
      }

      const modifierPressed = e.ctrlKey || e.metaKey;
      if (!modifierPressed) return;

      const key = e.key.toLowerCase();
      if (key === 'c') {
        if (selectedComponentIds.length > 1) {
          e.preventDefault();
          handleCopyMultipleComponents(selectedComponentIds);
          return;
        }
        if (!selectedComponentId) return;
        e.preventDefault();
        handleCopySelectedComponent();
        return;
      }

      if (key === 'v') {
        if (copiedComponentsRef.current.length === 0) return;
        e.preventDefault();
        handlePasteComponent();
        return;
      }

      if (key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (key === 'y') {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCancelSelection, handleCopyMultipleComponents, handleCopySelectedComponent, handlePasteComponent, redo, selectedComponentId, selectedComponentIds, undo]);

  const handleLoadSystem = useCallback((loadedSystem: SystemDesign) => {
    const normalized = normalizeSystem(loadedSystem);
    setSystem(normalized);
    setVoltageFilter('all');
    const saved = saveCurrentSystem(normalized);
    setSaveStatus(saved ? 'saved' : 'error');
    if (saved) setLastSavedAt(new Date());
    setSavedSystems(loadSavedSystems());
    undoStackRef.current = [];
    redoStackRef.current = [];
    copiedComponentRef.current = null;
    copiedComponentsRef.current = [];
    setShowLoadModal(false);
    setStartupModalOpen(false);
    setSelectedComponentId(null);
    setSelectedComponentIds([]);
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);
    setFitDiagramRequestId((prev) => prev + 1);
  }, []);

  const handleSave = useCallback(() => {
    const saved = saveCurrentSystem(system);
    setSaveStatus(saved ? 'saved' : 'error');
    if (saved) setLastSavedAt(new Date());
    setSavedSystems(loadSavedSystems());

    const saveFile = createSystemSaveFile(system);
    const blob = new Blob([`${JSON.stringify(saveFile, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = systemSaveFilename(system);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [system]);

  const handleLoad = useCallback(() => {
    loadFileInputRef.current?.click();
  }, []);

  const handleLoadFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const { system: loadedSystem, compatibility } = parseSystemSaveFile(await file.text());
      handleLoadSystem(loadedSystem);
      if (compatibility.message) {
        setShareToast(compatibility.message);
        setTimeout(() => setShareToast(null), 10000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load that save file.';
      setAppDialog({ title: 'Could not load design', message, tone: 'danger' });
    }
  }, [handleLoadSystem]);

  const handleReset = useCallback(() => {
    setNewSystemModalOpen(true);
  }, []);

  const writeDefaultSystem = import.meta.env.DEV ? async (target: string, label: string) => {
    try {
      const r = await fetch('/__dev/set-default-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, target }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      setAppDialog({
        title: 'Default system updated',
        message: `"${label}" was updated. Changes will apply on the next reset or fresh load.`,
      });
    } catch (error) {
      setAppDialog({
        title: 'Default update failed',
        message: error instanceof Error ? error.message : String(error),
        tone: 'danger',
      });
    }
  } : undefined;

  const handleSetDefault = import.meta.env.DEV && writeDefaultSystem ? (target: string, label: string) => {
    setAppDialog({
      title: 'Update default system?',
      message: `Write the current drawing to "${label}"? This changes the development default.`,
      confirmLabel: 'Update default',
      onConfirm: () => { void writeDefaultSystem(target, label); },
    });
  } : undefined;

  const handleNewSystemSelect = useCallback((template: SystemDesign | null) => {
    setNewSystemModalOpen(false);
    setStartupModalOpen(false);
    const base = template ?? { ...DEFAULT_SYSTEM, components: [], connections: [], annotations: [] };
    const fresh = { ...base, id: genId('sys'), createdAt: new Date().toISOString() };
    const normalized = normalizeSystem(fresh);
    setSystem(normalized);
    setVoltageFilter('all');
    undoStackRef.current = [];
    redoStackRef.current = [];
    copiedComponentRef.current = null;
    copiedComponentsRef.current = [];
    setSelectedComponentId(null);
    setSelectedComponentIds([]);
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);
    setFitDiagramRequestId((prev) => prev + 1);
  }, []);

  const handleExportCsv = useCallback(() => {
    exportBomCsv(bomRows, system.name, cableSummary, connectorSummary);
  }, [bomRows, cableSummary, connectorSummary, system.name]);

  const handleShare = useCallback(async () => {
    try {
      const url = await buildShareUrl(system);

      // navigator.clipboard requires HTTPS or localhost — fall back to execCommand on plain HTTP
      let copied = false;
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(url);
          copied = true;
        } catch {
          // fall through to execCommand
        }
      }
      if (!copied) {
        const el = document.createElement('textarea');
        el.value = url;
        el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(el);
        el.focus();
        el.select();
        copied = document.execCommand('copy');
        document.body.removeChild(el);
      }

      if (copied) {
        setShareToast('Link copied to clipboard — paste it anywhere to share this design. Anyone with the link can open it in their browser.');
      } else {
        setAppDialog({
          title: 'Copy share link',
          message: 'Automatic clipboard access is unavailable. Select and copy this link manually.',
          copyText: url,
          cancelLabel: 'Done',
        });
      }
      setTimeout(() => setShareToast(null), 6000);
    } catch {
      setShareToast('Could not generate share link. Try the Save button to export a file instead.');
      setTimeout(() => setShareToast(null), 5000);
    }
  }, [system]);

  const handleSelectMultipleComponents = useCallback((ids: string[]) => {
    setSelectedComponentIds(ids);
    setSelectedComponentId(null);
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);
  }, []);

  const handleClearMultiSelect = useCallback(() => {
    setSelectedComponentIds([]);
  }, []);

  const handleSelectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
    setSelectedComponentIds([]);
    if (id) setSelectedConnectionId(null);
    if (id) setSelectedAnnotationId(null);
  }, []);

  const handleSelectConnection = useCallback((id: string | null) => {
    setSelectedConnectionId(id);
    if (id) setSelectedComponentId(null);
    if (id) setSelectedAnnotationId(null);
  }, []);

  const handleSelectAnnotation = useCallback((id: string | null) => {
    setSelectedAnnotationId(id);
    if (id) {
      setSelectedComponentId(null);
      setSelectedConnectionId(null);
    }
  }, []);

  const handleFocusComponent = useCallback((id: string) => {
    setSelectedComponentId(id);
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);
    setFocusedComponentId(id);
    setFocusRequestId((current) => current + 1);
  }, []);

  const handleFocusConnection = useCallback((id: string) => {
    setSelectedConnectionId(id);
    setSelectedComponentId(null);
    setSelectedAnnotationId(null);
    setFocusedConnectionId(id);
    setFocusConnectionRequestId((current) => current + 1);
  }, []);

  const handleEnterFullView = useCallback(() => {
    setLeftCollapsed(true);
    setRightCollapsed(true);
  }, []);

  return (
    <>
    <div
      className={`app-grid theme-${themeMode}`}
      style={{
        gridTemplateColumns: `${leftCollapsed ? '58px' : leftDetailOpen ? '460px' : '300px'} minmax(0, 1fr) ${rightCollapsed ? '58px' : '280px'}`,
      }}
    >
      <HeaderBar
        systemName={system.name}
        voltageFilter={voltageFilter}
        resolvedDcVoltages={resolvedDcVoltages}
        totalMsrp={priceSummary.totalMsrp}
        warnings={warnings}
        busColors={busColors}
        themeMode={themeMode}
        debugMode={debugMode}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        onNameChange={handleNameChange}
        onVoltageChange={handleVoltageChange}
        onBusColorChange={handleBusColorChange}
        onResetBusColors={handleResetBusColors}
        onToggleTheme={() => setThemeMode((mode) => mode === 'dark' ? 'light' : 'dark')}
        onToggleDebugMode={() => setDebugMode((enabled) => !enabled)}
        onSave={handleSave}
        onLoad={handleLoad}
        onReset={handleReset}
        onShare={handleShare}
        onOpenBom={() => setBomModalOpen(true)}
        onExportPdf={() => {
          const prev = document.title;
          document.title = system.name;
          // Restore after the print dialog closes — restoring synchronously
          // would reset the title before the user clicks "Print".
          const restore = () => {
            document.title = prev;
            window.removeEventListener('afterprint', restore);
          };
          window.addEventListener('afterprint', restore);
          window.print();
        }}
        onSetDefault={handleSetDefault}
      />
      <input
        ref={loadFileInputRef}
        type="file"
        accept="application/json,.json,.system-builder.json"
        onChange={handleLoadFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      <LeftPartSidebar
        systemVoltage={voltageFilter}
        onAddProduct={handleAddProduct}
        onAddTextAnnotation={handleAddTextAnnotation}
        onAddShapeAnnotation={handleAddShapeAnnotation}
        components={system.components}
        products={PRODUCT_MAP}
        selectedComponentId={selectedComponentId}
        onSelectComponent={handleSelectComponent}
        onRemoveComponent={handleRemoveComponent}
        detailMode={leftDetailOpen}
        onToggleDetailMode={() => setLeftDetailOpen((open) => !open)}
        collapsed={leftCollapsed}
        onToggleCollapsed={() => setLeftCollapsed((collapsed) => !collapsed)}
        debugMode={debugMode}
      />

      <main className="canvas-area">
        <SchematicCanvas
          system={system}
          products={PRODUCT_MAP}
          selectedComponentId={selectedComponentId}
          selectedConnectionId={selectedConnectionId}
          selectedAnnotationId={selectedAnnotationId}
          protectionRecommendations={protectionRecommendations}
          connectionAnalysis={systemDesignAnalysis.connections}
          busColors={busColors}
          focusedComponentId={focusedComponentId}
          focusRequestId={focusRequestId}
          focusedConnectionId={focusedConnectionId}
          focusConnectionRequestId={focusConnectionRequestId}
          cancelInteractionRequestId={canvasCancelRequestId}
          fitDiagramRequestId={fitDiagramRequestId}
          onViewportCenterChange={setCanvasViewportCenter}
          onSelectComponent={handleSelectComponent}
          onSelectConnection={handleSelectConnection}
          onSelectAnnotation={handleSelectAnnotation}
          onMoveComponent={handleMoveComponent}
          onMoveAnnotation={handleMoveAnnotation}
          onResizeAnnotation={handleResizeAnnotation}
          onUndo={undo}
          onPasteComponent={handlePasteComponent}
          onCopyComponent={handleCopyComponent}
          onCutComponent={handleCutComponent}
          onRotateComponent={handleRotateComponent}
          onSetComponentRotation={handleSetComponentRotation}
          onToggleComponentLock={handleToggleComponentLock}
          onRemoveComponent={handleRemoveComponent}
          onRemoveConnection={handleRemoveConnection}
          onRemoveAnnotation={handleRemoveAnnotation}
          onMoveConnectionRoute={handleMoveConnectionRoute}
          onInsertProtection={handleInsertProtection}
          onEnterFullView={handleEnterFullView}
          onScaleComponent={handleUpdateComponentImageScale}
          onAddConnection={handleAddConnection}
          selectedComponentIds={selectedComponentIds}
          onSelectMultipleComponents={handleSelectMultipleComponents}
          onClearMultiSelect={handleClearMultiSelect}
          onMoveComponents={handleMoveComponents}
          onCopyMultiple={handleCopyMultipleComponents}
          onCutMultiple={handleCutMultipleComponents}
          onRemoveMultiple={handleRemoveMultipleComponents}
          onAutoRouteAll={handleAutoRouteAll}
        />
      </main>

      <RightInspector
        selectedComponentId={selectedComponentId}
        selectedConnectionId={selectedConnectionId}
        selectedAnnotationId={selectedAnnotationId}
        components={system.components}
        connections={system.connections}
        annotations={system.annotations ?? []}
        products={PRODUCT_MAP}
        systemVoltage={system.nominalVoltage}
        issues={builderIssues}
        analysis={systemDesignAnalysis}
        protectionRecommendations={protectionRecommendations}
        debugMode={debugMode}
        collapsed={rightCollapsed}
        onToggleCollapsed={() => setRightCollapsed((collapsed) => !collapsed)}
        onUpdateLabel={handleUpdateLabel}
        onUpdatePrice={handleUpdatePrice}
        onUpdateIncludeInBom={handleUpdateIncludeInBom}
        onUpdateInstanceVoltage={handleUpdateInstanceVoltage}
        onUpdateDcBusNominalVoltage={handleUpdateDcBusNominalVoltage}
        onUpdateInstanceMaxCurrent={handleUpdateInstanceMaxCurrent}
        onUpdateAvailableFaultCurrent={handleUpdateAvailableFaultCurrent}
        onUpdateComponentMaxCableAwg={handleUpdateComponentMaxCableAwg}
        onUpdateComponentImageScale={handleUpdateComponentImageScale}
        onUpdateBusPolarity={handleUpdateBusPolarity}
        onUpdateFuseSlot={handleUpdateFuseSlot}
        onOpenFusePicker={handleOpenFusePicker}
        onRemoveFuseSlot={handleRemoveFuseSlot}
        onChangeComponentProduct={handleChangeComponentProduct}
        onUpdateCustomSolarArrayRatings={handleUpdateCustomSolarArrayRatings}
        onUpdateConnectionLength={handleUpdateConnectionLength}
        onToggleConnectionBusLink={handleToggleBusLink}
        onUpdateConnectionDesignCurrent={handleUpdateConnectionDesignCurrent}
        onUpdateConnectionCableAwg={handleUpdateConnectionCableAwg}
        onAutoConnectionCableAwg={handleAutoConnectionCableAwg}
        onUpdateConnectionCableColor={handleUpdateConnectionCableColor}
        onUpdateConnectionCableType={handleUpdateConnectionCableType}
        onUpdateConnectionCableMode={handleUpdateConnectionCableMode}
        onUpdateConnectionPremanufacturedCable={handleUpdateConnectionPremanufacturedCable}
        onUpdateConfiguredProtocol={handleUpdateConfiguredProtocol}
        onUpdateSourceType={handleUpdateSourceType}
        onUpdateBreakerConfiguration={handleUpdateBreakerConfiguration}
        onResetConnectionRoute={handleResetConnectionRoute}
        onUpdateTextAnnotation={handleUpdateTextAnnotation}
        onUpdateShapeAnnotation={handleUpdateShapeAnnotation}
        onRemoveComponent={handleRemoveComponent}
        onRemoveConnection={handleRemoveConnection}
        onRemoveAnnotation={handleRemoveAnnotation}
        onSelectComponent={handleFocusComponent}
        onSelectConnection={handleFocusConnection}
      />

      <footer className="app-footer" aria-label="Design disclaimer">
        <span className="app-footer-mark" aria-hidden="true" />
        <span>Preliminary design aid &mdash; not certified engineering</span>
        <span className="app-footer-context">Internal working copy</span>
      </footer>

      {shareToast && (
        <div className="share-toast" role="status">
          {shareToast}
        </div>
      )}

      {appDialog && (
        <AppDialog request={appDialog} onClose={() => setAppDialog(null)} />
      )}

      {startupModalOpen && (
        <StartupModal
          hasCachedSystem={hasCachedSystem}
          onResume={() => setStartupModalOpen(false)}
          onNewSystem={() => handleNewSystemSelect(null)}
          onLoadFromFile={() => {
            setStartupModalOpen(false);
            loadFileInputRef.current?.click();
          }}
          onLoadPreset={() => {
            setStartupModalOpen(false);
            setNewSystemModalOpen(true);
          }}
          onDismiss={() => setStartupModalOpen(false)}
        />
      )}

      {newSystemModalOpen && (
        <NewSystemModal
          onSelect={handleNewSystemSelect}
          onClose={() => setNewSystemModalOpen(false)}
        />
      )}

      {bomModalOpen && (
        <BomSummaryModal
          bomRows={bomRows}
          cableSummary={cableSummary}
          cableBomRows={cableBomRows}
          connectorSummary={connectorSummary}
          priceSummary={priceSummary}
          electricalSummary={electricalSummary}
          onToggleBusLink={handleToggleBusLink}
          onToggleIncludeInBOM={handleToggleConnectionIncludeInBOM}
          onClose={() => setBomModalOpen(false)}
          onExportCsv={handleExportCsv}
        />
      )}

      {pendingProtectionInsert && (
        <InlineFuseInsertModal
          recommendation={pendingProtectionInsert.recommendation}
          products={PRODUCT_MAP}
          systemVoltage={(() => {
            const voltageV = systemDesignAnalysis.connections[pendingProtectionInsert.recommendation.connectionId]?.voltageV;
            return voltageV === 12 || voltageV === 24 || voltageV === 48 ? voltageV : system.nominalVoltage;
          })()}
          onCancel={() => setPendingProtectionInsert(null)}
          onConfirm={handleConfirmInlineProtection}
        />
      )}

      {fusePickerSlot && (() => {
        const holderComp = system.components.find((c) => c.id === fusePickerSlot.componentId);
        const holderProduct = holderComp ? PRODUCT_MAP.get(holderComp.productId) : undefined;
        const slot = holderProduct?.distributionTopology?.fuseSlots?.find((s) => s.id === fusePickerSlot.slotId);
        if (!holderComp || !holderProduct || !slot) {
          setFusePickerSlot(null);
          return null;
        }
        const fuseStyle = slot.fuseStyle ?? 'Fuse';
        const currentState = holderComp.fuseSlots?.[slot.id];
        return (
          <FusePickerModal
            fuseStyle={fuseStyle}
            maxFuseA={slot.maxFuseA}
            currentFuseProductId={currentState?.fuseProductId}
            products={PRODUCT_MAP}
            onConfirm={handleFusePickerConfirm}
            onCancel={() => setFusePickerSlot(null)}
            onSkip={handleFusePickerSkip}
            onRemove={() => handleRemoveFuseSlot(fusePickerSlot.componentId, fusePickerSlot.slotId)}
          />
        );
      })()}

      {/* Load System Modal */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div
            ref={loadModalRef}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="load-system-dialog-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-title" id="load-system-dialog-title">Load Saved System</div>
            {savedSystems.length === 0 ? (
              <div style={{ color: '#6d7b90', fontSize: 12 }}>No saved systems found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {savedSystems.map((s) => (
                  <button
                    key={s.id}
                    className="modal-system-btn"
                    onClick={() => handleLoadSystem(s)}
                  >
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <span style={{ color: '#6d7b90', fontSize: 12 }}>
                      {s.nominalVoltage}V - {s.components.length} components - {new Date(s.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button className="btn-header" style={{ marginTop: 12 }} onClick={() => setShowLoadModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
    <PrintView
      system={system}
      products={PRODUCT_MAP}
      busColors={busColors}
      bomRows={bomRows}
      electricalSummary={electricalSummary}
      priceSummary={priceSummary}
    />
    </>
  );
}
