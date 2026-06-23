import { useState, useMemo, useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import type {
  FuseSlotState,
  SystemDesign,
  NominalVoltage,
  Product,
  SystemComponent,
  SystemConnection,
  SolarWiringMode,
  SystemTextAnnotation,
  SystemShapeAnnotation,
  ShapeAnnotationType,
} from './types/system';
import { ALL_PRODUCTS, getProduct } from './data/products';
import { DEFAULT_SYSTEM } from './data/defaultSystem';
import { DEFAULT_ASSUMPTIONS } from './data/electricalRules';
import { buildBom } from './utils/bomCalculations';
import { buildPriceSummary } from './utils/priceCalculations';
import { buildElectricalSummary } from './utils/systemSummary';
import { generateWarnings } from './utils/electricalCalculations';
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
import { getSolarPanelCount } from './utils/solarCalculations';
import { getEffectiveTerminal, isDynamicSingleConductorProduct } from './utils/effectiveTerminals';
import type { BusType } from './utils/electricalNetlist';
import { buildProtectionRecommendations } from './utils/protectionRecommendations';
import type { ProtectionRecommendation } from './utils/protectionRecommendations';
import { analyzeSystemCircuits } from './utils/circuitAnalysis';
import { buildCableLengthSummary, buildCableBomRows, buildConnectorSummary } from './utils/cableSummary';
import { sharedBusLinkStandard } from './utils/busLinks';
import { DEFAULT_BUS_COLORS, type BusColorMap } from './utils/busColors';
import { isVerticalOrientation } from './utils/componentOrientation';
import { clampComponentScale, componentScale, scaledProductSize } from './utils/componentScale';
import { HeaderBar } from './components/layout/HeaderBar';
import { LeftPartSidebar } from './components/layout/LeftPartSidebar';
import { RightInspector } from './components/layout/RightInspector';
import { BomSummaryModal } from './components/layout/BomSummaryModal';
import { NewSystemModal } from './components/layout/NewSystemModal';
import { StartupModal } from './components/layout/StartupModal';
import { SchematicCanvas } from './components/schematic/SchematicCanvas';
import { InlineFuseInsertModal } from './components/parts/InlineFuseInsertModal';
import {
  connectionPoints,
  getConnectionTerminalPos,
  splitPointsAtMarker,
  type PathMarker,
} from './utils/connectionGeometry';
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
    return numberedLabel(product.protectionRatings?.acDcCompatibility === 'ac' ? 'AC Breaker' : 'Breaker', components);
  }
  return product.name;
}

function inlineProtectionTerminalIds(product: Product): { inId: string; outId: string } | null {
  const powerTerminals = product.terminals.filter((terminal) => ['dc_power', 'pv_power', 'ac_power'].includes(terminal.kind));
  if (powerTerminals.length < 2) return null;

  const isInput = (id: string) => id === 'in' || id.endsWith('_in') || id.startsWith('in_');
  const isOutput = (id: string) => id === 'out' || id.endsWith('_out') || id.startsWith('out_');
  const input = powerTerminals.find((terminal) => terminal.direction === 'input') ??
    powerTerminals.find((terminal) => isInput(terminal.id));
  const output = powerTerminals.find((terminal) => terminal.direction === 'output') ??
    powerTerminals.find((terminal) => isOutput(terminal.id));

  return input && output ? { inId: input.id, outId: output.id } : null;
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

function voltageCompatible(productId: string, systemVoltage: NominalVoltage): boolean {
  const product = PRODUCT_MAP.get(productId);
  if (!product?.nominalVoltage) return true;
  const voltages = Array.isArray(product.nominalVoltage) ? product.nominalVoltage : [product.nominalVoltage];
  return voltages.includes(systemVoltage);
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
  const analysis = analyzeSystemCircuits(system, PRODUCT_MAP);

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
      };
    }),
  };
}

export function App() {
  const [system, setSystem] = useState<SystemDesign>(() => {
    const saved = loadCurrentSystem();
    return enrichConnections(withInferredConductors(withSingleComponentQuantities(saved ?? DEFAULT_SYSTEM)));
  });

  const undoStackRef = useRef<SystemDesign[]>([]);
  const redoStackRef = useRef<SystemDesign[]>([]);
  const copiedComponentRef = useRef<SystemComponent | null>(null);
  const loadFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [focusedComponentId, setFocusedComponentId] = useState<string | null>(null);
  const [focusRequestId, setFocusRequestId] = useState(0);
  const [focusedConnectionId, setFocusedConnectionId] = useState<string | null>(null);
  const [focusConnectionRequestId, setFocusConnectionRequestId] = useState(0);
  const [canvasViewportCenter, setCanvasViewportCenter] = useState({ x: 600, y: 380 });
  const [busColors, setBusColors] = useState<BusColorMap>(DEFAULT_BUS_COLORS);
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [newSystemModalOpen, setNewSystemModalOpen] = useState(false);
  const [leftDetailOpen, setLeftDetailOpen] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [pendingProtectionInsert, setPendingProtectionInsert] = useState<PendingProtectionInsert | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedSystems, setSavedSystems] = useState(() => loadSavedSystems());
  const [themeMode, setThemeMode] = useState<ThemeMode>(loadThemeMode);
  const [voltageFilter, setVoltageFilter] = useState<NominalVoltage | 'all'>(system.nominalVoltage);
  const [startupModalOpen, setStartupModalOpen] = useState(() => INITIAL_SHARE_PARAM === null);
  const [hasCachedSystem] = useState(() => loadCurrentSystem() !== null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Derived
  const bomRows = useMemo(() => buildBom(system, PRODUCT_MAP), [system]);
  const cableSummary = useMemo(() => buildCableLengthSummary(system.connections), [system.connections]);
  const cableBomRows = useMemo(() => buildCableBomRows(system, PRODUCT_MAP), [system]);
  const connectorSummary = useMemo(() => buildConnectorSummary(cableBomRows), [cableBomRows]);
  const priceSummary = useMemo(() => buildPriceSummary(bomRows), [bomRows]);
  const electricalSummary = useMemo(() => buildElectricalSummary(system, PRODUCT_MAP), [system]);
  const warnings = useMemo(() => generateWarnings(system, PRODUCT_MAP), [system]);
  const protectionRecommendations = useMemo(() => buildProtectionRecommendations(system, PRODUCT_MAP), [system]);

  // Auto-save whenever system changes (not while startup modal is open)
  useEffect(() => {
    if (startupModalOpen) return;
    const timer = setTimeout(() => saveCurrentSystem(system), 800);
    return () => clearTimeout(timer);
  }, [system, startupModalOpen]);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  // Load shared design from URL param on first mount
  useEffect(() => {
    if (!INITIAL_SHARE_PARAM) return;
    decodeShareParam(INITIAL_SHARE_PARAM).then((loaded) => {
      handleLoadSystem(loaded);
      const url = new URL(window.location.href);
      url.searchParams.delete('d');
      window.history.replaceState({}, '', url.toString());
      setShareToast('Shared design loaded — you\'re viewing a snapshot. Use Save to keep a copy.');
      setTimeout(() => setShareToast(null), 6000);
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

      return withTimestamp(enrichConnections(withInferredConductors(withSingleComponentQuantities(updater(prev)))));
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
    if (v !== 'all') {
      updateSystem((s) => ({ ...s, nominalVoltage: v }));
    }
  }, [updateSystem]);

  const handleBusColorChange = useCallback((busType: BusType, color: string) => {
    setBusColors((current) => ({ ...current, [busType]: color }));
  }, []);

  const handleResetBusColors = useCallback(() => {
    setBusColors(DEFAULT_BUS_COLORS);
  }, []);

  const handleAddProduct = useCallback((productId: string, options?: { voltageV?: number; maxCurrentA?: number }) => {
    const product = getProduct(productId);
    if (!product) return;
    if (voltageFilter !== 'all' && !voltageCompatible(productId, system.nominalVoltage)) return;

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
      includeInBom: true,
      ...(options?.voltageV != null && { instanceVoltageV: options.voltageV }),
      ...(options?.maxCurrentA != null && { instanceMaxCurrentA: options.maxCurrentA }),
    };

    updateSystem((s) => ({ ...s, components: [...s.components, comp] }), { recordHistory: true });
    setSelectedComponentId(comp.id);
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);
  }, [canvasViewportCenter.x, canvasViewportCenter.y, system.components, system.nominalVoltage, updateSystem]);

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

  const handleUpdateFuseHolder = useCallback((
    id: string,
    includeFuseHolder: boolean,
    fuseHolderProductId?: string
  ) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, includeFuseHolder, fuseHolderProductId } : c
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

  const handleUpdateSolarWiringMode = useCallback((id: string, solarWiringMode: SolarWiringMode) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) => {
        if (c.id !== id) return c;
        const product = PRODUCT_MAP.get(c.productId);
        const panelCount = product ? getSolarPanelCount(product) : 1;
        return {
          ...c,
          solarWiringMode,
          solarSeriesCount: solarWiringMode === 'parallel' ? 1 : panelCount,
          solarParallelCount: solarWiringMode === 'parallel' ? panelCount : 1,
        };
      }),
    }));
  }, [updateSystem]);

  const handleUpdateSolarConfiguration = useCallback((id: string, seriesCount: number, parallelCount: number) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id
          ? {
              ...c,
              solarSeriesCount: Math.max(1, Math.floor(seriesCount)),
              solarParallelCount: Math.max(1, Math.floor(parallelCount)),
              solarWiringMode: parallelCount > 1 && seriesCount <= 1 ? 'parallel' : 'series',
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
        alert(`Invalid connection: ${validation.message ?? 'These terminals are not compatible.'}`);
        return;
      }

      // Bolt-together busbar terminals (e.g. adjacent Lynx modules) default to a
      // cableless bus link — no cable, but still electrically continuous.
      const fromProduct = PRODUCT_MAP.get(system.components.find((c) => c.id === fromComp)?.productId ?? '');
      const toProduct = PRODUCT_MAP.get(system.components.find((c) => c.id === toComp)?.productId ?? '');
      const isBusLink = sharedBusLinkStandard(fromProduct, fromTerm, toProduct, toTerm) != null;

      const conn: SystemConnection = {
        id: genId('conn'),
        fromComponentId: fromComp,
        fromTerminalId: fromTerm,
        toComponentId: toComp,
        toTerminalId: toTerm,
        cableLengthFt: isBusLink ? 0 : system.assumptions.defaultCableLengthFt,
        busLink: isBusLink || undefined,
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

  const handleInsertProtection = useCallback((recommendation: ProtectionRecommendation, marker: PathMarker) => {
    if (recommendation.busType !== 'dc_pos' && recommendation.busType !== 'ac_line') {
      alert('Inline protection insertion is currently available for DC positive and AC line conductors.');
      return;
    }
    setPendingProtectionInsert({ recommendation, marker });
  }, []);

  const handleConfirmInlineProtection = useCallback((productId: string) => {
    const pending = pendingProtectionInsert;
    const product = getProduct(productId);
    if (!pending || !product || !['fuse', 'breaker'].includes(product.productType)) return;
    const terminalIds = inlineProtectionTerminalIds(product);
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
        label: defaultComponentLabel(product, system.components),
        quantity: 1,
        x: bounded.x,
        y: bounded.y,
        rotationDeg,
        includeInBom: true,
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
      alert('That protection device cannot be inserted into this connection with the current terminal rules.');
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
        c.id === id ? { ...c, routePoints } : c
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
        c.id === id ? { ...c, routePoints: undefined } : c
      ),
    }));
  }, [updateSystem]);

  const handleCopyComponent = useCallback((id: string) => {
    const component = system.components.find((c) => c.id === id);
    if (!component) return;
    copiedComponentRef.current = component;
  }, [system.components]);

  const handleCopySelectedComponent = useCallback(() => {
    if (!selectedComponentId) return;
    handleCopyComponent(selectedComponentId);
  }, [handleCopyComponent, selectedComponentId]);

  const handleCutComponent = useCallback((id: string) => {
    const component = system.components.find((c) => c.id === id);
    if (!component) return;
    copiedComponentRef.current = component;
    handleRemoveComponent(id);
  }, [handleRemoveComponent, system.components]);

  const handlePasteComponent = useCallback(() => {
    const source = copiedComponentRef.current;
    if (!source) return;
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
    updateSystem((s) => ({ ...s, components: [...s.components, pasted] }), { recordHistory: true });
    setSelectedComponentId(pasted.id);
    setSelectedConnectionId(null);
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

      const modifierPressed = e.ctrlKey || e.metaKey;
      if (!modifierPressed) return;

      const key = e.key.toLowerCase();
      if (key === 'c') {
        if (!selectedComponentId) return;
        e.preventDefault();
        handleCopySelectedComponent();
        return;
      }

      if (key === 'v') {
        if (!copiedComponentRef.current) return;
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
  }, [handleCopySelectedComponent, handlePasteComponent, redo, selectedComponentId, undo]);

  const handleLoadSystem = useCallback((loadedSystem: SystemDesign) => {
    const normalized = enrichConnections(withInferredConductors(withSingleComponentQuantities(loadedSystem)));
    setSystem(normalized);
    setVoltageFilter(normalized.nominalVoltage);
    saveCurrentSystem(normalized);
    setSavedSystems(loadSavedSystems());
    undoStackRef.current = [];
    redoStackRef.current = [];
    copiedComponentRef.current = null;
    setShowLoadModal(false);
    setStartupModalOpen(false);
    setSelectedComponentId(null);
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);
  }, []);

  const handleSave = useCallback(() => {
    saveCurrentSystem(system);
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
      const loadedSystem = parseSystemSaveFile(await file.text());
      handleLoadSystem(loadedSystem);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load that save file.';
      alert(message);
    }
  }, [handleLoadSystem]);

  const handleReset = useCallback(() => {
    setNewSystemModalOpen(true);
  }, []);

  const handleNewSystemSelect = useCallback((template: SystemDesign | null) => {
    setNewSystemModalOpen(false);
    setStartupModalOpen(false);
    const base = template ?? { ...DEFAULT_SYSTEM, components: [], connections: [], annotations: [] };
    const fresh = { ...base, id: genId('sys'), createdAt: new Date().toISOString() };
    const normalized = enrichConnections(withInferredConductors(withSingleComponentQuantities(fresh)));
    setSystem(normalized);
    setVoltageFilter(normalized.nominalVoltage);
    undoStackRef.current = [];
    redoStackRef.current = [];
    copiedComponentRef.current = null;
    setSelectedComponentId(null);
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);
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
        // Last resort: show the URL so the user can copy it manually
        prompt('Copy this link to share your design:', url);
      }
      setTimeout(() => setShareToast(null), 6000);
    } catch {
      setShareToast('Could not generate share link. Try the Save button to export a file instead.');
      setTimeout(() => setShareToast(null), 5000);
    }
  }, [system]);

  const handleSelectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
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
    <div
      className={`app-grid theme-${themeMode}`}
      style={{
        gridTemplateColumns: `${leftCollapsed ? '58px' : leftDetailOpen ? '460px' : '300px'} minmax(0, 1fr) ${rightCollapsed ? '58px' : '280px'}`,
      }}
    >
      <HeaderBar
        systemName={system.name}
        voltageFilter={voltageFilter}
        totalMsrp={priceSummary.totalMsrp}
        warnings={warnings}
        busColors={busColors}
        themeMode={themeMode}
        onNameChange={handleNameChange}
        onVoltageChange={handleVoltageChange}
        onBusColorChange={handleBusColorChange}
        onResetBusColors={handleResetBusColors}
        onToggleTheme={() => setThemeMode((mode) => mode === 'dark' ? 'light' : 'dark')}
        onSave={handleSave}
        onLoad={handleLoad}
        onReset={handleReset}
        onShare={handleShare}
        onOpenBom={() => setBomModalOpen(true)}
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
      />

      <main className="canvas-area">
        <SchematicCanvas
          system={system}
          products={PRODUCT_MAP}
          selectedComponentId={selectedComponentId}
          selectedConnectionId={selectedConnectionId}
          selectedAnnotationId={selectedAnnotationId}
          protectionRecommendations={protectionRecommendations}
          busColors={busColors}
          focusedComponentId={focusedComponentId}
          focusRequestId={focusRequestId}
          focusedConnectionId={focusedConnectionId}
          focusConnectionRequestId={focusConnectionRequestId}
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
          onToggleComponentLock={handleToggleComponentLock}
          onRemoveComponent={handleRemoveComponent}
          onRemoveConnection={handleRemoveConnection}
          onRemoveAnnotation={handleRemoveAnnotation}
          onMoveConnectionRoute={handleMoveConnectionRoute}
          onInsertProtection={handleInsertProtection}
          onEnterFullView={handleEnterFullView}
          onScaleComponent={handleUpdateComponentImageScale}
          onAddConnection={handleAddConnection}
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
        warnings={warnings}
        protectionRecommendations={protectionRecommendations}
        collapsed={rightCollapsed}
        onToggleCollapsed={() => setRightCollapsed((collapsed) => !collapsed)}
        onUpdateLabel={handleUpdateLabel}
        onUpdatePrice={handleUpdatePrice}
        onUpdateIncludeInBom={handleUpdateIncludeInBom}
        onUpdateFuseHolder={handleUpdateFuseHolder}
        onUpdateInstanceVoltage={handleUpdateInstanceVoltage}
        onUpdateDcBusNominalVoltage={handleUpdateDcBusNominalVoltage}
        onUpdateInstanceMaxCurrent={handleUpdateInstanceMaxCurrent}
        onUpdateComponentMaxCableAwg={handleUpdateComponentMaxCableAwg}
        onUpdateComponentImageScale={handleUpdateComponentImageScale}
        onUpdateBusPolarity={handleUpdateBusPolarity}
        onUpdateFuseSlot={handleUpdateFuseSlot}
        onChangeComponentProduct={handleChangeComponentProduct}
        onUpdateSolarWiringMode={handleUpdateSolarWiringMode}
        onUpdateSolarConfiguration={handleUpdateSolarConfiguration}
        onUpdateConnectionLength={handleUpdateConnectionLength}
        onToggleConnectionBusLink={handleToggleBusLink}
        onUpdateConnectionDesignCurrent={handleUpdateConnectionDesignCurrent}
        onUpdateConnectionCableAwg={handleUpdateConnectionCableAwg}
        onAutoConnectionCableAwg={handleAutoConnectionCableAwg}
        onUpdateConnectionCableColor={handleUpdateConnectionCableColor}
        onUpdateConnectionCableType={handleUpdateConnectionCableType}
        onResetConnectionRoute={handleResetConnectionRoute}
        onUpdateTextAnnotation={handleUpdateTextAnnotation}
        onUpdateShapeAnnotation={handleUpdateShapeAnnotation}
        onRemoveComponent={handleRemoveComponent}
        onRemoveConnection={handleRemoveConnection}
        onRemoveAnnotation={handleRemoveAnnotation}
        onSelectComponent={handleFocusComponent}
        onSelectConnection={handleFocusConnection}
      />

      {shareToast && (
        <div className="share-toast" role="status">
          {shareToast}
        </div>
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
          onClose={() => setBomModalOpen(false)}
          onExportCsv={handleExportCsv}
        />
      )}

      {pendingProtectionInsert && (
        <InlineFuseInsertModal
          recommendation={pendingProtectionInsert.recommendation}
          products={PRODUCT_MAP}
          systemVoltage={system.nominalVoltage}
          onCancel={() => setPendingProtectionInsert(null)}
          onConfirm={handleConfirmInlineProtection}
        />
      )}

      {/* Load System Modal */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Load Saved System</div>
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
                      {s.nominalVoltage}V · {s.components.length} components · {new Date(s.updatedAt).toLocaleDateString()}
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
  );
}
