import type { SystemComponent, Product } from '../../types/system';
import { Terminal } from './Terminal';
import { getEffectiveTerminals } from '../../utils/effectiveTerminals';
import { getEffectiveProductForComponent } from '../../utils/solarCalculations';
import { orientationTransform } from '../../utils/componentOrientation';
import { scaledTerminalOffset } from '../../utils/componentScale';
import type { BusColorMap } from '../../utils/busColors';

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
export function TerminalLayer({
  components,
  products,
  pendingSourceKey,
  validTargetTerminals,
  fullTerminals,
  busColors,
  onTerminalMouseDown,
}: Props) {
  return (
    <g>
      {components.map((component) => {
        const product = getEffectiveProductForComponent(component, products.get(component.productId));
        if (!product) return null;
        const rotation = component.rotationDeg ?? 0;
        const label = component.label ?? product.name;
        const terminals = getEffectiveTerminals(product, component);

        return (
          <g key={component.id} transform={`translate(${component.x}, ${component.y})`}>
            <g transform={orientationTransform(rotation)}>
              {terminals.map((t) => {
                const offset = scaledTerminalOffset(component, t);
                const key = `${component.id}:${t.id}`;
                const isSource = pendingSourceKey === key;
                const isHighlighted = !isSource && (validTargetTerminals?.has(key) ?? false);
                const isDisabled = validTargetTerminals !== null && !isSource && !isHighlighted;
                const isFull = fullTerminals.has(key);
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
                    busColors={busColors}
                    onMouseDown={onTerminalMouseDown}
                  />
                );
              })}
            </g>
          </g>
        );
      })}
    </g>
  );
}
