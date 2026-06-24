import { useRef, useCallback } from 'react';
import type { TerminalDefinition, ConnectionPointKind } from '../../types/system';

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

  const toOffset = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    return {
      offsetX: Math.round(relX - width / 2),
      offsetY: Math.round(relY - height / 2),
    };
  }, [width, height]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (dragRef.current) return; // was a drag, not a click
    const { offsetX, offsetY } = toOffset(e.clientX, e.clientY);
    onPlaceTerminal(offsetX, offsetY);
  }, [toOffset, onPlaceTerminal]);

  const handleDotMouseDown = useCallback((e: React.MouseEvent, t: TerminalDefinition) => {
    e.stopPropagation();
    onSelectTerminal(t.id);
    dragRef.current = { id: t.id, startX: e.clientX, startY: e.clientY, origX: t.offsetX, origY: t.offsetY };

    const onMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = me.clientX - dragRef.current.startX;
      const dy = me.clientY - dragRef.current.startY;
      // Only commit if moved > 3px to distinguish click from drag
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        onMoveTerminal(
          dragRef.current.id,
          Math.round(dragRef.current.origX + dx),
          Math.round(dragRef.current.origY + dy),
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
  }, [onSelectTerminal, onMoveTerminal]);

  const scaledW = Math.max(width, 60);
  const scaledH = Math.max(height, 60);

  return (
    <div
      ref={containerRef}
      className="pb-placer-wrap"
      style={{ width: scaledW, height: scaledH }}
      onClick={handleCanvasClick}
      title="Click to place a terminal"
    >
      {imageUrl ? (
        <img
          className="pb-placer-img"
          src={imageUrl}
          width={scaledW}
          height={scaledH}
          alt="product"
          draggable={false}
        />
      ) : (
        <div
          style={{
            width: scaledW, height: scaledH,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', fontSize: 11,
          }}
        >
          No image — set width/height and pick an SVG
        </div>
      )}

      {terminals.map(t => {
        const dotX = scaledW / 2 + t.offsetX;
        const dotY = scaledH / 2 + t.offsetY;
        const color = terminalColor(t);
        return (
          <div
            key={t.id}
            className={`pb-terminal-dot${t.id === selectedId ? ' selected' : ''}`}
            style={{ left: dotX, top: dotY, background: color }}
            onMouseDown={e => handleDotMouseDown(e, t)}
            title={`${t.id} (${t.offsetX}, ${t.offsetY})`}
          >
            <span className="pb-terminal-label">{t.label || t.id}</span>
          </div>
        );
      })}
    </div>
  );
}
