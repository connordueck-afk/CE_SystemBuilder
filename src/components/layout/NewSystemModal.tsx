import type { SystemDesign } from '../../types/system';
import type { SystemPreset } from '../../data/presetSystems';
import { SYSTEM_PRESETS } from '../../data/presetSystems';

interface Props {
  onSelect: (system: SystemDesign | null) => void;
  onClose: () => void;
}

function EmptyIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="new-system-card-icon" aria-hidden="true">
      <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 3" />
      <path d="M24 17v14M17 24h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function VanIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="new-system-card-icon" aria-hidden="true">
      {/* Solar panel */}
      <rect x="6" y="6" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <line x1="14" y1="6" x2="14" y2="16" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="1.5" />
      {/* Battery */}
      <rect x="6" y="28" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M11 28v-2h4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 34h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* MPPT box */}
      <rect x="28" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M32 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* DC Load */}
      <rect x="28" y="28" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M33 34h4M35 32v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Wires */}
      <path d="M22 11h3v17H13v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 13h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25 28v5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MobileFullIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="new-system-card-icon" aria-hidden="true">
      {/* Two solar panels */}
      <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="16" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      {/* Two batteries */}
      <rect x="2" y="30" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="30" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M5 30v-2h4v2M17 30v-2h4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* MPPT */}
      <rect x="32" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="2" />
      {/* Inverter */}
      <rect x="32" y="28" width="14" height="16" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M36 36h6M39 33v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* DC-DC */}
      <rect x="32" y="17" width="13" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      {/* Wires */}
      <path d="M28 8h2v13h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 30v-8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CabinIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="new-system-card-icon" aria-hidden="true">
      {/* House shape */}
      <path d="M24 6L42 22H38v18H10V22H6L24 6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Solar on roof */}
      <rect x="17" y="14" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="25" y="14" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      {/* Battery inside */}
      <rect x="14" y="28" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 28v-2h3v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      {/* Inverter */}
      <rect x="26" y="27" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M29 32h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      {/* 48V label suggestion — just a bold line */}
      <path d="M14 24h20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

const PRESET_ICONS: Record<string, React.FC> = {
  'simple-12v': VanIcon,
  'full-12v': MobileFullIcon,
  'offgrid-48v': CabinIcon,
};

function PresetCard({ preset, onSelect }: { preset: SystemPreset; onSelect: () => void }) {
  const Icon = PRESET_ICONS[preset.id];
  return (
    <button type="button" className="new-system-card" onClick={onSelect}>
      {Icon && <Icon />}
      <div className="new-system-card-name">{preset.name}</div>
      <div className="new-system-card-desc">{preset.description}</div>
      <div className="new-system-card-tags">
        {preset.tags.map((tag) => (
          <span key={tag} className="new-system-tag">{tag}</span>
        ))}
      </div>
    </button>
  );
}

export function NewSystemModal({ onSelect, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="new-system-modal" onClick={(e) => e.stopPropagation()}>
        <div className="new-system-modal-header">
          <div>
            <div className="modal-title">New System</div>
            <div className="new-system-modal-subtitle">Choose a starting point — your current design will be replaced.</div>
          </div>
          <button type="button" className="product-selector-close" onClick={onClose} title="Cancel">×</button>
        </div>

        <div className="new-system-grid">
          {/* Empty canvas */}
          <button type="button" className="new-system-card new-system-card-empty" onClick={() => onSelect(null)}>
            <EmptyIcon />
            <div className="new-system-card-name">Empty Canvas</div>
            <div className="new-system-card-desc">Start from scratch with a blank diagram.</div>
            <div className="new-system-card-tags">
              <span className="new-system-tag">Blank</span>
            </div>
          </button>

          {SYSTEM_PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onSelect={() => onSelect(preset.system)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
