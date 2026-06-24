import { useRef, useCallback } from 'react';
import type { TerminalDefinition, ConnectionPointKind } from '../../types/system';

// Scale product canvas units up to a comfortable display size
const TARGET_DISPLAY_WIDTH = 400;

interface Props {
  width: number;
  height: number;
  imageUrl: string | undefined;
  terminals: TerminalDefinition[];
  selectedId: string | null;
  onPlaceTerminal: (offsetX: number, offsetY: number) => void;
  onSelectTerminal: (id: string) => void;
  onMoveTerminal: (id: string, offsetX: number, offsetY: number) => void;
}

const KIND_COLORS: Record<ConnectionPointKind | 'default', string> = {
  dc_power:      '#f2994a',
  pv_power:      '#f2c94c',
  ac_power:      '#4f8ef7',
  signal:        '#6fcf97',
  network:       '#bb6bd9',
  chassis_ground:'#828282',
  generic:       '#bdbdbd',
  default:       '#bdbdbd',
};

function terminalColor(t: TerminalDefinition): string {
  return KIND_COLORS[t.kind] ?? KIND_COLORS.default;
}

export function TerminalPlacer({
  width, height, imageUrl,
  terminals, selectedId,
  onPlaceTerminal, onSelectTerminal, onMoveTerminal,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  // Survives the mouseup→click boundary — dragRef is cleared in mouseup (before click fires)
  const didDragRef = useRef(false);

  // Scale up from product canvas units to a comfortable display size
  const displayScale = Math.max(2, TARGET_DISPLAY_WIDTH / Math.max(width, 1));
  const displayW = Math.round(Math.max(width, 60) * displayScale);
  const displayH = Math.round(Math.max(height, 60) * displayScale);

  const toOffset = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    return {
      offsetX: Math.round((relX - displayW / 2) / displayScale),
      offsetY: Math.round((relY - displayH / 2) / displayScale),
    };
  }, [displayW, displayH, displayScale]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Suppress the click that fires after a drag ends
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    const { offsetX, offsetY } = toOffset(e.clientX, e.clientY);
    onPlaceTerminal(offsetX, offsetY);
  }, [toOffset, onPlaceTerminal]);

  const handleDotMouseDown = useCallback((e: React.MouseEvent, t: TerminalDefinition) => {
    e.preventDefault(); // prevent text selection during drag
    dragRef.current = { id: t.id, startX: e.clientX, startY: e.clientY, origX: t.offsetX, origY: t.offsetY };

    const onMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = me.clientX - dragRef.current.startX;
      const dy = me.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didDragRef.current = true;
        onMoveTerminal(
          dragRef.current.id,
          Math.round(dragRef.current.origX + dx / displayScale),
          Math.round(dragRef.current.origY + dy / displayScale),
        );
      }
    };

    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [onMoveTerminal, displayScale]);

  return (
    <div
      ref={containerRef}
      className="pb-placer-wrap"
      style={{ width: displayW, height: displayH }}
      onClick={handleCanvasClick}
      title="Click to place a terminal"
    >
      {imageUrl ? (
        <img
          className="pb-placer-img"
          src={imageUrl}
          width={displayW}
          height={displayH}
          alt="product"
          draggable={false}
        />
      ) : (
        <div
          style={{
            width: displayW, height: displayH,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', fontSize: 11,
          }}
        >
          No image — set width/height then pick an SVG
        </div>
      )}

      {terminals.map(t => {
        const dotX = displayW / 2 + t.offsetX * displayScale;
        const dotY = displayH / 2 + t.offsetY * displayScale;
        const color = terminalColor(t);
        return (
          <div
            key={t.id}
            className={`pb-terminal-dot${t.id === selectedId ? ' selected' : ''}`}
            style={{ left: dotX, top: dotY, background: color }}
            onMouseDown={e => handleDotMouseDown(e, t)}
            onClick={e => { e.stopPropagation(); if (!didDragRef.current) onSelectTerminal(t.id); }}
            title={`${t.id} (${t.offsetX}, ${t.offsetY})`}
          >
            <span className="pb-terminal-label">{t.label || t.id}</span>
          </div>
        );
      })}
    </div>
  );
}
