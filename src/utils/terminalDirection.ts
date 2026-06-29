import type { ConnectionRole, Product, TerminalDefinition, TerminalDirection } from '../types/system';
import { terminalMaxCurrentA } from './portSpecs';

const INPUT_ID_PREFIXES = ['in', 'input', 'pv', 'ac_in'];
const OUTPUT_ID_PREFIXES = ['out', 'output', 'load', 'ac_out'];

interface TerminalDirectionInput {
  id: string;
  role: ConnectionRole;
  direction?: TerminalDirection;
}

function terminalIdStartsWith(terminal: TerminalDirectionInput, prefixes: string[]): boolean {
  const id = terminal.id.toLowerCase();
  return prefixes.some((prefix) => id === prefix || id.startsWith(`${prefix}_`));
}

export function inferTerminalDirection(terminal: TerminalDirectionInput): TerminalDirection {
  if (terminal.direction) return terminal.direction;

  if (terminal.role === 'source') return 'output';
  if (terminal.role === 'sink' || terminal.role === 'sense') return 'input';
  if (terminal.role === 'bidirectional' || terminal.role === 'bus' || terminal.role === 'control') {
    return 'bidirectional';
  }

  if (terminal.role === 'pass_through') {
    if (terminalIdStartsWith(terminal, INPUT_ID_PREFIXES)) return 'input';
    if (terminalIdStartsWith(terminal, OUTPUT_ID_PREFIXES)) return 'output';
  }

  return 'bidirectional';
}

export function canReceivePower(terminal: TerminalDirectionInput): boolean {
  const direction = inferTerminalDirection(terminal);
  return direction === 'input' || direction === 'bidirectional';
}

export function canProvidePower(terminal: TerminalDirectionInput): boolean {
  const direction = inferTerminalDirection(terminal);
  return direction === 'output' || direction === 'bidirectional';
}

export function terminalDirectionLabel(terminal: TerminalDirectionInput): string {
  const direction = inferTerminalDirection(terminal);
  if (direction === 'bidirectional') return 'Bidirectional';
  return direction === 'input' ? 'Input' : 'Output';
}

export function terminalCurrentLimitA(product: Product, terminal: TerminalDefinition): number | undefined {
  return terminalMaxCurrentA(product, terminal) ?? product.protectionRatings?.currentRatingA ?? product.maxCurrentA;
}
