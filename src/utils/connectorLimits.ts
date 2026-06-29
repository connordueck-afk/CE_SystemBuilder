import type {
  CommunicationConnectorType,
  ConnectorKind,
  ProductCommunicationPort,
  SystemConnection,
  TerminalDefinition,
} from '../types/system';

const SINGLE_CONN_ELECTRICAL: ConnectorKind[] = ['mc4', 'helios_orng', 'helios_blk'];
const SINGLE_CONN_COMM: CommunicationConnectorType[] = ['RJ45', 'M12', 'Deutsch', 'JST', 'VE.Direct'];

/**
 * Returns the maximum number of simultaneous connections allowed on a terminal,
 * or undefined for unlimited. Priority: explicit `maxConnections` on the terminal
 * definition, then connector-type defaults.
 */
export function effectiveMaxConnections(
  terminal: TerminalDefinition,
  commPort?: ProductCommunicationPort
): number | undefined {
  if (terminal.maxConnections != null) return terminal.maxConnections;
  if (commPort && SINGLE_CONN_COMM.includes(commPort.connectorType)) return 1;
  if (terminal.connector && SINGLE_CONN_ELECTRICAL.includes(terminal.connector.kind)) return 1;
  return undefined;
}

export function countTerminalConnections(
  connections: Pick<SystemConnection, 'fromComponentId' | 'fromTerminalId' | 'toComponentId' | 'toTerminalId'>[],
  componentId: string,
  terminalId: string
): number {
  return connections.filter(
    (c) =>
      (c.fromComponentId === componentId && c.fromTerminalId === terminalId) ||
      (c.toComponentId === componentId && c.toTerminalId === terminalId)
  ).length;
}

export function isTerminalFull(
  terminal: TerminalDefinition,
  commPort: ProductCommunicationPort | undefined,
  connections: Pick<SystemConnection, 'fromComponentId' | 'fromTerminalId' | 'toComponentId' | 'toTerminalId'>[],
  componentId: string
): boolean {
  const max = effectiveMaxConnections(terminal, commPort);
  if (max == null) return false;
  return countTerminalConnections(connections, componentId, terminal.id) >= max;
}
