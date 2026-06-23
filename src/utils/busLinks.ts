import type { Product } from '../types/system';

// ============================================================
// busLinks.ts — direct bolted bus links between modules (no cable)
//
// Some distribution modules (e.g. Victron Lynx) bolt together via a shared
// busbar, so a connection between them carries current but uses no cable.
// A terminal opts in by declaring a `busLinkStandard`; a connection between
// two terminals that share the same standard is a cableless bus link.
// Brand-agnostic — any manufacturer's bolt-together busbar uses the same tag.
// ============================================================

export function terminalBusLinkStandard(
  product: Product | undefined,
  terminalId: string
): string | undefined {
  return product?.terminals.find((t) => t.id === terminalId)?.busLinkStandard;
}

/**
 * The shared bus-link standard for a connection's two endpoints, or undefined when the
 * endpoints aren't both bolt-together terminals of the same standard.
 */
export function sharedBusLinkStandard(
  fromProduct: Product | undefined,
  fromTerminalId: string,
  toProduct: Product | undefined,
  toTerminalId: string
): string | undefined {
  const a = terminalBusLinkStandard(fromProduct, fromTerminalId);
  const b = terminalBusLinkStandard(toProduct, toTerminalId);
  return a && b && a === b ? a : undefined;
}
