import { useEffect, useRef, useState } from 'react';
import type { NominalVoltage, SystemWarning } from '../../types/system';
import type { BusType } from '../../utils/electricalNetlist';
import type { BusColorMap } from '../../utils/busColors';
import { BUS_COLOR_OPTIONS, DEFAULT_BUS_COLORS } from '../../utils/busColors';
import { fmt } from '../../utils/priceCalculations';

interface Props {
  systemName: string;
  nominalVoltage: NominalVoltage;
  totalMsrp: number;
  warnings: SystemWarning[];
  busColors: BusColorMap;
  onNameChange: (name: string) => void;
  onVoltageChange: (v: NominalVoltage) => void;
  onBusColorChange: (busType: BusType, color: string) => void;
  onResetBusColors: () => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  onOpenBom: () => void;
}

export function HeaderBar({
  systemName,
  nominalVoltage,
  totalMsrp,
  warnings,
  busColors,
  onNameChange,
  onVoltageChange,
  onBusColorChange,
  onResetBusColors,
  onSave,
  onLoad,
  onReset,
  onOpenBom,
}: Props) {
  const [busColorsOpen, setBusColorsOpen] = useState(false);
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
        <img className="header-logo-mark" src="/brand/canadian-energy-logo.png" alt="" aria-hidden="true" />
        <span className="header-logo-copy">
          <span className="header-logo-text">Canadian Energy</span>
          <span className="header-logo-sub">System Builder</span>
        </span>
      </a>

      {/* Voltage selector */}
      <div className="header-voltage-group">
        <span className="header-field-label">System V</span>
        {([12, 24, 48] as NominalVoltage[]).map((v) => (
          <button
            key={v}
            className={`voltage-btn ${nominalVoltage === v ? 'voltage-btn-active' : ''}`}
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
        <button className="btn-header" onClick={onSave} title="Save system">Save</button>
        <button className="btn-header" onClick={onLoad} title="Load saved system">Load</button>
        <button className="btn-header btn-danger" onClick={onReset} title="Reset to default sample system">Reset</button>
      </div>
    </header>
  );
}
