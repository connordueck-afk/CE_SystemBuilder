import { memo, useState } from 'react';
import type { SystemComponent, Product } from '../../types/system';
import { Terminal } from './Terminal';
import { TerminalHoverLabel } from './TerminalHoverLabel';
import { getEffectiveTerminals } from '../../utils/effectiveTerminals';
import { getEffectiveProductForComponent } from '../../utils/solarCalculations';
import { orientationTransform, inverseOrientationTransform, transformOrientationSide } from '../../utils/componentOrientation';
import { scaledTerminalOffset } from '../../utils/componentScale';
import type { BusColorMap } from '../../utils/busColors';
import { busTypeFromTerminal } from '../../utils/electricalNetlist';
import { linkGroupKey } from '../../utils/portLinks';
import type { EffectiveTerminal } from '../../types/system';

interface Props {
  components: SystemComponent[];
  products: Map<string, Product>;
  pendingSourceKey: string | null;
  validTargetTerminals: Set<string> | null;
  fullTerminals: Set<string>;
  busColors: BusColorMap;
  onTerminalMouseDown: (compId: string, termId: string, e: React.MouseEvent) => void;
}

/**
 * Renders every component's terminals (connection nodes) as a single top layer so
 * they sit above the cables/connection hit areas. This keeps a node clickable when
 * starting or completing a connection even where a cable crosses over it.
 */
export const TerminalLayer = memo(function TerminalLayer({
  components,
  products,
  pendingSourceKey,
  validTargetTerminals,
  fullTerminals,
  busColors,
  onTerminalMouseDown,
}: Props) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const onHover = (compId: string, termId: string, hovered: boolean) => {
    const key = `${compId}:${termId}`;
    setHoveredKey((prev) => (hovered ? key : prev === key ? null : prev));
  };

  // The hovered terminal's label is rendered in a single overlay group after
  // every terminal so it always paints in front of nearby nodes (SVG has no
  // z-index — paint order is document order).
  let overlayLabel: React.ReactNode = null;

  return (
    <g>
      {components.map((component) => {
        const product = getEffectiveProductForComponent(component, products.get(component.productId));
        if (!product) return null;
        const rotation = component.rotationDeg ?? 0;
        const inverseTransform = inverseOrientationTransform(rotation);
        const label = component.label ?? product.name;
        const terminals = getEffectiveTerminals(product, component);
        const offsets = new Map(terminals.map((t) => [t.id, scaledTerminalOffset(component, t)]));

        // Group internally-bonded jacks so we can draw a rail showing they're one node.
        const linkGroups = new Map<string, EffectiveTerminal[]>();
        for (const t of terminals) {
          const groupKey = linkGroupKey(product, t);
          if (!groupKey) continue;
          linkGroups.set(groupKey, [...(linkGroups.get(groupKey) ?? []), t]);
        }

        return (
          <g key={component.id} transform={`translate(${component.x}, ${component.y})`}>
            <g transform={orientationTransform(rotation)}>
              {[...linkGroups.values()].map((group) => {
                if (group.length < 2) return null;
                const points = group
                  .map((t) => offsets.get(t.id)!)
                  .sort((a, b) => (a.offsetX - b.offsetX) || (a.offsetY - b.offsetY));
                const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.offsetX} ${p.offsetY}`).join(' ');
                return (
                  <path
                    key={linkGroupKey(product, group[0])}
                    d={d}
                    fill="none"
                    stroke={busColors[busTypeFromTerminal(group[0])]}
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity={0.3}
                    style={{ pointerEvents: 'none' }}
                  />
                );
              })}
              {terminals.map((t) => {
                const offset = offsets.get(t.id)!;
                const key = `${component.id}:${t.id}`;
                const isSource = pendingSourceKey === key;
                const isHighlighted = !isSource && (validTargetTerminals?.has(key) ?? false);
                const isDisabled = validTargetTerminals !== null && !isSource && !isHighlighted;
                const isFull = fullTerminals.has(key);
                const isHovered = hoveredKey === key;
                if (isHovered) {
                  overlayLabel = (
                    <g transform={`translate(${component.x}, ${component.y})`}>
                      <g transform={orientationTransform(rotation)}>
                        <g transform={`translate(${offset.offsetX}, ${offset.offsetY})`}>
                          <TerminalHoverLabel
                            terminal={{ ...t, ...offset }}
                            componentLabel={label}
                            color={busColors[busTypeFromTerminal(t)]}
                            side={transformOrientationSide(rotation, t.side)}
                            isFull={isFull}
                            inverseTransform={inverseTransform}
                          />
                        </g>
                      </g>
                    </g>
                  );
                }
                return (
                  <Terminal
                    key={t.id}
                    terminal={{ ...t, ...offset }}
                    componentId={component.id}
                    componentLabel={label}
                    isHighlighted={isHighlighted}
                    isPending={false}
                    isSource={isSource}
                    isDisabled={isDisabled}
                    isFull={isFull}
                    isHovered={isHovered}
                    busColors={busColors}
                    onHover={onHover}
                    onMouseDown={onTerminalMouseDown}
                  />
                );
              })}
            </g>
          </g>
        );
      })}
      {overlayLabel}
    </g>
  );
});
