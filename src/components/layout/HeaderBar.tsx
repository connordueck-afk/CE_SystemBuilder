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
  const [busColorsOpen, setBusColorsOpen] = useState(false);
  const [setDefaultOpen, setSetDefaultOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const setDefaultRef = useRef<HTMLDivElement>(null);

  const handleShareClick = async () => {
    await onShare();
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };
  const busColorsMenuRef = useRef<HTMLDivElement>(null);
  const errorCount = warnings.filter((w) => w.severity === 'error').length;
  const warnCount = warnings.filter((w) => w.severity === 'warning').length;

  useEffect(() => {
    if (!busColorsOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && busColorsMenuRef.current?.contains(target)) return;
      setBusColorsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setBusColorsOpen(false);
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [busColorsOpen]);

  useEffect(() => {
    if (!setDefaultOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && setDefaultRef.current?.contains(target)) return;
      setSetDefaultOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSetDefaultOpen(false);
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setDefaultOpen]);

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

      {/* Voltage selector */}
      <div className="header-voltage-group">
        <span className="header-field-label">System V</span>
        <button
          className={`voltage-btn ${voltageFilter === 'all' ? 'voltage-btn-active' : ''}`}
          onClick={() => onVoltageChange('all')}
        >
          All
        </button>
        {([12, 24, 48] as NominalVoltage[]).map((v) => (
          <button
            key={v}
            className={`voltage-btn ${voltageFilter === v ? 'voltage-btn-active' : ''}`}
            onClick={() => onVoltageChange(v)}
          >
            {v}V
          </button>
        ))}
      </div>

      {/* Price total */}
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

      {/* Actions */}
      <div className="header-actions" ref={busColorsMenuRef}>
        <input
          className="header-name-input"
          value={systemName}
          onChange={(e) => onNameChange(e.target.value)}
          title="System name"
          aria-label="System name"
        />
        <button
          className={`btn-header btn-header-icon ${busColorsOpen ? 'btn-header-active' : ''}`}
          onClick={() => setBusColorsOpen((open) => !open)}
          title="Bus colours"
          aria-label="Bus colours"
        >
          <span className="bus-colour-icon" aria-hidden="true">
            <span style={{ background: busColors.dc_pos }} />
            <span style={{ background: busColors.dc_neg }} />
            <span style={{ background: busColors.pv_pos }} />
          </span>
        </button>
        {busColorsOpen && (
          <div className="bus-colour-panel">
            <div className="bus-colour-panel-header">
              <span>Bus Colours</span>
              <button className="bus-colour-reset" onClick={onResetBusColors} type="button">
                Reset
              </button>
            </div>
            <div className="bus-colour-list">
              {BUS_COLOR_OPTIONS.map((option) => (
                <label key={option.key} className="bus-colour-row">
                  <span className="bus-colour-label">{option.label}</span>
                  <span className="bus-colour-default" style={{ background: DEFAULT_BUS_COLORS[option.key] }} />
                  <input
                    type="color"
                    value={busColors[option.key]}
                    onChange={(e) => onBusColorChange(option.key, e.target.value)}
                    title={`${option.label} colour`}
                  />
                </label>
              ))}
            </div>
          </div>
        )}
        <button
          className={`theme-toggle ${themeMode === 'dark' ? 'theme-toggle-dark' : ''}`}
          type="button"
          onClick={onToggleTheme}
          title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} theme`}
          aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} theme`}
          aria-pressed={themeMode === 'dark'}
        >
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-thumb">{themeMode === 'dark' ? 'D' : 'L'}</span>
          </span>
          <span className="theme-toggle-label">{themeMode === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
        <button className="btn-header" onClick={onSave} title="Save system">Save</button>
        <button className="btn-header" onClick={onLoad} title="Load saved system">Load</button>
        <button
          className={`btn-header ${shareCopied ? 'btn-header-copied' : ''}`}
          onClick={handleShareClick}
          title="Copy a share link for this design to your clipboard"
        >
          {shareCopied ? 'Copied!' : 'Share'}
        </button>
        <button className="btn-header" onClick={onExportPdf} title="Export system as PDF">Export PDF</button>
        <button className="btn-header btn-danger" onClick={onReset} title="Reset to default sample system">Reset</button>
        {onSetDefault && (
          <div ref={setDefaultRef} style={{ position: 'relative' }}>
            <button
              className={`btn-header ${setDefaultOpen ? 'btn-header-active' : ''}`}
              onClick={() => setSetDefaultOpen((o) => !o)}
              title="[Dev] Push current drawing to a default/preset file"
            >
              Set Default ▾
            </button>
            {setDefaultOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                minWidth: 190, zIndex: 200, overflow: 'hidden',
              }}>
                {([
                  { target: 'simple-12v',  label: 'Simple 12V Solar' },
                  { target: 'full-12v',    label: 'Full 12V Mobile' },
                  { target: 'offgrid-48v', label: '48V Off-Grid Cabin' },
                ] as const).map(({ target, label }) => (
                  <button
                    key={target}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 14px', background: 'none', border: 'none',
                      color: 'var(--ink)', fontSize: 13, cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover, var(--border))')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    onClick={() => {
                      setSetDefaultOpen(false);
                      onSetDefault(target, label);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
