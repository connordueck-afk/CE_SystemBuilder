import type { EffectiveTerminal, TerminalSide } from '../../types/system';

interface Props {
  terminal: EffectiveTerminal;
  componentLabel?: string;
  color: string;
  /** Effective (post-rotation) side the terminal faces; positions the label. */
  side: TerminalSide;
  isFull: boolean;
  /** Inverse of the component orientation so the label renders upright. */
  inverseTransform?: string;
}

function terminalLabelText(terminal: EffectiveTerminal, componentLabel?: string): string {
  return terminal.label || componentLabel || 'Connection node';
}

/**
 * The hover label pill for a connection node. Rendered separately from the
 * Terminal itself so the caller can paint it in a top overlay layer, keeping it
 * in front of nearby nodes (SVG paint order is document order — there is no
 * z-index).
 */
export function TerminalHoverLabel({ terminal, componentLabel, color, side, isFull, inverseTransform }: Props) {
  // Sized roughly from the text length and placed on the side the terminal
  // faces so it points away from the component body.
  const labelText = isFull ? `${terminalLabelText(terminal, componentLabel)} (full)` : terminalLabelText(terminal, componentLabel);
  const pillW = labelText.length * 5.6 + 12;
  const pillH = 18;
  const gap = 6 + 8;
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
    // Counter-rotate so the label stays upright on rotated components.
    <g transform={inverseTransform} style={{ pointerEvents: 'none' }}>
      <g transform={pillTransform}>
        <rect x={rectX} y={rectY} width={pillW} height={pillH} rx={4} fill={color} opacity={0.95} />
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
  );
}
