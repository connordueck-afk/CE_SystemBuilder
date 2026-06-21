import { useState } from 'react';
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
  const errorCount = warnings.filter((w) => w.severity === 'error').length;
  const warnCount = warnings.filter((w) => w.severity === 'warning').length;

  return (
    <header className="header-bar">
      {/* Logo */}
      <div className="header-logo">
        <span className="header-logo-text">Canadian Energy</span>
        <span className="header-logo-sub">System Builder</span>
      </div>

      {/* System name */}
      <input
        className="header-name-input"
        value={systemName}
        onChange={(e) => onNameChange(e.target.value)}
        title="System name"
      />

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
      <div className="header-actions">
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
