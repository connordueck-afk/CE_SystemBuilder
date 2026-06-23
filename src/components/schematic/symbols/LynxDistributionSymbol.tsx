import type { Product } from '../../../types/system';

interface Props {
  product: Product;
  /** Visual scale of the placed component (terminal dots use the same factor). */
  scale: number;
  selected: boolean;
}

/**
 * Schematic symbol for DC distribution modules (Lynx Distributor, Class-T Power In,
 * generic busbars). Drawn — rather than using a product photo — so that every
 * terminal dot lands exactly on the body: mains on the left, pass-through on the
 * right, and fused taps along the bottom with a fuse holder under each tap pair.
 *
 * All geometry is derived from the product's own terminal offsets (× scale), so the
 * art stays aligned with the terminal dots that ComponentNode renders separately.
 */
export function LynxDistributionSymbol({ product, scale, selected }: Props) {
  const w = product.width * scale;
  const h = product.height * scale;
  const hw = w / 2;
  const hh = h / 2;

  const stroke = selected ? '#1769d2' : '#3975c5';
  const terminalById = new Map(product.terminals.map((t) => [t.id, t]));
  const fuseSlots = product.distributionTopology?.fuseSlots ?? [];

  // Fuse-holder graphics: one per slot, centered between the slot's + tap and its
  // paired - return terminal, hanging from the busbar down to the bottom edge.
  const holderWidth = Math.min(26 * scale, (w / Math.max(fuseSlots.length, 1)) * 0.7);
  const fuseHolders = fuseSlots.map((slot) => {
    const pos = terminalById.get(slot.downstreamTerminalId);
    const neg = slot.pairedReturnTerminalId ? terminalById.get(slot.pairedReturnTerminalId) : undefined;
    const centerX = neg
      ? ((pos?.offsetX ?? 0) + neg.offsetX) / 2
      : (pos?.offsetX ?? 0);
    return { id: slot.id, label: slot.label, cx: centerX * scale };
  });

  return (
    <g>
      <rect
        x={-hw} y={-hh} width={w} height={h} rx={5}
        fill="#ffffff" stroke={stroke} strokeWidth={selected ? 3 : 2}
      />
      {/* Positive busbar strip near the top */}
      <rect
        x={-hw + 10} y={-hh + 14} width={w - 20} height={9} rx={3}
        fill="#eaf4ff" stroke="#3975c5" strokeWidth={0.8}
      />
      <text x={0} y={-hh + 10} textAnchor="middle" fill="#3975c5" fontSize={9} fontWeight={700}>
        DC BUS
      </text>

      {/* Fuse holders along the bottom, one under each fused tap pair */}
      {fuseHolders.map((holder) => (
        <g key={holder.id}>
          <line
            x1={holder.cx} y1={-hh + 23} x2={holder.cx} y2={hh - 18}
            stroke="#3975c5" strokeWidth={1}
          />
          <rect
            x={holder.cx - holderWidth / 2} y={hh - 22} width={holderWidth} height={16} rx={3}
            fill="#fff4d6" stroke="#c98518" strokeWidth={1}
          />
        </g>
      ))}

      <text
        x={0} y={fuseHolders.length > 0 ? -2 : hh - 8}
        textAnchor="middle" fill="#46546a" fontSize={8} fontWeight={600}
      >
        {product.name.includes('Lynx') ? 'Victron Lynx' : 'DC Distribution'}
      </text>
    </g>
  );
}
