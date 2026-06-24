import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, ProductType, TerminalDefinition } from '../types/system';
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
    setProduct(prev => ({
      ...prev,
      terminals: (prev.terminals ?? []).map((t: TerminalDefinition) =>
        t.id === id ? { ...t, ...changes } : t
      ),
    }));
    setIsDirty(true);
  }, []);

  const removeTerminal = useCallback((id: string) => {
    setProduct(prev => ({
      ...prev,
      terminals: (prev.terminals ?? []).filter((t: TerminalDefinition) => t.id !== id),
    }));
    if (selectedTerminalId === id) setSelectedTerminalId(null);
    setIsDirty(true);
  }, [selectedTerminalId]);

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
  const width = Number(product.width) || 120;
  const height = Number(product.height) || 80;

  // Resolve display image: explicit imageUrl first, then auto-detect by manufacturer/type
  const displayImageUrl = useMemo(() => {
    if (product.id && product.productType) {
      return getProductDisplayImageUrl(product as Product);
    }
    return product.imageUrl;
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

      {/* Sidebar */}
      <Sidebar
        products={productList}
        currentId={currentId}
        onSelect={handleSelectProduct}
        onNew={handleNew}
      />

      {/* Main */}
      <div className="pb-main">

        {/* Left: form + terminal editor when active */}
        <div className="pb-form-col">
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
          {selectedTerminal && (
            <TerminalEditorPanel
              terminal={selectedTerminal}
              onChange={changes => updateTerminal(selectedTerminal.id, changes)}
              onDelete={() => removeTerminal(selectedTerminal.id)}
              onClose={() => setSelectedTerminalId(null)}
            />
          )}
        </div>

        {/* Right: SVG placer + terminal list — stays fully visible */}
        <div className="pb-right-col">

          {/* SVG + terminal placer */}
          <div className="pb-section">
            <div className="pb-section-header">
              <span>Visual / Terminals</span>
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
                <div className="pb-empty">No terminals — click the canvas above to place one</div>
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

      {/* SVG Picker Modal */}
      {showSvgPicker && (
        <SVGPickerModal
          svgList={svgList}
          currentUrl={product.imageUrl}
          onSelect={url => { updateProduct('imageUrl', url); }}
          onClose={() => setShowSvgPicker(false)}
        />
      )}
    </div>
  );
}
