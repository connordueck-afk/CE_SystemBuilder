import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  Product, ProductType, TerminalDefinition, ProductCommunicationPort, ProductPort,
  PortKind, PortTopology, TerminalGroupDefinition, TerminalGroupType,
  ConnectionPointKind, ConnectionPolarity, ConnectionRole, TerminalDirection, VoltageClass,
} from '../types/system';
import { getProductDisplayImageUrl } from '../utils/productImages';
import { terminalKind, portKindToTerminalKind } from '../utils/portSpecs';
import { validateProduct } from '../data/products/helpers/validation';

/** The terminal-group type implied by a port's kind (groups inherit their port's medium). */
function groupTypeForPortKind(portKind: PortKind | undefined): TerminalGroupType {
  if (portKind === 'comm') return 'communication_interface';
  if (portKind === 'signal') return 'signal_interface';
  if (portKind === 'ground') return 'ground_reference';
  return 'power_conductor';
}
import { Sidebar } from './components/Sidebar';
import { CoreFieldsForm } from './components/CoreFieldsForm';
import { RatingsForm } from './components/RatingsForm';
import { TerminalPlacer } from './components/TerminalPlacer';
import { TerminalEditorPanel } from './components/TerminalEditorPanel';
import { SVGPickerModal } from './components/SVGPickerModal';
import { VariantsForm } from './components/VariantsForm';
import { CollapsibleSection } from './components/CollapsibleSection';

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
  custom_solar_array: 'solar',
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
  // Kind is owned by the terminal group's port now, so a new terminal carries no kind —
  // it inherits one once assigned to a terminal group (see addTerminal). Role is
  return {
    id: `terminal_${Date.now()}`,
    label: '',
    side: 'top',
    offsetX,
    offsetY,
  };
}

// ---- Port (internal circuit) editor ----

const PORT_KINDS: PortKind[] = ['dc', 'ac', 'pv', 'comm', 'ground', 'signal', 'generic'];
const PORT_TOPOLOGIES: PortTopology[] = ['two_pole', 'bus', 'pass_through'];
const PORT_ROLES: ConnectionRole[] = ['source', 'sink', 'bidirectional', 'pass_through', 'bus', 'sense', 'control'];
const PORT_DIRECTIONS: TerminalDirection[] = ['input', 'output', 'bidirectional'];
const VOLTAGE_CLASSES: VoltageClass[] = ['dc_low_voltage', 'pv_high_voltage', 'ac_120v', 'ac_240v', 'signal_low_voltage'];
const POLARITIES: ConnectionPolarity[] = ['positive', 'negative', 'line', 'line2', 'neutral', 'ground'];

function PortEditor({ port, onChange, onRemove }: {
  port: ProductPort;
  onChange: (changes: Partial<ProductPort>) => void;
  onRemove: () => void;
}) {
  // Buffer the id so intermediate keystrokes don't temporarily collide with another port.
  const [draftId, setDraftId] = useState(port.id);
  useEffect(() => { setDraftId(port.id); }, [port.id]);
  const commitId = () => {
    const trimmed = draftId.trim();
    if (!trimmed) setDraftId(port.id);
    else if (trimmed !== port.id) onChange({ id: trimmed });
  };

  const num = (key: keyof ProductPort, label: string) => (
    <div className="pb-field" style={{ flex: 1 }}>
      <label>{label}</label>
      <input
        type="number"
        value={(port[key] as number | undefined) ?? ''}
        min={0}
        onChange={e => onChange({ [key]: e.target.value === '' ? undefined : Number(e.target.value) } as Partial<ProductPort>)}
        placeholder="—"
      />
    </div>
  );

  const kind = port.kind ?? 'dc';
  const isComm = kind === 'comm';
  const currentField = (
    <div className="pb-field" style={{ flex: 1 }}>
      <label>Max Current (A)</label>
      <input
        type="number"
        value={port.maxCurrentA ?? ''}
        min={0}
        onChange={e => onChange({ maxCurrentA: e.target.value === '' ? undefined : Number(e.target.value) })}
        placeholder="—"
      />
    </div>
  );

  return (
    <CollapsibleSection
      className="pb-inline-section"
      title={port.label ? `${port.id} (${port.label})` : port.id}
      actions={<button className="pb-btn pb-btn-danger pb-btn-sm" onClick={onRemove}>x</button>}
      bodyStyle={{ gap: 6 }}
    >
      <div className="pb-field-row" style={{ alignItems: 'flex-end' }}>
        <div className="pb-field" style={{ flex: 1 }}>
          <label>Port ID</label>
          <input
            value={draftId}
            onChange={e => setDraftId(e.target.value)}
            onBlur={commitId}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitId(); } }}
            placeholder="main"
          />
        </div>
        <div className="pb-field" style={{ flex: 1 }}>
          <label>Label</label>
          <input value={port.label ?? ''} onChange={e => onChange({ label: e.target.value || undefined })} placeholder="Battery" />
        </div>
      </div>

      <div className="pb-field-row">
        <div className="pb-field" style={{ flex: 1 }}>
          <label>Kind</label>
          <select value={kind} onChange={e => onChange({ kind: e.target.value as PortKind })}>
            {PORT_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        {!isComm && (
          <div className="pb-field" style={{ flex: 1 }}>
            <label>Topology</label>
            <select value={port.topology ?? ''} onChange={e => onChange({ topology: (e.target.value || undefined) as PortTopology | undefined })}>
              <option value="">—</option>
              {PORT_TOPOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="pb-field-row">
        <div className="pb-field" style={{ flex: 1 }}>
          <label>Role</label>
          <select value={port.role ?? ''} onChange={e => onChange({ role: (e.target.value || undefined) as ConnectionRole | undefined })}>
            <option value="">—</option>
            {PORT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="pb-field" style={{ flex: 1 }}>
          <label>Direction</label>
          <select value={port.direction ?? ''} onChange={e => onChange({ direction: (e.target.value || undefined) as TerminalDirection | undefined })}>
            <option value="">—</option>
            {PORT_DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Service: the port owns the voltage class (compatibility band) for all its terminals. */}
      {!isComm && (
        <div className="pb-field-row">
          <div className="pb-field" style={{ flex: 1 }}>
            <label>Voltage Class</label>
            <select value={port.voltageClass ?? ''} onChange={e => onChange({ voltageClass: (e.target.value || undefined) as VoltageClass | undefined })}>
              <option value="">—</option>
              {VOLTAGE_CLASSES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Kind-specific electrical specs */}
      {kind === 'dc' && (
        <div className="pb-field-row">{num('nominalVoltageV', 'Nominal V')}{num('voltageMinV', 'Min V')}{num('voltageMaxV', 'Max V')}{currentField}</div>
      )}
      {kind === 'ac' && (
        <div className="pb-field-row">{num('nominalVoltageV', 'Nominal V')}
          <div className="pb-field" style={{ flex: 1 }}>
            <label>Phases</label>
            <select value={port.phases ?? ''} onChange={e => onChange({ phases: (e.target.value ? Number(e.target.value) : undefined) as 1 | 2 | 3 | undefined })}>
              <option value="">—</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
            </select>
          </div>
          {currentField}
        </div>
      )}
      {kind === 'pv' && (
        <div className="pb-field-row">{num('voltageMaxV', 'Max V (Voc)')}{num('maxCurrentA', 'Max A (Isc)')}{num('maxPowerW', 'Max W')}</div>
      )}
      {(kind === 'ground' || kind === 'signal' || kind === 'generic') && (
        <div className="pb-field-row">{num('nominalVoltageV', 'Nominal V')}{currentField}</div>
      )}
      {isComm && (
        <div className="pb-empty">
          A comm port is a logical interface — protocols live here, but the physical connector
          (RJ45/M12/…) is set per jack on the Terminal, not on the port.
        </div>
      )}
    </CollapsibleSection>
  );
}

// ---- Terminal group (internal common node / interface) editor ----

function TerminalGroupEditor({ group, ports, onChange, onRemove }: {
  group: TerminalGroupDefinition;
  ports: ProductPort[];
  onChange: (changes: Partial<TerminalGroupDefinition>) => void;
  onRemove: () => void;
}) {
  // Buffer the id so intermediate keystrokes don't temporarily collide with another group.
  const [draftId, setDraftId] = useState(group.id);
  useEffect(() => { setDraftId(group.id); }, [group.id]);
  const commitId = () => {
    const trimmed = draftId.trim();
    if (!trimmed) setDraftId(group.id);
    else if (trimmed !== group.id) onChange({ id: trimmed });
  };

  // Group type and kind are NOT authored — they're derived from the assigned port
  // (a group inherits its port's medium). Shown read-only.
  const assignedPort = ports.find(p => p.id === group.portId);
  const derivedGroupType = groupTypeForPortKind(assignedPort?.kind);
  const derivedKind = assignedPort?.kind ? portKindToTerminalKind(assignedPort.kind) : undefined;
  const isPower = derivedGroupType === 'power_conductor';
  const num = (key: keyof TerminalGroupDefinition, label: string) => (
    <div className="pb-field" style={{ flex: 1 }}>
      <label>{label}</label>
      <input
        type="number"
        value={(group[key] as number | undefined) ?? ''}
        min={0}
        onChange={e => onChange({ [key]: e.target.value === '' ? undefined : Number(e.target.value) } as Partial<TerminalGroupDefinition>)}
        placeholder="—"
      />
    </div>
  );

  return (
    <CollapsibleSection
      className="pb-inline-section"
      title={group.label ? `${group.id} (${group.label})` : group.id}
      actions={<button className="pb-btn pb-btn-danger pb-btn-sm" onClick={onRemove}>x</button>}
      bodyStyle={{ gap: 6 }}
    >
      <div className="pb-field-row" style={{ alignItems: 'flex-end' }}>
        <div className="pb-field" style={{ flex: 1 }}>
          <label>Group ID</label>
          <input
            value={draftId}
            onChange={e => setDraftId(e.target.value)}
            onBlur={commitId}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitId(); } }}
            placeholder="main_pos"
          />
        </div>
        <div className="pb-field" style={{ flex: 1 }}>
          <label>Label</label>
          <input value={group.label ?? ''} onChange={e => onChange({ label: e.target.value || undefined })} placeholder="DC Positive Common" />
        </div>
      </div>

      <div className="pb-field-row">
        <div className="pb-field" style={{ flex: 1 }}>
          <label>Port</label>
          <select value={group.portId ?? ''} onChange={e => onChange({ portId: e.target.value })}>
            <option value="">—</option>
            {ports.map(p => <option key={p.id} value={p.id}>{p.label ? `${p.id} (${p.label})` : p.id}</option>)}
            {group.portId && !ports.some(p => p.id === group.portId) && (
              <option value={group.portId}>{group.portId} (missing)</option>
            )}
          </select>
        </div>
        <div className="pb-field" style={{ flex: 1 }}>
          <label>Type / Kind (from port)</label>
          <input
            type="text"
            value={derivedKind ? `${derivedGroupType} · ${derivedKind}` : derivedGroupType}
            readOnly
            title="Derived from the assigned port — a group inherits its port's medium."
            style={{ opacity: 0.75, cursor: 'not-allowed' }}
          />
        </div>
      </div>

      {isPower && (
        <>
          <div className="pb-field-row" style={{ alignItems: 'flex-end' }}>
            <div className="pb-field" style={{ flex: 1 }}>
              <label>Polarity</label>
              <select value={group.polarity ?? ''} onChange={e => onChange({ polarity: (e.target.value || undefined) as ConnectionPolarity | undefined })}>
                <option value="">—</option>
                {POLARITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="pb-checkbox-row" style={{ flex: 1 }}>
              <input
                id={`grp_common_${group.id}`}
                type="checkbox"
                checked={group.internallyCommon ?? false}
                onChange={e => onChange({ internallyCommon: e.target.checked })}
              />
              <label htmlFor={`grp_common_${group.id}`}>Internally common</label>
            </div>
            {num('maxCurrentA', 'Internal Bus (A)')}
            {num('maxVoltageV', 'Max V')}
          </div>

          {/* Per-pole circuit protection — lives on the group (the protected conductor). */}
          <div className="pb-field-row" style={{ alignItems: 'flex-end' }}>
            <div className="pb-checkbox-row" style={{ flex: 1 }}>
              <input
                id={`grp_ocp_${group.id}`}
                type="checkbox"
                checked={group.requiresOvercurrentProtection ?? false}
                onChange={e => onChange({ requiresOvercurrentProtection: e.target.checked || undefined })}
              />
              <label htmlFor={`grp_ocp_${group.id}`}>Requires OCP</label>
            </div>
            <div className="pb-checkbox-row" style={{ flex: 1 }}>
              <input
                id={`grp_disc_${group.id}`}
                type="checkbox"
                checked={group.requiresDisconnect ?? false}
                onChange={e => onChange({ requiresDisconnect: e.target.checked || undefined })}
              />
              <label htmlFor={`grp_disc_${group.id}`}>Requires Disconnect</label>
            </div>
            {num('recommendedFuseA', 'Rec. Fuse (A)')}
            {num('maxFuseA', 'Max Fuse (A)')}
          </div>
        </>
      )}

      <div className="pb-field">
        <label>Notes</label>
        <input value={group.notes ?? ''} onChange={e => onChange({ notes: e.target.value || undefined })} placeholder="e.g. Four DC+ posts share one 400A internal bus" />
      </div>
    </CollapsibleSection>
  );
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
  const [svgViewBox, setSvgViewBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [svgTrim, setSvgTrim] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [svgVersion, setSvgVersion] = useState(0);
  const initialProductParamHandledRef = useRef(false);

  // Derived early so callbacks below can reference them without TDZ issues
  const width = Number(product.width) || 120;
  const height = Number(product.height) || 80;

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
    setProduct(prev => {
      // Attach to the first terminal group by default so the terminal inherits its
      // port/service immediately under the group-owned model (the author can
      // reassign it).
      const existingGroups = (prev.terminalGroups ?? []) as TerminalGroupDefinition[];
      const seeded = existingGroups.length ? { ...t, terminalGroupId: existingGroups[0].id } : t;
      return { ...prev, terminals: [...(prev.terminals ?? []), seeded] };
    });
    setSelectedTerminalId(t.id);
    setIsDirty(true);
  }, []);

  const updateTerminal = useCallback((id: string, changes: Partial<TerminalDefinition>) => {
    const renamedTo = changes.id && changes.id !== id ? changes.id : undefined;
    setProduct(prev => {
      if (renamedTo && (prev.terminals ?? []).some((t: TerminalDefinition) => t.id === renamedTo)) {
        console.warn(`[ProductBuilder] rename to "${renamedTo}" skipped — ID already in use`);
        return prev;
      }
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

  // ---- Port (internal circuit) helpers ----

  const ports = (product.ports ?? []) as ProductPort[];

  const addPort = useCallback(() => {
    setProduct(prev => {
      const existing = (prev.ports ?? []) as ProductPort[];
      // First port defaults to "main"; later ones get a unique port_N id.
      let id = existing.length === 0 ? 'main' : `port_${existing.length + 1}`;
      let n = existing.length + 1;
      while (existing.some(p => p.id === id)) { n += 1; id = `port_${n}`; }
      return { ...prev, ports: [...existing, { id, label: '', kind: 'dc', topology: 'two_pole', role: 'bidirectional', direction: 'bidirectional' }] };
    });
    setIsDirty(true);
  }, []);

  const updatePort = useCallback((id: string, changes: Partial<ProductPort>) => {
    const renamedTo = changes.id && changes.id !== id ? changes.id : undefined;
    setProduct(prev => {
      const existing = (prev.ports ?? []) as ProductPort[];
      if (renamedTo && existing.some(p => p.id === renamedTo)) {
        console.warn(`[ProductBuilder] port rename to "${renamedTo}" skipped — ID already in use`);
        return prev;
      }
      const nextPorts = existing.map(p => (p.id === id ? { ...p, ...changes } : p));
      // Cascade a port rename / kind change onto its groups, whose type derives from it.
      let terminalGroups = prev.terminalGroups;
      if (renamedTo || changes.kind !== undefined) {
        const newKind = changes.kind ?? existing.find(p => p.id === id)?.kind;
        terminalGroups = (prev.terminalGroups ?? []).map(g => (
          g.portId === id
            ? { ...g, portId: renamedTo ?? g.portId, groupType: groupTypeForPortKind(newKind) }
            : g
        ));
      }
      return { ...prev, ports: nextPorts, terminalGroups };
    });
    setIsDirty(true);
  }, []);

  const removePort = useCallback((id: string) => {
    setProduct(prev => {
      const nextPorts = ((prev.ports ?? []) as ProductPort[]).filter(p => p.id !== id);
      // Drop the portId reference from any terminal group that pointed at this port.
      const terminalGroups = (prev.terminalGroups ?? []).map((g: TerminalGroupDefinition) =>
        g.portId === id ? { ...g, portId: '' } : g
      );
      return {
        ...prev,
        ports: nextPorts.length ? nextPorts : undefined,
        terminalGroups: terminalGroups.length ? terminalGroups : undefined,
      };
    });
    setIsDirty(true);
  }, []);

  // ---- Terminal group (internal common node / interface) helpers ----

  const terminalGroups = (product.terminalGroups ?? []) as TerminalGroupDefinition[];

  const addTerminalGroup = useCallback(() => {
    setProduct(prev => {
      const existing = (prev.terminalGroups ?? []) as TerminalGroupDefinition[];
      const existingPorts = (prev.ports ?? []) as ProductPort[];
      let n = existing.length + 1;
      let id = `group_${n}`;
      while (existing.some(g => g.id === id)) { n += 1; id = `group_${n}`; }
      const port0 = existingPorts[0];
      const group: TerminalGroupDefinition = {
        id,
        portId: port0?.id ?? '',
        groupType: groupTypeForPortKind(port0?.kind),
        internallyCommon: false,
      };
      return { ...prev, terminalGroups: [...existing, group] };
    });
    setIsDirty(true);
  }, []);

  const updateTerminalGroup = useCallback((id: string, changes: Partial<TerminalGroupDefinition>) => {
    const renamedTo = changes.id && changes.id !== id ? changes.id : undefined;
    setProduct(prev => {
      const existing = (prev.terminalGroups ?? []) as TerminalGroupDefinition[];
      if (renamedTo && existing.some(g => g.id === renamedTo)) {
        console.warn(`[ProductBuilder] group rename to "${renamedTo}" skipped — ID already in use`);
        return prev;
      }
      const portsNow = (prev.ports ?? []) as ProductPort[];
      const nextGroups = existing.map(g => {
        if (g.id !== id) return g;
        const merged = { ...g, ...changes };
        // groupType/kind are derived from the assigned port — re-derive on port change.
        if (changes.portId !== undefined) {
          const port = portsNow.find(p => p.id === changes.portId);
          merged.groupType = groupTypeForPortKind(port?.kind);
        }
        return merged;
      });
      // Keep terminals' terminalGroupId references in sync when the group is renamed.
      const terminals = renamedTo
        ? (prev.terminals ?? []).map((t: TerminalDefinition) => (t.terminalGroupId === id ? { ...t, terminalGroupId: renamedTo } : t))
        : prev.terminals;
      return { ...prev, terminalGroups: nextGroups, terminals };
    });
    setIsDirty(true);
  }, []);

  const removeTerminalGroup = useCallback((id: string) => {
    setProduct(prev => {
      const nextGroups = ((prev.terminalGroups ?? []) as TerminalGroupDefinition[]).filter(g => g.id !== id);
      // Drop the terminalGroupId reference from any terminal that pointed at this group.
      const terminals = (prev.terminals ?? []).map((t: TerminalDefinition) =>
        t.terminalGroupId === id ? { ...t, terminalGroupId: undefined } : t
      );
      return { ...prev, terminalGroups: nextGroups.length ? nextGroups : undefined, terminals };
    });
    setIsDirty(true);
  }, []);

  // Resolve a terminal's electrical kind from its assigned group/port.
  const kindOf = useCallback(
    (t: TerminalDefinition): ConnectionPointKind => terminalKind(product as Product, t),
    [product]
  );

  // ---- Import an SVG into public/product-images and select it ----

  // ---- SVG crop helpers ----

  const detectViewBox = useCallback(async () => {
    if (!product.imageUrl) return;
    try {
      const base = product.imageUrl.split('?')[0];
      const res = await fetch(`${base}?t=${Date.now()}`);
      const text = await res.text();
      const vb = text.match(/viewBox=["']([^"']*)["']/i)?.[1];
      const parts = vb?.trim().split(/[\s,]+/).map(Number);
      if (parts?.length === 4 && parts.every(n => !isNaN(n))) {
        setSvgViewBox({ x: parts[0], y: parts[1], w: parts[2], h: parts[3] });
        setSvgTrim({ top: 0, right: 0, bottom: 0, left: 0 });
      } else {
        alert('No viewBox found in SVG — add a viewBox attribute to the file first.');
      }
    } catch (e) { alert(`Could not read SVG: ${e}`); }
  }, [product.imageUrl]);

  const applyTrim = useCallback(async () => {
    if (!svgViewBox || !product.imageUrl) return;
    const newVB = {
      x: svgViewBox.x + svgTrim.left,
      y: svgViewBox.y + svgTrim.top,
      w: svgViewBox.w - svgTrim.left - svgTrim.right,
      h: svgViewBox.h - svgTrim.top - svgTrim.bottom,
    };
    if (newVB.w <= 0 || newVB.h <= 0) { alert('Trim values are too large — nothing would remain.'); return; }
    try {
      const r = await fetch('/__dev/products/trim-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: product.imageUrl.split('?')[0], viewBox: newVB }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      setSvgViewBox(newVB);
      setSvgTrim({ top: 0, right: 0, bottom: 0, left: 0 });
      setSvgVersion(v => v + 1);
      updateProduct('height', Math.round(width * (newVB.h / newVB.w)));
    } catch (e) { alert(`Trim failed: ${e}`); }
  }, [svgViewBox, svgTrim, product.imageUrl, width, updateProduct]);

  // ---- Import SVG ----

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
      const raw = await loadProductFile(id, subdir);
      // Guard against duplicate terminal / port IDs — first occurrence wins.
      const seenT = new Set<string>();
      const dedupedTerminals = (raw.terminals ?? []).filter((t: TerminalDefinition) => {
        if (seenT.has(t.id)) { console.warn(`[ProductBuilder] duplicate terminal id "${t.id}" in ${id} — skipping`); return false; }
        seenT.add(t.id);
        return true;
      });
      const seenP = new Set<string>();
      const dedupedPorts = (raw.communicationPorts ?? []).filter((p: ProductCommunicationPort) => {
        if (seenP.has(p.id)) { console.warn(`[ProductBuilder] duplicate port id "${p.id}" in ${id} — skipping`); return false; }
        seenP.add(p.id);
        return true;
      });
      const p: Product = {
        ...raw,
        terminals: dedupedTerminals,
        ...(raw.communicationPorts ? { communicationPorts: dedupedPorts } : {}),
      };
      setProduct(p);
      setCurrentId(id);
      setCurrentSubdir(subdir);
      setSelectedTerminalId(null);
      setSvgViewBox(null);
      setSvgTrim({ top: 0, right: 0, bottom: 0, left: 0 });
      setSvgVersion(0);
      setIsDirty(false);
      setSaveStatus('idle');
      const url = new URL(window.location.href);
      url.searchParams.set('product', id);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    } catch (e) {
      alert(`Failed to load product: ${e}`);
    }
  }, [isDirty, currentId]);

  useEffect(() => {
    if (initialProductParamHandledRef.current || productList.length === 0) return;
    initialProductParamHandledRef.current = true;

    const requestedId = new URLSearchParams(window.location.search).get('product')?.trim();
    if (!requestedId) return;

    const match = productList.find(entry => entry.id === requestedId);
    if (!match) {
      alert(`Product Builder could not find "${requestedId}".`);
      return;
    }

    void handleSelectProduct(match.id, match.subdir);
  }, [handleSelectProduct, productList]);

  // ---- New product ----

  const handleNew = useCallback(() => {
    if (isDirty && !confirm(`Discard unsaved changes to "${currentId}"?`)) return;
    setProduct(newProduct());
    setCurrentId(undefined);
    setCurrentSubdir('batteries');
    setSelectedTerminalId(null);
    setSvgViewBox(null);
    setSvgTrim({ top: 0, right: 0, bottom: 0, left: 0 });
    setSvgVersion(0);
    setIsDirty(false);
    setSaveStatus('idle');
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [isDirty, currentId]);

  // ---- Save ----

  const handleSave = useCallback(async () => {
    const id = product.id?.trim();
    if (!id) { alert('Product ID is required'); return; }
    if (!product.productType) { alert('Product Type is required'); return; }
    if (!product.name?.trim()) { alert('Product Name is required'); return; }

    // Validate against the port-centric catalog model before writing the file.
    const validation = validateProduct(product as Product);
    if (validation.errorCount > 0) {
      const errorList = validation.issues
        .filter(i => i.severity === 'error')
        .map(i => `• [${i.code}] ${i.field ?? ''} ${i.message}`)
        .join('\n');
      if (!confirm(`This product has ${validation.errorCount} validation error(s):\n\n${errorList}\n\nSave anyway?`)) return;
    }

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

  // ---- Arrow-key nudge for selected terminal ----

  useEffect(() => {
    if (!selectedTerminalId) return;
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      const t = (product.terminals ?? []).find((t: TerminalDefinition) => t.id === selectedTerminalId);
      if (!t) return;
      const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
      const dy = e.key === 'ArrowUp'   ? -1 : e.key === 'ArrowDown'  ? 1 : 0;
      updateTerminal(selectedTerminalId, { offsetX: t.offsetX + dx, offsetY: t.offsetY + dy });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedTerminalId, product.terminals, updateTerminal]);

  // ---- Derived state ----

  const selectedTerminal = terminals.find(t => t.id === selectedTerminalId) ?? null;
  const selectedPort = selectedTerminal
    ? (product.communicationPorts ?? []).find(p => p.id === selectedTerminal.id)
    : undefined;

  // Resolve display image: an explicitly chosen imageUrl always wins in the
  // builder; otherwise fall back to manufacturer/type auto-detection.
  const displayImageUrl = useMemo(() => {
    const base = product.imageUrl
      ? product.imageUrl.split('?')[0]
      : (product.id && product.productType ? getProductDisplayImageUrl(product as Product) : undefined);
    if (!base) return undefined;
    return svgVersion > 0 ? `${base}?v=${svgVersion}` : base;
  }, [product, svgVersion]);

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
              <VariantsForm
                product={product}
                onChange={variants => updateProduct('variants', variants)}
              />
            </>
          )}

          {activeTab === 'visual' && (
            <div className="pb-visual-split">

              {/* Left column: image / terminal placer */}
              <div className="pb-visual-col">
                <CollapsibleSection
                  title="Image"
                  actions={
                    <button
                      className="pb-btn pb-btn-ghost pb-btn-sm"
                      onClick={() => setShowSvgPicker(true)}
                    >
                      Pick SVG
                    </button>
                  }
                  bodyStyle={{ alignItems: 'center' }}
                >
                    <TerminalPlacer
                      width={width}
                      height={height}
                      imageUrl={displayImageUrl}
                      terminals={terminals}
                      selectedId={selectedTerminalId}
                      onPlaceTerminal={addTerminal}
                      onSelectTerminal={setSelectedTerminalId}
                      onMoveTerminal={(id, x, y) => updateTerminal(id, { offsetX: x, offsetY: y })}
                      onResize={(w, h) => { updateProduct('width', w); updateProduct('height', h); }}
                      cropOverlay={svgViewBox ? { viewBox: svgViewBox, trim: svgTrim } : undefined}
                      kindOf={kindOf}
                    />
                  {/* Width / Height / Fit row */}
                  <div style={{ display: 'flex', gap: 8, alignSelf: 'stretch', alignItems: 'flex-end' }}>
                    <div className="pb-field" style={{ flex: 1 }}>
                      <label>Width (px)</label>
                      <input type="number" value={product.width ?? ''} onChange={e => updateProduct('width', Number(e.target.value))} min={20} placeholder="128" />
                    </div>
                    <div className="pb-field" style={{ flex: 1 }}>
                      <label>Height (px)</label>
                      <input type="number" value={product.height ?? ''} onChange={e => updateProduct('height', Number(e.target.value))} min={20} placeholder="80" />
                    </div>
                    <button
                      className="pb-btn pb-btn-ghost pb-btn-sm"
                      style={{ marginBottom: 1 }}
                      onClick={detectViewBox}
                      title="Read the SVG viewBox — required before cropping"
                      disabled={!product.imageUrl}
                    >
                      Detect SVG
                    </button>
                  </div>

                  {/* SVG crop panel — visible once viewBox is detected */}
                  {svgViewBox && (
                    <div style={{ alignSelf: 'stretch', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        ViewBox: {svgViewBox.x} {svgViewBox.y} {svgViewBox.w} {svgViewBox.h}
                        {(svgTrim.top || svgTrim.right || svgTrim.bottom || svgTrim.left) ? (
                          <span style={{ marginLeft: 8, color: 'var(--accent)' }}>
                            → {svgViewBox.x + svgTrim.left} {svgViewBox.y + svgTrim.top} {svgViewBox.w - svgTrim.left - svgTrim.right} {svgViewBox.h - svgTrim.top - svgTrim.bottom}
                          </span>
                        ) : null}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                        {(['top', 'right', 'bottom', 'left'] as const).map(side => (
                          <div key={side} className="pb-field">
                            <label style={{ textTransform: 'capitalize' }}>{side}</label>
                            <input
                              type="number"
                              value={svgTrim[side]}
                              onChange={e => setSvgTrim(t => ({ ...t, [side]: Number(e.target.value) }))}
                              min={0}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="pb-btn pb-btn-primary pb-btn-sm"
                          onClick={applyTrim}
                          disabled={!svgTrim.top && !svgTrim.right && !svgTrim.bottom && !svgTrim.left}
                        >
                          Apply Trim
                        </button>
                        <button
                          className="pb-btn pb-btn-ghost pb-btn-sm"
                          onClick={() => setSvgViewBox(null)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
                    Click canvas to add terminal · drag handles to resize
                  </div>
                </CollapsibleSection>
              </div>

              {/* Right column: terminal editor + list */}
              <div className="pb-visual-col">
                {/* Terminal editor — shown when a terminal is selected */}
                {selectedTerminal && (
                  <TerminalEditorPanel
                    terminal={selectedTerminal}
                    resolvedKind={kindOf(selectedTerminal)}
                    port={selectedPort}
                    availablePorts={ports}
                    availableGroups={terminalGroups}
                    onChange={changes => updateTerminal(selectedTerminal.id, changes)}
                    onPortChange={changes => upsertCommPort(selectedTerminal.id, changes)}
                    onDelete={() => removeTerminal(selectedTerminal.id)}
                    onClose={() => setSelectedTerminalId(null)}
                  />
                )}

                {/* Terminal list */}
                <CollapsibleSection
                  title={`Terminals (${terminals.length})`}
                  actions={
                    <button
                      className="pb-btn pb-btn-ghost pb-btn-sm"
                      onClick={() => addTerminal(0, 0)}
                    >
                      + Add
                    </button>
                  }
                  bodyStyle={{ gap: 4 }}
                >
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
                          style={{ background: KIND_COLORS[kindOf(t)] ?? '#bdbdbd' }}
                        />
                        <div className="pb-terminal-info">
                          <div className="pb-terminal-id">{t.id}</div>
                          <div className="pb-terminal-meta">
                            {kindOf(t)} · {t.side} · ({t.offsetX}, {t.offsetY})
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
                </CollapsibleSection>

                {/* Ports — internal circuits / busbars that group terminals */}
                <CollapsibleSection
                  title={`Ports (${ports.length})`}
                  actions={<button className="pb-btn pb-btn-ghost pb-btn-sm" onClick={addPort}>+ Add</button>}
                  bodyStyle={{ gap: 6 }}
                >
                    {ports.length === 0 && (
                      <div className="pb-empty">No ports — add one to group terminals onto a shared internal circuit / busbar (set its bus rating)</div>
                    )}
                    {ports.map(p => (
                      <PortEditor
                        key={p.id}
                        port={p}
                        onChange={changes => updatePort(p.id, changes)}
                        onRemove={() => removePort(p.id)}
                      />
                    ))}
                </CollapsibleSection>

                {/* Terminal Groups — internal common nodes / logical interfaces */}
                <CollapsibleSection
                  title={`Terminal Groups (${terminalGroups.length})`}
                  actions={<button className="pb-btn pb-btn-ghost pb-btn-sm" onClick={addTerminalGroup}>+ Add</button>}
                  bodyStyle={{ gap: 6 }}
                >
                    {terminalGroups.length === 0 && (
                      <div className="pb-empty">No terminal groups — add one to model an internal common node (e.g. paralleled posts on a 400A bus) or a logical comm/signal interface. Assign terminals to it via the terminal's Group field.</div>
                    )}
                    {terminalGroups.map(g => (
                      <TerminalGroupEditor
                        key={g.id}
                        group={g}
                        ports={ports}
                        onChange={changes => updateTerminalGroup(g.id, changes)}
                        onRemove={() => removeTerminalGroup(g.id)}
                      />
                    ))}
                </CollapsibleSection>
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
