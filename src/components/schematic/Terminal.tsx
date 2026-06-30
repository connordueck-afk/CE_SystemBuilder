import type { EffectiveTerminal } from '../../types/system';
import { busTypeFromTerminal } from '../../utils/electricalNetlist';
import type { BusColorMap } from '../../utils/busColors';

interface Props {
  terminal: EffectiveTerminal;
  componentId: string;
  componentLabel?: string;
  isHighlighted: boolean;
  isPending: boolean;
  isSource: boolean;
  isDisabled: boolean;
  isFull: boolean;
  isHovered: boolean;
  busColors: BusColorMap;
  onHover: (compId: string, termId: string, hovered: boolean) => void;
  onMouseDown: (compId: string, termId: string, e: React.MouseEvent) => void;
}

function terminalTooltip(terminal: EffectiveTerminal, componentLabel?: string): string {
  const parts: string[] = [];
  if (componentLabel) parts.push(componentLabel);
  if (terminal.label) parts.push(terminal.label);
  if (parts.length === 0) return 'Connection Node';
  return parts.join(' — ');
}

function terminalColor(terminal: EffectiveTerminal, busColors: BusColorMap): string {
  return busColors[busTypeFromTerminal(terminal)];
}

export function Terminal({ terminal, componentId, componentLabel, isHighlighted, isPending, isSource, isDisabled, isFull, isHovered, busColors, onHover, onMouseDown }: Props) {
  const color = terminalColor(terminal, busColors);
  const enlarged = isHighlighted || isSource || isHovered;
  const r = enlarged ? 6 : 4;
  const isCommPort = terminal.kind === 'network';
  const tooltip = terminalTooltip(terminal, componentLabel);

  // Full terminals: solid fill at reduced opacity when idle, disabled when a connection is being drawn
  const fillColor = (isSource || isFull) ? color : '#ffffff';
  const cursorStyle = isDisabled ? 'default' : (isFull ? 'not-allowed' : 'crosshair');

  return (
    <g
      transform={`translate(${terminal.offsetX}, ${terminal.offsetY})`}
      style={{
        cursor: cursorStyle,
        pointerEvents: isDisabled ? 'none' : 'auto',
        opacity: isDisabled ? 0.2 : (isFull && !isSource) ? 0.55 : 1,
      }}
      onMouseEnter={() => onHover(componentId, terminal.id, true)}
      onMouseLeave={() => onHover(componentId, terminal.id, false)}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(componentId, terminal.id, e);
      }}
      // Keep the click from reaching the canvas, which would cancel the
      // pending connection we just started on mousedown.
      onClick={(e) => e.stopPropagation()}
    >
      <title>{isFull ? `${tooltip} (at connection limit)` : tooltip}</title>
      {isCommPort ? (
        // Communication ports render as small squares to distinguish from power terminals
        <>
          <rect
            x={-(r + 3)} y={-(r + 3)} width={(r + 3) * 2} height={(r + 3) * 2}
            fill="transparent"
            style={{ cursor: cursorStyle }}
          />
          <rect
            x={-r} y={-r} width={r * 2} height={r * 2}
            fill={fillColor}
            stroke={color}
            strokeWidth={isSource ? 2.5 : 1.5}
            rx={1}
          />
          {(isHighlighted || isHovered) && (
            <rect x={-(r + 4)} y={-(r + 4)} width={(r + 4) * 2} height={(r + 4) * 2}
              fill="none" stroke={color} strokeWidth={1.5} opacity={0.7} rx={2} />
          )}
        </>
      ) : (
        <>
          <circle
            r={r + 3}
            fill="transparent"
            style={{ cursor: cursorStyle }}
          />
          <circle
            r={r}
            fill={fillColor}
            stroke={color}
            strokeWidth={isSource ? 2.5 : isPending ? 2.5 : 1.5}
            style={{ transition: 'r 0.1s' }}
          />
          {(isHighlighted || isHovered) && (
            <circle r={r + 4} fill="none" stroke={color} strokeWidth={1.5} opacity={0.7} />
          )}
          {isSource && (
            <circle r={r + 5} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
          )}
        </>
      )}
    </g>
  );
}
