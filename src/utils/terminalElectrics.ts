import type { TerminalDefinition } from '../types/system';

/**
 * Resolves the effective current limit for a terminal at a given system voltage.
 *
 * When a terminal declares both maxCurrentA (a hard contact/wire limit) and
 * maxPowerW (a conversion power ceiling), the binding constraint is whichever
 * produces the lower current at the operating voltage:
 *
 *   effectiveA = min(maxCurrentA, maxPowerW / systemVoltage)
 *
 * Examples:
 *   MPPT 100A / 1200W at 12V → min(100, 1200/12) = 100A
 *   MPPT 100A / 1200W at 48V → min(100, 1200/48) = 25A
 *
 * Returns undefined if neither field is set — callers should fall back to
 * product-level estimation in that case.
 */
export function resolveTerminalCurrentA(
  terminal: TerminalDefinition,
  systemVoltageV: number
): number | undefined {
  const fromCurrent = terminal.maxCurrentA;
  const fromPower =
    terminal.maxPowerW != null && systemVoltageV > 0
      ? terminal.maxPowerW / systemVoltageV
      : undefined;

  if (fromCurrent == null && fromPower == null) return undefined;
  return Math.min(fromCurrent ?? Infinity, fromPower ?? Infinity);
}
