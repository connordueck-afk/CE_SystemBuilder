import { useState } from 'react';
import type { EffectiveTerminal, TerminalSide } from '../../types/system';
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
  busColors: BusColorMap;
  /** Inverse of the component orientation so the hover label renders upright. */
  inverseTransform?: string;
  /** Effective (post-rotation) side the terminal faces; positions the hover label. */
  labelSide?: TerminalSide;
  onMouseDown: (compId: string, termId: string, e: React.MouseEvent) => void;
}

function terminalTooltip(terminal: EffectiveTerminal, componentLabel?: string): string {
  const parts: string[] = [];
  if (componentLabel) parts.push(componentLabel);
  if (terminal.label) parts.push(terminal.label);
  if (parts.length === 0) return 'Connection Node';
  return parts.join(' — ');
}

function terminalLabelText(terminal: EffectiveTerminal, componentLabel?: string): string {
  return terminal.label || componentLabel || 'Connection node';
}

function terminalColor(terminal: EffectiveTerminal, busColors: BusColorMap): string {
  return busColors[busTypeFromTerminal(terminal)];
}

export function Terminal({ terminal, componentId, componentLabel, isHighlighted, isPending, isSource, isDisabled, isFull, busColors, inverseTransform, labelSide, onMouseDown }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const color = terminalColor(terminal, busColors);
  const enlarged = isHighlighted || isSource || isHovered;
  const r = enlarged ? 6 : 4;
  const isCommPort = terminal.kind === 'network';
  const tooltip = terminalTooltip(terminal, componentLabel);

  // Full terminals: solid fill at reduced opacity when idle, disabled when a connection is being drawn
  const fillColor = (isSource || isFull) ? color : '#ffffff';
  const cursorStyle = isDisabled ? 'default' : (isFull ? 'not-allowed' : 'crosshair');

  // Hover label pill, sized roughly from the text length and placed on the side
  // the terminal faces so it points away from the component body.
  const labelText = isFull ? `${terminalLabelText(terminal, componentLabel)} (full)` : terminalLabelText(terminal, componentLabel);
  const pillW = labelText.length * 5.6 + 12;
  const pillH = 18;
  const gap = r + 8;
  const side = labelSide ?? terminal.side;
  let pillTransform: string;
  let rectX: number, rectY: number, textX: number, textY: number;
  switch (side) {
    case 'right':
      pillTransform = `translate(${gap}, 0)`;
      rectX = 0; rectY = -pillH / 2; textX = pillW / 2; textY = 0;
      break;
    case 'left':
      pillTransform = `translate(${-gap}, 0)`;
      rectX = -pillW; rectY = -pillH / 2; textX = -pillW / 2; textY = 0;
      break;
    case 'bottom':
      pillTransform = `translate(0, ${gap})`;
      rectX = -pillW / 2; rectY = 0; textX = 0; textY = pillH / 2;
      break;
    case 'top':
    default:
      pillTransform = `translate(0, ${-gap})`;
      rectX = -pillW / 2; rectY = -pillH; textX = 0; textY = -pillH / 2;
      break;
  }

  return (
    <g
      transform={`translate(${terminal.offsetX}, ${terminal.offsetY})`}
      style={{
        cursor: cursorStyle,
        pointerEvents: isDisabled ? 'none' : 'auto',
        opacity: isDisabled ? 0.2 : (isFull && !isSource) ? 0.55 : 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      {isHovered && (
        // Counter-rotate so the label stays upright on rotated components.
        <g transform={inverseTransform} style={{ pointerEvents: 'none' }}>
          <g transform={pillTransform}>
            <rect
              x={rectX}
              y={rectY}
              width={pillW}
              height={pillH}
              rx={4}
              fill={color}
              opacity={0.95}
            />
            <text
              x={textX}
              y={textY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize={10}
              fontWeight={600}
              style={{ userSelect: 'none' }}
            >
              {labelText}
            </text>
          </g>
        </g>
      )}
    </g>
  );
}
