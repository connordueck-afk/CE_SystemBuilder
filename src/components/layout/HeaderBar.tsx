import { useEffect, useRef, useState } from 'react';
import type { NominalVoltage, SystemWarning } from '../../types/system';
import type { BusType } from '../../utils/electricalNetlist';
import type { BusColorMap } from '../../utils/busColors';
import { BUS_COLOR_OPTIONS, DEFAULT_BUS_COLORS } from '../../utils/busColors';
import { fmt } from '../../utils/priceCalculations';
import { CURRENT_APP_VERSION } from '../../utils/storage';

interface Props {
  systemName: string;
  voltageFilter: NominalVoltage | 'all';
  totalMsrp: number;
  warnings: SystemWarning[];
  busColors: BusColorMap;
  themeMode: 'light' | 'dark';
  onNameChange: (name: string) => void;
  onVoltageChange: (v: NominalVoltage | 'all') => void;
  onBusColorChange: (busType: BusType, color: string) => void;
  onResetBusColors: () => void;
  onToggleTheme: () => void;
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
  totalMsrp,
  warnings,
  busColors,
  themeMode,
  onNameChange,
  onVoltageChange,
  onBusColorChange,
  onResetBusColors,
  onToggleTheme,
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
        href="https://www.cdnrg.com/"
        target="_blank"
        rel="noreferrer"
        title="Open Canadian Energy website"
      >
        <img className="header-logo-mark" src={`${import.meta.env.BASE_URL}brand/canadian-energy-logo.png`} alt="" aria-hidden="true" />
        <span className="header-logo-copy">
          <span className="header-logo-text">Canadian Energy</span>
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
          title="Select system voltage"
        >
          <span className="header-field-label">System V</span>
          <span className="header-dropdown-value">{voltageOptionLabel(voltageFilter)}</span>
          <span className="header-dropdown-arrow">▾</span>
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

      {/* BOM widget — kept as-is */}
      <button className="header-price" onClick={onOpenBom} title="Open BOM summary">
        <span className="header-field-label">BOM Total</span>
        <span className="header-price-value">{fmt(totalMsrp)}</span>
      </button>

      {/* Warnings badge */}
      {(errorCount > 0 || warnCount > 0) && (
        <div className="header-warnings">
          {errorCount > 0 && <span className="badge-error">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
          {warnCount > 0 && <span className="badge-warn">{warnCount} warning{warnCount !== 1 ? 's' : ''}</span>}
        </div>
      )}

      {/* Right-aligned group: name input + settings */}
      <div className="header-actions">
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
          <span className="header-dropdown-value">Settings</span>
          <span className="header-dropdown-arrow">▾</span>
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
                <span className="menu-theme-sun">☀</span>
                <span className="menu-theme-moon">☾</span>
                <span className="menu-theme-knob" />
              </span>
            </button>

            <div className="header-dropdown-divider" />

            {/* File actions */}
            <button className="header-dropdown-item" onClick={() => { onSave(); setSettingsOpen(false); }}>Save</button>
            <button className="header-dropdown-item" onClick={() => { onLoad(); setSettingsOpen(false); }}>Load</button>
            <button className="header-dropdown-item" onClick={async () => { await handleShareClick(); }}>{shareCopied ? 'Copied!' : 'Share'}</button>
            <button className="header-dropdown-item" onClick={() => { onExportPdf(); setSettingsOpen(false); }}>Export PDF</button>
            <button className="header-dropdown-item header-dropdown-item-danger" onClick={() => { onReset(); setSettingsOpen(false); }}>Reset</button>

            {onSetDefault && (
              <>
                <div className="header-dropdown-divider" />
                <div className="header-dropdown-section-label">Dev: Set Default</div>
                {([
                  { target: 'simple-12v', label: 'Simple 12V Solar' },
                  { target: 'full-12v', label: 'Full 12V Mobile' },
                  { target: 'offgrid-48v', label: '48V Off-Grid Cabin' },
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
              <span>Bus Colours</span>
              <span className="header-dropdown-collapse-arrow">{busColorsExpanded ? '▾' : '▸'}</span>
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
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
