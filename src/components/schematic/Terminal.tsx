import type { TerminalDefinition } from '../../types/system';
import { busTypeFromTerminal } from '../../utils/electricalNetlist';
import type { BusColorMap } from '../../utils/busColors';

interface Props {
  terminal: TerminalDefinition;
  componentId: string;
  isHighlighted: boolean;
  isPending: boolean;
  busColors: BusColorMap;
  onMouseDown: (compId: string, termId: string, e: React.MouseEvent) => void;
}

function terminalColor(terminal: TerminalDefinition, busColors: BusColorMap): string {
  return busColors[busTypeFromTerminal(terminal)];
}

export function Terminal({ terminal, componentId, isHighlighted, isPending, busColors, onMouseDown }: Props) {
  const color = terminalColor(terminal, busColors);
  const r = isHighlighted ? 6 : 4;

  return (
    <g
      transform={`translate(${terminal.offsetX}, ${terminal.offsetY})`}
      style={{ cursor: 'crosshair' }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(componentId, terminal.id, e);
      }}
    >
      <circle
        r={r + 3}
        fill="transparent"
        style={{ cursor: 'crosshair' }}
      />
      <circle
        r={r}
        fill={isPending ? '#ffffff' : '#ffffff'}
        stroke={color}
        strokeWidth={isPending ? 2.5 : 1.5}
        style={{ transition: 'r 0.1s' }}
      />
      {isHighlighted && (
        <circle r={r + 4} fill="none" stroke={color} strokeWidth={1} opacity={0.5} />
      )}
    </g>
  );
}
