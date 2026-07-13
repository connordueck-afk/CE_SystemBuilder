import { useEffect, useRef, useState } from 'react';
import type { NominalVoltage, SystemWarning } from '../../types/system';
import type { BusType } from '../../utils/electricalNetlist';
import type { BusColorMap } from '../../utils/busColors';
import { BUS_COLOR_OPTIONS, DEFAULT_BUS_COLORS } from '../../utils/busColors';
import { fmt } from '../../utils/priceCalculations';
import { CURRENT_APP_VERSION } from '../../utils/storage';
import { getProductBuilderUrl } from '../../utils/productBuilderLinks';
import {
  IconChevronDown,
  IconChevronRight,
  IconSun,
  IconMoon,
  IconSettings,
  IconSave,
  IconFolderOpen,
  IconShare,
  IconFileDown,
  IconRotateCcw,
  IconPalette,
  IconBug,
  IconCheckCircle,
} from '../icons';

interface Props {
  systemName: string;
  voltageFilter: NominalVoltage | 'all';
  resolvedDcVoltages: number[];
  totalMsrp: number;
  warnings: SystemWarning[];
  busColors: BusColorMap;
  themeMode: 'light' | 'dark';
  debugMode: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  onNameChange: (name: string) => void;
  onVoltageChange: (v: NominalVoltage | 'all') => void;
  onBusColorChange: (busType: BusType, color: string) => void;
  onResetBusColors: () => void;
  onToggleTheme: () => void;
  onToggleDebugMode: () => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  onShare: () => Promise<void>;
  onOpenBom: () => void;
  onExportPdf: () => void;
  onSetDefault?: (target: string, label: string) => void;
}

const VOLTAGE_OPTIONS = ['all', 12, 24, 48] as const;

function voltageOptionLabel(v: NominalVoltage | 'all'): string {
  return v === 'all' ? 'All Voltages' : `${v}V`;
}

export function HeaderBar({
  systemName,
  voltageFilter,
  resolvedDcVoltages,
  totalMsrp,
  warnings,
  busColors,
  themeMode,
  debugMode,
  saveStatus,
  lastSavedAt,
  onNameChange,
  onVoltageChange,
  onBusColorChange,
  onResetBusColors,
  onToggleTheme,
  onToggleDebugMode,
  onSave,
  onLoad,
  onReset,
  onShare,
  onOpenBom,
  onExportPdf,
  onSetDefault,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voltageOpen, setVoltageOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [busColorsExpanded, setBusColorsExpanded] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const voltageRef = useRef<HTMLDivElement>(null);

  const handleShareClick = async () => {
    await onShare();
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const errorCount = warnings.filter((w) => w.severity === 'error').length;
  const warnCount = warnings.filter((w) => w.severity === 'warning').length;

  // Close settings dropdown on outside click / Escape
  useEffect(() => {
    if (!settingsOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && settingsRef.current?.contains(target)) return;
      setSettingsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSettingsOpen(false);
    }
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [settingsOpen]);

  // Close voltage dropdown on outside click / Escape
  useEffect(() => {
    if (!voltageOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && voltageRef.current?.contains(target)) return;
      setVoltageOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setVoltageOpen(false);
    }
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [voltageOpen]);

  return (
    <header className="header-bar">
      {/* Logo */}
      <a
        className="header-logo"
        href="https://discoverenergysys.com/"
        target="_blank"
        rel="noreferrer"
        title="Discover Energy Systems website"
      >
        <img
          className="header-logo-mark"
          src={`${import.meta.env.BASE_URL}brand/des-mark.png`}
          alt=""
          aria-hidden="true"
        />
        <span className="header-logo-copy">
          <span className="header-logo-text">Discover Energy</span>
          <span className="header-logo-sub">System Builder</span>
        </span>
      </a>
      <span className="header-version" title={`System Builder version ${CURRENT_APP_VERSION}`}>
        v{CURRENT_APP_VERSION}
      </span>

      {/* Voltage dropdown */}
      <div className="header-dropdown-group" ref={voltageRef}>
        <button
          className="header-dropdown-btn"
          onClick={() => setVoltageOpen((o) => !o)}
          title="Filter the product catalog by voltage"
        >
          <span className="header-field-label">Catalog</span>
          <span className="header-dropdown-value">{voltageOptionLabel(voltageFilter)}</span>
          <IconChevronDown className="header-dropdown-arrow" size={12} />
        </button>
        {voltageOpen && (
          <div className="header-dropdown-menu">
            {VOLTAGE_OPTIONS.map((v) => (
              <button
                key={String(v)}
                className={`header-dropdown-item${voltageFilter === v ? ' header-dropdown-item-active' : ''}`}
                onClick={() => {
                  onVoltageChange(v as NominalVoltage | 'all');
                  setVoltageOpen(false);
                }}
              >
                {voltageOptionLabel(v as NominalVoltage | 'all')}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="header-domain-summary" title="DC voltage domains inferred from connected ports and sources">
        <span className="header-field-label">DC domains</span>
        <span className="header-domain-values">
          {resolvedDcVoltages.length > 0 ? resolvedDcVoltages.map((voltage) => `${voltage}V`).join(' / ') : 'Unresolved'}
        </span>
      </div>

      {/* BOM widget — kept as-is */}
      <button className="header-price" onClick={onOpenBom} title="Open BOM summary">
        <span className="header-field-label">BOM Total</span>
        <span className="header-price-value">{fmt(totalMsrp)}</span>
      </button>

      {/* Warnings badge */}
      <div className="header-warnings" role="status" aria-label="System validation status">
        {errorCount > 0 || warnCount > 0 ? (
          <>
            {errorCount > 0 && <span className="badge-error">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
            {warnCount > 0 && <span className="badge-warn">{warnCount} warning{warnCount !== 1 ? 's' : ''}</span>}
          </>
        ) : (
          <span className="badge-ok"><IconCheckCircle size={13} /> System clear</span>
        )}
      </div>

      {/* Right-aligned group: name input + settings */}
      <div className="header-actions">
        <div
          className={`header-save-status header-save-status-${saveStatus}`}
          role="status"
          aria-live="polite"
          title={lastSavedAt ? `Last autosaved at ${lastSavedAt.toLocaleString()}` : 'Autosave status'}
        >
          <span className="header-save-status-dot" aria-hidden="true" />
          <span>
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'error'
              ? 'Save failed'
              : lastSavedAt
              ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
              : 'Autosave ready'}
          </span>
        </div>
        <input
          className="header-name-input"
          value={systemName}
          onChange={(e) => onNameChange(e.target.value)}
          title="System name"
          aria-label="System name"
        />

        {/* Settings dropdown */}
        <div className="header-dropdown-group" ref={settingsRef}>
        <button
          className="header-dropdown-btn"
          onClick={() => setSettingsOpen((o) => !o)}
          title="Settings"
        >
          <IconSettings size={15} className="header-dropdown-icon" />
          <span className="header-dropdown-arrow"><IconChevronDown size={12} /></span>
        </button>
        {settingsOpen && (
          <div className="header-dropdown-menu header-dropdown-menu-right header-dropdown-menu-scroll">
            {/* Theme toggle */}
            <button
              className="header-dropdown-item header-dropdown-theme-row"
              onClick={() => onToggleTheme()}
            >
              <span>{themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              <span className={`menu-theme-icon ${themeMode === 'dark' ? 'menu-theme-icon-dark' : ''}`}>
                <span className="menu-theme-sun"><IconSun size={12} /></span>
                <span className="menu-theme-moon"><IconMoon size={12} /></span>
                <span className="menu-theme-knob" />
              </span>
            </button>

            {import.meta.env.DEV && (
              <>
                <div className="header-dropdown-divider" />

                <label className="header-dropdown-item header-dropdown-checkbox-row">
                  <input
                    type="checkbox"
                    checked={debugMode}
                    onChange={onToggleDebugMode}
                  />
                  <IconBug size={15} />
                  <span>Debugging</span>
                </label>
              </>
            )}

            {debugMode && import.meta.env.DEV && (
              <a
                className="header-dropdown-item"
                href={getProductBuilderUrl()}
                target="_blank"
                rel="noreferrer"
                onClick={() => setSettingsOpen(false)}
              >
                Product Builder
              </a>
            )}

            <div className="header-dropdown-divider" />

            {/* File actions */}
            <button className="header-dropdown-item" onClick={() => { onSave(); setSettingsOpen(false); }}><IconSave size={14} className="header-dropdown-item-icon" /> Save</button>
            <button className="header-dropdown-item" onClick={() => { onLoad(); setSettingsOpen(false); }}><IconFolderOpen size={14} className="header-dropdown-item-icon" /> Load</button>
            <button className="header-dropdown-item" onClick={async () => { await handleShareClick(); }}><IconShare size={14} className="header-dropdown-item-icon" /> {shareCopied ? 'Copied!' : 'Share'}</button>
            <button className="header-dropdown-item" onClick={() => { onExportPdf(); setSettingsOpen(false); }}><IconFileDown size={14} className="header-dropdown-item-icon" /> Export PDF</button>
            <button className="header-dropdown-item header-dropdown-item-danger" onClick={() => { onReset(); setSettingsOpen(false); }}><IconRotateCcw size={14} className="header-dropdown-item-icon" /> Reset</button>

            {debugMode && onSetDefault && (
              <>
                <div className="header-dropdown-divider" />
                <div className="header-dropdown-section-label">Dev: Set Default</div>
                {([
                  { target: 'simple-12v', label: '12V Small RV' },
                  { target: 'full-12v', label: '24V Medium RV' },
                  { target: 'offgrid-48v', label: '48V Stationary' },
                ] as const).map(({ target, label }) => (
                  <button
                    key={target}
                    className="header-dropdown-item"
                    onClick={() => {
                      onSetDefault(target, label);
                      setSettingsOpen(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </>
            )}

            <div className="header-dropdown-divider" />

            {/* Bus colours — collapsed by default */}
            <button
              className="header-dropdown-item header-dropdown-collapse-btn"
              onClick={() => setBusColorsExpanded((o) => !o)}
            >
              <IconPalette size={14} className="header-dropdown-item-icon" />
              <span>Bus Colours</span>
              <span className="header-dropdown-collapse-arrow">{busColorsExpanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}</span>
            </button>
            {busColorsExpanded && (
              <div className="header-dropdown-bus-colors">
                {BUS_COLOR_OPTIONS.map((option) => (
                  <label key={option.key} className="header-dropdown-item header-dropdown-color-row">
                    <span className="header-dropdown-color-label">{option.label}</span>
                    <span
                      className="header-dropdown-color-swatch"
                      style={{ background: DEFAULT_BUS_COLORS[option.key] }}
                      title="Default"
                    />
                    <input
                      type="color"
                      value={busColors[option.key]}
                      onChange={(e) => onBusColorChange(option.key, e.target.value)}
                      title={`${option.label} colour`}
                    />
                  </label>
                ))}
                <button
                  className="header-dropdown-item header-dropdown-reset"
                  onClick={onResetBusColors}
                >
                  Reset Bus Colours
                </button>
              </div>
            )}

            <div className="header-dropdown-divider" />
            <div className="header-dropdown-about" role="note">
              <strong>DES System Builder v{CURRENT_APP_VERSION}</strong>
              <span>Preliminary design aid &mdash; not certified engineering</span>
            </div>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
