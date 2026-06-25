import { useRef, useCallback } from 'react';
import type { TerminalDefinition, ConnectionPointKind } from '../../types/system';

const DISPLAY_SCALE = 3; // screen pixels per canvas unit (fixed, so resize handles move the actual edge)

interface CropOverlay {
  viewBox: { x: number; y: number; w: number; h: number };
  trim: { top: number; right: number; bottom: number; left: number };
}

interface Props {
  width: number;
  height: number;
  imageUrl: string | undefined;
  terminals: TerminalDefinition[];
  selectedId: string | null;
  onPlaceTerminal: (offsetX: number, offsetY: number) => void;
  onSelectTerminal: (id: string) => void;
  onMoveTerminal: (id: string, offsetX: number, offsetY: number) => void;
  onResize?: (width: number, height: number) => void;
  cropOverlay?: CropOverlay;
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
  onResize,
  cropOverlay,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const didDragRef = useRef(false);

  const displayW = Math.max(width, 20) * DISPLAY_SCALE;
  const displayH = Math.max(height, 20) * DISPLAY_SCALE;

  const toOffset = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      offsetX: Math.round((clientX - rect.left - displayW / 2) / DISPLAY_SCALE),
      offsetY: Math.round((clientY - rect.top  - displayH / 2) / DISPLAY_SCALE),
    };
  }, [displayW, displayH]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (didDragRef.current) { didDragRef.current = false; return; }
    const { offsetX, offsetY } = toOffset(e.clientX, e.clientY);
    onPlaceTerminal(offsetX, offsetY);
  }, [toOffset, onPlaceTerminal]);

  const handleDotMouseDown = useCallback((e: React.MouseEvent, t: TerminalDefinition) => {
    e.preventDefault();
    dragRef.current = { id: t.id, startX: e.clientX, startY: e.clientY, origX: t.offsetX, origY: t.offsetY };

    const onMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = me.clientX - dragRef.current.startX;
      const dy = me.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didDragRef.current = true;
        onMoveTerminal(
          dragRef.current.id,
          Math.round(dragRef.current.origX + dx / DISPLAY_SCALE),
          Math.round(dragRef.current.origY + dy / DISPLAY_SCALE),
        );
      }
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [onMoveTerminal]);

  // ---- Resize handles ----

  const startResize = useCallback((e: React.MouseEvent, edge: 'e' | 's' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    if (!onResize) return;
    const start = { edge, mx: e.clientX, my: e.clientY, w: width, h: height };
    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - start.mx;
      const dy = me.clientY - start.my;
      const newW = start.edge === 's' ? start.w : Math.max(20, Math.round(start.w + dx / DISPLAY_SCALE));
      const newH = start.edge === 'e' ? start.h : Math.max(20, Math.round(start.h + dy / DISPLAY_SCALE));
      onResize(newW, newH);
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [width, height, onResize]);

  // ---- Crop overlay geometry ----

  const cropDims = cropOverlay ? (() => {
    const { viewBox: vb, trim } = cropOverlay;
    return {
      top:    Math.round((trim.top    / vb.h) * displayH),
      bottom: Math.round((trim.bottom / vb.h) * displayH),
      left:   Math.round((trim.left   / vb.w) * displayW),
      right:  Math.round((trim.right  / vb.w) * displayW),
    };
  })() : null;

  return (
    <div className="pb-placer-outer" style={{ width: displayW, height: displayH }}>
      <div
        ref={containerRef}
        className="pb-placer-wrap"
        style={{ width: displayW, height: displayH }}
        onClick={handleCanvasClick}
        title="Click to place a terminal · drag dots to reposition"
      >
        {imageUrl ? (
          <img className="pb-placer-img" src={imageUrl} width={displayW} height={displayH} alt="product" draggable={false} />
        ) : (
          <div style={{ width: displayW, height: displayH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 11 }}>
            No image — set width/height then pick an SVG
          </div>
        )}

        {terminals.map(t => {
          const dotX = displayW / 2 + t.offsetX * DISPLAY_SCALE;
          const dotY = displayH / 2 + t.offsetY * DISPLAY_SCALE;
          return (
            <div
              key={t.id}
              className={`pb-terminal-dot${t.id === selectedId ? ' selected' : ''}`}
              style={{ left: dotX, top: dotY, background: terminalColor(t) }}
              onMouseDown={e => handleDotMouseDown(e, t)}
              onClick={e => { e.stopPropagation(); if (!didDragRef.current) onSelectTerminal(t.id); }}
              title={`${t.id} (${t.offsetX}, ${t.offsetY})`}
            >
              <span className="pb-terminal-label">{t.label || t.id}</span>
            </div>
          );
        })}

        {/* Crop overlay */}
        {cropDims && (() => {
          const { top, bottom, left, right } = cropDims;
          const dim = { position: 'absolute' as const, background: 'rgba(0,0,0,0.55)', zIndex: 15, pointerEvents: 'none' as const };
          return (
            <>
              {top    > 0 && <div style={{ ...dim, top: 0,    left: 0,    right: 0,          height: top }} />}
              {bottom > 0 && <div style={{ ...dim, bottom: 0, left: 0,    right: 0,          height: bottom }} />}
              {left   > 0 && <div style={{ ...dim, top,       bottom,     left: 0,           width: left }} />}
              {right  > 0 && <div style={{ ...dim, top,       bottom,     right: 0,          width: right }} />}
              <div style={{
                position: 'absolute', zIndex: 16, pointerEvents: 'none',
                top, bottom, left, right,
                outline: '2px dashed rgba(255,255,255,0.85)',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4)',
              }} />
            </>
          );
        })()}
      </div>

      {onResize && (
        <>
          <div className="pb-resize-handle pb-resize-e"  style={{ top: displayH / 2 }} onMouseDown={e => startResize(e, 'e')}  onClick={e => e.stopPropagation()} title="Drag to resize width" />
          <div className="pb-resize-handle pb-resize-s"  style={{ left: displayW / 2 }} onMouseDown={e => startResize(e, 's')} onClick={e => e.stopPropagation()} title="Drag to resize height" />
          <div className="pb-resize-handle pb-resize-se" onMouseDown={e => startResize(e, 'se')} onClick={e => e.stopPropagation()} title="Drag to resize both" />
        </>
      )}
    </div>
  );
}
