import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, ProductType, TerminalDefinition, ProductCommunicationPort } from '../types/system';
import { getProductDisplayImageUrl } from '../utils/productImages';
import { Sidebar } from './components/Sidebar';
import { CoreFieldsForm } from './components/CoreFieldsForm';
import { RatingsForm } from './components/RatingsForm';
import { TerminalPlacer } from './components/TerminalPlacer';
import { TerminalEditorPanel } from './components/TerminalEditorPanel';
import { SVGPickerModal } from './components/SVGPickerModal';

// ---- Types ----

interface ProductListEntry { id: string; subdir: string; }
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ---- Type → catalog subdirectory ----

const TYPE_TO_SUBDIR: Partial<Record<ProductType, string>> = {
  battery: 'batteries',
  mppt: 'mppts',
  inverter_charger: 'inverter-chargers',
  dc_dc_charger: 'dc-dc-chargers',
  shore_charger: 'ac-chargers',
  solar_array: 'solar',
  solar_combiner: 'solar',
  pvCombinerBox: 'solar',
  dc_distribution: 'distribution',
  busbar: 'distribution',
  ac_distribution: 'distribution',
  fuse: 'protection',
  breaker: 'protection',
  transferSwitch: 'protection',
  dcDisconnect: 'protection',
  acDisconnect: 'protection',
  monitor: 'monitoring',
  batteryMonitor: 'monitoring',
  dc_load: 'accessories',
  ac_load: 'accessories',
  accessory: 'accessories',
  converter: 'accessories',
  relay: 'accessories',
  contactor: 'accessories',
  shorePowerInlet: 'accessories',
  cable: 'accessories',
  commAccessory: 'communication',
  commGateway: 'communication',
  connection_point: 'connection-points',
};

// ---- Default new product ----

function newProduct(): Partial<Product> {
  return {
    id: '',
    manufacturer: '',
    name: '',
    productType: undefined,
    width: 120,
    height: 80,
    terminals: [],
    dataQuality: 'partial',
    isBOMItem: true,
    isVirtual: false,
  };
}

// ---- Default new terminal ----

function newTerminal(offsetX: number, offsetY: number): TerminalDefinition {
  return {
    id: `terminal_${Date.now()}`,
    label: '',
    kind: 'dc_power',
    role: 'bidirectional',
    side: 'top',
    offsetX,
    offsetY,
  };
}

// ---- Terminal dot color (matches TerminalPlacer) ----

const KIND_COLORS: Record<string, string> = {
  dc_power: '#f2994a',
  pv_power: '#f2c94c',
  ac_power: '#4f8ef7',
  signal: '#6fcf97',
  network: '#bb6bd9',
  chassis_ground: '#828282',
  generic: '#bdbdbd',
};

// ---- API helpers ----

async function fetchProductList(): Promise<ProductListEntry[]> {
  const r = await fetch('/__dev/products/list');
  return r.json();
}

async function fetchSvgList(): Promise<string[]> {
  const r = await fetch('/__dev/products/svgs');
  return r.json();
}

async function loadProductFile(id: string, subdir: string): Promise<Product> {
  // Use Vite's dev server to dynamically import and evaluate the TS file
  const url = `/src/data/products/catalog/${subdir}/${id}.ts?t=${Date.now()}`;
  const mod = await import(/* @vite-ignore */ url);
  return mod.default as Product;
}

async function uploadSvg(filename: string, subdir: string, content: string): Promise<string> {
  const r = await fetch('/__dev/products/upload-svg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, subdir, content }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error ?? 'Upload failed');
  return data.path as string;
}

async function saveProduct(id: string, subdir: string, product: Partial<Product>): Promise<void> {
  const r = await fetch('/__dev/products/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, subdir, product }),
  });
  if (!r.ok) {
    const { error } = await r.json();
    throw new Error(error ?? 'Save failed');
  }
}

// ---- App ----

export function ProductBuilderApp() {
  const [productList, setProductList] = useState<ProductListEntry[]>([]);
  const [svgList, setSvgList] = useState<string[]>([]);
  const [product, setProduct] = useState<Partial<Product>>(newProduct());
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [currentSubdir, setCurrentSubdir] = useState<string>('batteries');
  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(null);
  const [showSvgPicker, setShowSvgPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'core' | 'visual'>('core');

  // Load product list and SVG list on mount
  useEffect(() => {
    fetchProductList().then(setProductList).catch(console.error);
    fetchSvgList().then(setSvgList).catch(console.error);
  }, []);

  // ---- Product update helpers ----

  const updateProduct = useCallback((key: keyof Product, value: unknown) => {
    setProduct(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  const updateRatings = useCallback((ratingsKey: string, field: string, value: unknown) => {
    setProduct(prev => {
      const existing = (prev as Record<string, unknown>)[ratingsKey] as Record<string, unknown> ?? {};
      return { ...prev, [ratingsKey]: { ...existing, [field]: value } };
    });
    setIsDirty(true);
  }, []);

  // When product type changes, update the subdir
  const handleTypeChange = useCallback((key: keyof Product, value: unknown) => {
    updateProduct(key, value);
    const subdir = TYPE_TO_SUBDIR[value as ProductType];
    if (subdir) setCurrentSubdir(subdir);
  }, [updateProduct]);

  // ---- Terminal helpers ----

  const terminals = (product.terminals ?? []) as TerminalDefinition[];

  const addTerminal = useCallback((offsetX: number, offsetY: number) => {
    const t = newTerminal(offsetX, offsetY);
    setProduct(prev => ({ ...prev, terminals: [...(prev.terminals ?? []), t] }));
    setSelectedTerminalId(t.id);
    setIsDirty(true);
  }, []);

  const updateTerminal = useCallback((id: string, changes: Partial<TerminalDefinition>) => {
    const renamedTo = changes.id && changes.id !== id ? changes.id : undefined;
    setProduct(prev => {
      const terminals = (prev.terminals ?? []).map((t: TerminalDefinition) =>
        t.id === id ? { ...t, ...changes } : t
      );
      // Keep a matching communication port's id in sync when the terminal is renamed.
      const communicationPorts = renamedTo && prev.communicationPorts
        ? prev.communicationPorts.map(p => (p.id === id ? { ...p, id: renamedTo } : p))
        : prev.communicationPorts;
      return { ...prev, terminals, communicationPorts };
    });
    if (renamedTo && selectedTerminalId === id) setSelectedTerminalId(renamedTo);
    setIsDirty(true);
  }, [selectedTerminalId]);

  const removeTerminal = useCallback((id: string) => {
    setProduct(prev => {
      const communicationPorts = prev.communicationPorts?.filter(p => p.id !== id);
      return {
        ...prev,
        terminals: (prev.terminals ?? []).filter((t: TerminalDefinition) => t.id !== id),
        communicationPorts: communicationPorts?.length ? communicationPorts : undefined,
      };
    });
    if (selectedTerminalId === id) setSelectedTerminalId(null);
    setIsDirty(true);
  }, [selectedTerminalId]);

  // Upsert (changes) or remove (null) the communication port matched to a terminal by id.
  const upsertCommPort = useCallback((portId: string, changes: Partial<ProductCommunicationPort> | null) => {
    setProduct(prev => {
      const ports = (prev.communicationPorts ?? []) as ProductCommunicationPort[];
      let next: ProductCommunicationPort[];
      if (changes === null) {
        next = ports.filter(p => p.id !== portId);
      } else if (ports.some(p => p.id === portId)) {
        next = ports.map(p => (p.id === portId ? { ...p, ...changes } : p));
      } else {
        const term = (prev.terminals ?? []).find((t: TerminalDefinition) => t.id === portId);
        next = [...ports, {
          id: portId,
          name: term?.label || portId,
          connectorType: 'RJ45',
          supportedProtocols: [],
          ...changes,
        } as ProductCommunicationPort];
      }
      return { ...prev, communicationPorts: next.length ? next : undefined };
    });
    setIsDirty(true);
  }, []);

  // ---- Import an SVG into public/product-images and select it ----

  const handleImportSvg = useCallback(async (file: File, subdir: string): Promise<void> => {
    const content = await file.text();
    const rel = await uploadSvg(file.name, subdir, content);
    const list = await fetchSvgList();
    setSvgList(list);
    updateProduct('imageUrl', `/product-images/${rel}`);
  }, [updateProduct]);

  // ---- Load existing product ----

  const handleSelectProduct = useCallback(async (id: string, subdir: string) => {
    if (isDirty && !confirm(`Discard unsaved changes to "${currentId}"?`)) return;
    try {
      const p = await loadProductFile(id, subdir);
      setProduct(p);
      setCurrentId(id);
      setCurrentSubdir(subdir);
      setSelectedTerminalId(null);
      setIsDirty(false);
      setSaveStatus('idle');
    } catch (e) {
      alert(`Failed to load product: ${e}`);
    }
  }, [isDirty, currentId]);

  // ---- New product ----

  const handleNew = useCallback(() => {
    if (isDirty && !confirm(`Discard unsaved changes to "${currentId}"?`)) return;
    setProduct(newProduct());
    setCurrentId(undefined);
    setCurrentSubdir('batteries');
    setSelectedTerminalId(null);
    setIsDirty(false);
    setSaveStatus('idle');
  }, [isDirty, currentId]);

  // ---- Save ----

  const handleSave = useCallback(async () => {
    const id = product.id?.trim();
    if (!id) { alert('Product ID is required'); return; }
    if (!product.productType) { alert('Product Type is required'); return; }
    if (!product.name?.trim()) { alert('Product Name is required'); return; }

    const subdir = currentSubdir;

    setSaveStatus('saving');
    try {
      await saveProduct(id, subdir, product);
      setCurrentId(id);
      setIsDirty(false);
      setSaveStatus('saved');
      // Refresh product list
      const list = await fetchProductList();
      setProductList(list);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
      alert(`Save failed: ${e}`);
    }
  }, [product, currentSubdir]);

  // ---- Derived state ----

  const selectedTerminal = terminals.find(t => t.id === selectedTerminalId) ?? null;
  const selectedPort = selectedTerminal
    ? (product.communicationPorts ?? []).find(p => p.id === selectedTerminal.id)
    : undefined;
  const width = Number(product.width) || 120;
  const height = Number(product.height) || 80;

  // Resolve display image: an explicitly chosen imageUrl always wins in the
  // builder; otherwise fall back to manufacturer/type auto-detection.
  const displayImageUrl = useMemo(() => {
    if (product.imageUrl) return product.imageUrl;
    if (product.id && product.productType) {
      return getProductDisplayImageUrl(product as Product);
    }
    return undefined;
  }, [product]);

  const statusLabel = saveStatus === 'saving' ? 'Saving…'
    : saveStatus === 'saved' ? 'Saved'
    : saveStatus === 'error' ? 'Error'
    : isDirty ? 'Unsaved'
    : currentId ? 'Up to date'
    : 'New product';

  const statusClass = saveStatus === 'saved' ? 'saved'
    : saveStatus === 'error' ? 'error'
    : saveStatus === 'saving' ? 'saving'
    : isDirty ? 'unsaved'
    : 'saved';

  return (
    <div className="pb-shell">

      {/* Header */}
      <header className="pb-header">
        <span className="pb-header-title">CE Product Builder</span>
        <span className="pb-header-id">
          {currentId
            ? `${currentSubdir}/${currentId}.ts`
            : '(new product)'}
        </span>
        <span className={`pb-header-status ${statusClass}`}>{statusLabel}</span>
        <button
          className="pb-btn pb-btn-primary"
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          Save
        </button>
      </header>

      {/* Body: sidebar + main */}
      <div className="pb-body">

      <Sidebar
        products={productList}
        currentId={currentId}
        onSelect={handleSelectProduct}
        onNew={handleNew}
      />

      {/* Main */}
      <div className="pb-main">

        {/* Tab bar */}
        <div className="pb-tabs">
          <button
            className={`pb-tab${activeTab === 'core' ? ' active' : ''}`}
            onClick={() => setActiveTab('core')}
          >
            Core Features
          </button>
          <button
            className={`pb-tab${activeTab === 'visual' ? ' active' : ''}`}
            onClick={() => setActiveTab('visual')}
          >
            Image &amp; Terminals
          </button>
        </div>

        {/* Tab content — scrollable */}
        <div className="pb-tab-content">

          {activeTab === 'core' && (
            <>
              <CoreFieldsForm
                product={product}
                onChange={(key, value) => {
                  if (key === 'productType') {
                    handleTypeChange(key, value);
                  } else {
                    updateProduct(key, value);
                  }
                }}
              />
              <RatingsForm
                productType={product.productType as ProductType | undefined}
                product={product}
                onRatingsChange={updateRatings}
              />
            </>
          )}

          {activeTab === 'visual' && (
            <div className="pb-visual-split">

              {/* Left column: image / terminal placer */}
              <div className="pb-visual-col">
                <div className="pb-section">
                  <div className="pb-section-header">
                    <span>Image</span>
                    <button
                      className="pb-btn pb-btn-ghost pb-btn-sm"
                      onClick={() => setShowSvgPicker(true)}
                    >
                      Pick SVG
                    </button>
                  </div>
                  <div className="pb-section-body" style={{ alignItems: 'center' }}>
                    <TerminalPlacer
                      width={width}
                      height={height}
                      imageUrl={displayImageUrl}
                      terminals={terminals}
                      selectedId={selectedTerminalId}
                      onPlaceTerminal={addTerminal}
                      onSelectTerminal={setSelectedTerminalId}
                      onMoveTerminal={(id, x, y) => updateTerminal(id, { offsetX: x, offsetY: y })}
                    />
                    <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
                      Click canvas to add terminal · drag dots to reposition
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: terminal editor + list */}
              <div className="pb-visual-col">
                {/* Terminal editor — shown when a terminal is selected */}
                {selectedTerminal && (
                  <TerminalEditorPanel
                    terminal={selectedTerminal}
                    port={selectedPort}
                    onChange={changes => updateTerminal(selectedTerminal.id, changes)}
                    onPortChange={changes => upsertCommPort(selectedTerminal.id, changes)}
                    onDelete={() => removeTerminal(selectedTerminal.id)}
                    onClose={() => setSelectedTerminalId(null)}
                  />
                )}

                {/* Terminal list */}
                <div className="pb-section">
                  <div className="pb-section-header">
                    <span>Terminals ({terminals.length})</span>
                    <button
                      className="pb-btn pb-btn-ghost pb-btn-sm"
                      onClick={() => addTerminal(0, 0)}
                    >
                      + Add
                    </button>
                  </div>
                  <div className="pb-section-body" style={{ gap: 4 }}>
                    {terminals.length === 0 && (
                      <div className="pb-empty">No terminals — click the canvas to place one</div>
                    )}
                    {terminals.map(t => (
                      <div
                        key={t.id}
                        className={`pb-terminal-row${t.id === selectedTerminalId ? ' selected' : ''}`}
                        onClick={() => setSelectedTerminalId(t.id === selectedTerminalId ? null : t.id)}
                      >
                        <div
                          className="pb-terminal-dot-inline"
                          style={{ background: KIND_COLORS[t.kind] ?? '#bdbdbd' }}
                        />
                        <div className="pb-terminal-info">
                          <div className="pb-terminal-id">{t.id}</div>
                          <div className="pb-terminal-meta">
                            {t.kind} · {t.side} · ({t.offsetX}, {t.offsetY})
                          </div>
                        </div>
                        <button
                          className="pb-btn pb-btn-danger pb-btn-sm"
                          onClick={e => { e.stopPropagation(); removeTerminal(t.id); }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* SVG Picker Modal */}
      {showSvgPicker && (
        <SVGPickerModal
          svgList={svgList}
          currentUrl={product.imageUrl}
          onSelect={url => { updateProduct('imageUrl', url); }}
          onImport={handleImportSvg}
          onClose={() => setShowSvgPicker(false)}
        />
      )}
      </div>
    </div>
  );
}
