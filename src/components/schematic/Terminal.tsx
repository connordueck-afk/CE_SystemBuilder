import type { TerminalDefinition } from '../../types/system';
import { busTypeFromTerminal } from '../../utils/electricalNetlist';
import type { BusColorMap } from '../../utils/busColors';

interface Props {
  terminal: TerminalDefinition;
  componentId: string;
  isHighlighted: boolean;
  isPending: boolean;
  isSource: boolean;
  isDisabled: boolean;
  busColors: BusColorMap;
  onMouseDown: (compId: string, termId: string, e: React.MouseEvent) => void;
}

function terminalColor(terminal: TerminalDefinition, busColors: BusColorMap): string {
  return busColors[busTypeFromTerminal(terminal)];
}

export function Terminal({ terminal, componentId, isHighlighted, isPending, isSource, isDisabled, busColors, onMouseDown }: Props) {
  const color = terminalColor(terminal, busColors);
  const r = (isHighlighted || isSource) ? 6 : 4;

  return (
    <g
      transform={`translate(${terminal.offsetX}, ${terminal.offsetY})`}
      style={{
        cursor: isDisabled ? 'default' : 'crosshair',
        pointerEvents: isDisabled ? 'none' : 'auto',
        opacity: isDisabled ? 0.2 : 1,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(componentId, terminal.id, e);
      }}
    >
      <circle
        r={r + 3}
        fill="transparent"
        style={{ cursor: isDisabled ? 'default' : 'crosshair' }}
      />
      <circle
        r={r}
        fill={isSource ? color : '#ffffff'}
        stroke={color}
        strokeWidth={isSource ? 2.5 : isPending ? 2.5 : 1.5}
        style={{ transition: 'r 0.1s' }}
      />
      {isHighlighted && (
        <circle r={r + 4} fill="none" stroke={color} strokeWidth={1.5} opacity={0.7} />
      )}
      {isSource && (
        <circle r={r + 5} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
      )}
    </g>
  );
}
