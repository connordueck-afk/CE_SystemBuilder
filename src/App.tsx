import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { SystemDesign, NominalVoltage, Product, SystemComponent, SystemConnection, SolarWiringMode, SystemTextAnnotation } from './types/system';
import { ALL_PRODUCTS, getProduct } from './data/products';
import { DEFAULT_SYSTEM } from './data/defaultSystem';
import { DEFAULT_ASSUMPTIONS } from './data/electricalRules';
import { buildBom } from './utils/bomCalculations';
import { buildPriceSummary } from './utils/priceCalculations';
import { buildElectricalSummary } from './utils/systemSummary';
import { generateWarnings, enrichConnection } from './utils/electricalCalculations';
import { validateSystemConnection } from './utils/connectionRules';
import { exportBomCsv } from './utils/csvExport';
import { saveCurrentSystem, loadCurrentSystem, loadSavedSystems } from './utils/storage';
import { genId } from './utils/ids';
import { getEffectiveProductForComponent, getSolarPanelCount } from './utils/solarCalculations';
import { getEffectiveTerminal, isDynamicSingleConductorProduct } from './utils/effectiveTerminals';
import { buildElectricalNetlist } from './utils/electricalNetlist';
import type { BusType } from './utils/electricalNetlist';
import { buildProtectionRecommendations } from './utils/protectionRecommendations';
import { DEFAULT_BUS_COLORS, type BusColorMap } from './utils/busColors';
import { isVerticalOrientation } from './utils/componentOrientation';
import { HeaderBar } from './components/layout/HeaderBar';
import { LeftPartSidebar } from './components/layout/LeftPartSidebar';
import { RightInspector } from './components/layout/RightInspector';
import { BomPanel } from './components/layout/BomPanel';
import { SchematicCanvas } from './components/schematic/SchematicCanvas';
import './styles/app.css';

const PRODUCT_MAP = new Map(ALL_PRODUCTS.map((p) => [p.id, p]));
const CANVAS_WORLD_X = -600;
const CANVAS_WORLD_Y = -420;
const CANVAS_WORLD_W = 2400;
const CANVAS_WORLD_H = 1600;
const PLACEMENT_GRID = 20;
const PASTE_OFFSET = 40;
const HISTORY_LIMIT = 50;

function productFootprint(product: Product, rotationDeg = 0): { halfWidth: number; halfHeight: number } {
  const rotated = isVerticalOrientation(rotationDeg);
  const symbolWidth = rotated ? product.height : product.width;
  const symbolHeight = rotated ? product.width : product.height;

  return {
    halfWidth: symbolWidth / 2,
    halfHeight: Math.max(symbolHeight / 2, product.height / 2 + 22),
  };
}

function clampComponentPosition(
  x: number,
  y: number,
  product: Product,
  rotationDeg = 0
): { x: number; y: number } {
  const { halfWidth, halfHeight } = productFootprint(product, rotationDeg);
  return {
    x: Math.min(CANVAS_WORLD_X + CANVAS_WORLD_W - halfWidth, Math.max(CANVAS_WORLD_X + halfWidth, x)),
    y: Math.min(CANVAS_WORLD_Y + CANVAS_WORLD_H - halfHeight, Math.max(CANVAS_WORLD_Y + halfHeight, y)),
  };
}

function snapPlacement(value: number): number {
  return Math.round(value / PLACEMENT_GRID) * PLACEMENT_GRID;
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
  const getCompProduct = (compId: string) => {
    const comp = system.components.find((c) => c.id === compId);
    return comp ? getEffectiveProductForComponent(comp, PRODUCT_MAP.get(comp.productId)) : undefined;
  };
  const getComp = (compId: string) => system.components.find((c) => c.id === compId);
  const getTerminal = (compId: string, terminalId: string) => {
    const comp = getComp(compId);
    const product = comp ? getCompProduct(compId) : undefined;
    return comp && product ? getEffectiveTerminal(product, terminalId, comp) : undefined;
  };

  // First pass: enrich based on adjacent product specs
  let enriched = system.connections.map((conn) =>
    enrichConnection(
      conn,
      getCompProduct(conn.fromComponentId),
      getCompProduct(conn.toComponentId),
      system.nominalVoltage,
      system.assumptions.inverterEfficiency,
      getTerminal(conn.fromComponentId, conn.fromTerminalId),
      getTerminal(conn.toComponentId, conn.toTerminalId)
    )
  );

  const netlist = buildElectricalNetlist({ ...system, connections: enriched }, PRODUCT_MAP);

  // Second pass: use the derived netlist to fill unknown pass-through currents.
  // Known branch currents are left alone so bus totals do not overwrite individual load branches.
  enriched = enriched.map((conn) => {
    if ((conn.calculatedCurrentA ?? 0) > 0) return conn;
    const context = netlist.connectionContexts.get(conn.id);
    if (!context || context.operatingCurrentA <= 0) return conn;

    return enrichConnection(
      { ...conn, calculatedCurrentA: context.operatingCurrentA },
      getCompProduct(conn.fromComponentId),
      getCompProduct(conn.toComponentId),
      system.nominalVoltage,
      system.assumptions.inverterEfficiency,
      getTerminal(conn.fromComponentId, conn.fromTerminalId),
      getTerminal(conn.toComponentId, conn.toTerminalId),
      context.busType
    );
  });

  return { ...system, connections: enriched };
}

export function App() {
  const [system, setSystem] = useState<SystemDesign>(() => {
    const saved = loadCurrentSystem();
    return enrichConnections(withInferredConductors(withSingleComponentQuantities(saved ?? DEFAULT_SYSTEM)));
  });

  const undoStackRef = useRef<SystemDesign[]>([]);
  const redoStackRef = useRef<SystemDesign[]>([]);
  const copiedComponentRef = useRef<SystemComponent | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [focusedComponentId, setFocusedComponentId] = useState<string | null>(null);
  const [focusRequestId, setFocusRequestId] = useState(0);
  const [canvasViewportCenter, setCanvasViewportCenter] = useState({ x: 600, y: 380 });
  const [busColors, setBusColors] = useState<BusColorMap>(DEFAULT_BUS_COLORS);
  const [bomOpen, setBomOpen] = useState(true);
  const [leftDetailOpen, setLeftDetailOpen] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedSystems, setSavedSystems] = useState(() => loadSavedSystems());

  // Derived
  const bomRows = useMemo(() => buildBom(system, PRODUCT_MAP), [system]);
  const priceSummary = useMemo(() => buildPriceSummary(bomRows), [bomRows]);
  const electricalSummary = useMemo(() => buildElectricalSummary(system, PRODUCT_MAP), [system]);
  const warnings = useMemo(() => generateWarnings(system, PRODUCT_MAP), [system]);
  const protectionRecommendations = useMemo(() => buildProtectionRecommendations(system, PRODUCT_MAP), [system]);

  // Auto-save whenever system changes
  useEffect(() => {
    const timer = setTimeout(() => saveCurrentSystem(system), 800);
    return () => clearTimeout(timer);
  }, [system]);

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

  const handleVoltageChange = useCallback((v: NominalVoltage) => {
    updateSystem((s) => ({ ...s, nominalVoltage: v }));
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
    if (!voltageCompatible(productId, system.nominalVoltage)) return;

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
      label: product.name,
      quantity: 1,
      x: bounded.x,
      y: bounded.y,
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
      bold: false,
      italic: false,
      textAlign: 'left',
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
        const bounded = clampComponentPosition(c.x, c.y, product, rotationDeg);
        return { ...c, rotationDeg, x: bounded.x, y: bounded.y };
      }),
    }));
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

  const handleUpdateInstanceVoltage = useCallback((id: string, voltageV: number | undefined) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, instanceVoltageV: voltageV } : c
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

  const handleUpdateBusPolarity = useCallback((id: string, busPolarity: SystemComponent['busPolarity']) => {
    updateSystem((s) => ({
      ...s,
      components: s.components.map((c) => (c.id === id ? { ...c, busPolarity } : c)),
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

      const conn: SystemConnection = {
        id: genId('conn'),
        fromComponentId: fromComp,
        fromTerminalId: fromTerm,
        toComponentId: toComp,
        toTerminalId: toTerm,
        cableLengthFt: system.assumptions.defaultCableLengthFt,
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

  const handleUpdateAnnotation = useCallback((id: string, patch: Partial<SystemTextAnnotation>) => {
    updateSystem((s) => ({
      ...s,
      annotations: (s.annotations ?? []).map((annotation) =>
        annotation.id === id ? { ...annotation, ...patch } : annotation
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

  const handleCopySelectedComponent = useCallback(() => {
    if (!selectedComponentId) return;
    const component = system.components.find((c) => c.id === selectedComponentId);
    if (!component) return;
    copiedComponentRef.current = component;
  }, [selectedComponentId, system.components]);

  const handlePasteComponent = useCallback(() => {
    const source = copiedComponentRef.current;
    if (!source) return;
    const product = getProduct(source.productId);
    if (!product) return;

    const bounded = clampComponentPosition(
      source.x + PASTE_OFFSET,
      source.y + PASTE_OFFSET,
      product,
      source.rotationDeg
    );
    const pasted: SystemComponent = {
      ...source,
      id: genId('comp'),
      label: source.label ? `${source.label} Copy` : `${product.name} Copy`,
      x: bounded.x,
      y: bounded.y,
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

  const handleSave = useCallback(() => {
    saveCurrentSystem(system);
    setSavedSystems(loadSavedSystems());
    alert(`System "${system.name}" saved.`);
  }, [system]);

  const handleLoad = useCallback(() => {
    setSavedSystems(loadSavedSystems());
    setShowLoadModal(true);
  }, []);

  const handleLoadSystem = useCallback((s: SystemDesign) => {
    setSystem(enrichConnections(withInferredConductors(withSingleComponentQuantities(s))));
    undoStackRef.current = [];
    redoStackRef.current = [];
    copiedComponentRef.current = null;
    setShowLoadModal(false);
    setSelectedComponentId(null);
    setSelectedConnectionId(null);
    setSelectedAnnotationId(null);
  }, []);

  const handleReset = useCallback(() => {
    if (confirm('Reset to the default 12V sample system? Unsaved changes will be lost.')) {
      const fresh = { ...DEFAULT_SYSTEM, id: genId('sys'), createdAt: new Date().toISOString() };
      setSystem(enrichConnections(withInferredConductors(withSingleComponentQuantities(fresh))));
      undoStackRef.current = [];
      redoStackRef.current = [];
      copiedComponentRef.current = null;
      setSelectedComponentId(null);
      setSelectedConnectionId(null);
      setSelectedAnnotationId(null);
    }
  }, []);

  const handleExportCsv = useCallback(() => {
    exportBomCsv(bomRows, system.name);
  }, [bomRows, system.name]);

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

  return (
    <div
      className="app-grid"
      style={{ gridTemplateColumns: `${leftCollapsed ? '58px' : leftDetailOpen ? '460px' : '300px'} minmax(0, 1fr) 280px ${bomOpen ? '320px' : '28px'}` }}
    >
      <HeaderBar
        systemName={system.name}
        nominalVoltage={system.nominalVoltage}
        totalMsrp={priceSummary.totalMsrp}
        warnings={warnings}
        busColors={busColors}
        onNameChange={handleNameChange}
        onVoltageChange={handleVoltageChange}
        onBusColorChange={handleBusColorChange}
        onResetBusColors={handleResetBusColors}
        onSave={handleSave}
        onLoad={handleLoad}
        onReset={handleReset}
        onExportCsv={handleExportCsv}
      />

      <LeftPartSidebar
        systemVoltage={system.nominalVoltage}
        onAddProduct={handleAddProduct}
        onAddTextAnnotation={handleAddTextAnnotation}
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
          onViewportCenterChange={setCanvasViewportCenter}
          onSelectComponent={handleSelectComponent}
          onSelectConnection={handleSelectConnection}
          onSelectAnnotation={handleSelectAnnotation}
          onMoveComponent={handleMoveComponent}
          onMoveAnnotation={handleMoveAnnotation}
          onResizeAnnotation={handleResizeAnnotation}
          onRotateComponent={handleRotateComponent}
          onRemoveComponent={handleRemoveComponent}
          onRemoveConnection={handleRemoveConnection}
          onRemoveAnnotation={handleRemoveAnnotation}
          onMoveConnectionRoute={handleMoveConnectionRoute}
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
        onUpdateLabel={handleUpdateLabel}
        onUpdatePrice={handleUpdatePrice}
        onUpdateInstanceVoltage={handleUpdateInstanceVoltage}
        onUpdateInstanceMaxCurrent={handleUpdateInstanceMaxCurrent}
        onUpdateBusPolarity={handleUpdateBusPolarity}
        onUpdateSolarWiringMode={handleUpdateSolarWiringMode}
        onUpdateSolarConfiguration={handleUpdateSolarConfiguration}
        onUpdateConnectionLength={handleUpdateConnectionLength}
        onUpdateConnectionCableAwg={handleUpdateConnectionCableAwg}
        onAutoConnectionCableAwg={handleAutoConnectionCableAwg}
        onResetConnectionRoute={handleResetConnectionRoute}
        onUpdateAnnotation={handleUpdateAnnotation}
        onRemoveComponent={handleRemoveComponent}
        onRemoveConnection={handleRemoveConnection}
        onRemoveAnnotation={handleRemoveAnnotation}
        onSelectComponent={handleFocusComponent}
        onSelectConnection={handleSelectConnection}
      />

      <BomPanel
        bomRows={bomRows}
        priceSummary={priceSummary}
        electricalSummary={electricalSummary}
        isOpen={bomOpen}
        onToggle={() => setBomOpen((v) => !v)}
        onExportCsv={handleExportCsv}
      />

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
                    <span style={{ color: '#6d7b90', fontSize: 10 }}>
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
