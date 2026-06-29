import type {
  BatteryRatings,
  CommunicationConnectorType,
  CommunicationProtocol,
  DataQuality,
  NominalVoltage,
  Product,
  ProductCommunicationPort,
  TerminalConnector,
  TerminalSide,
} from '../../../types/system';

interface DcTerminalInput {
  side: TerminalSide;
  offsetX: number;
  offsetY: number;
  maxCurrentA: number;
  connector: TerminalConnector;
  notes?: string;
}

interface BatteryCommunicationTerminalInput {
  id: string;
  label: string;
  side: TerminalSide;
  offsetX: number;
  offsetY: number;
  name?: string;
  connectorType: CommunicationConnectorType;
  supportedProtocols: CommunicationProtocol[];
  configuredProtocol?: CommunicationProtocol;
  isConfigurable?: boolean;
}

interface CatalogBatteryInput {
  id: string;
  manufacturer: string;
  name: string;
  nominalVoltage: NominalVoltage;
  capacityWh: number;
  maxCurrentA: number;
  msrpUsd?: number;
  oemPriceUsd?: number;
  description?: string;
  partNumber?: string;
  productUrl?: string;
  source?: string;
  notes?: string;
  dataQuality?: DataQuality;
  width: number;
  height: number;
  positiveTerminal: DcTerminalInput;
  negativeTerminal: DcTerminalInput;
  communicationTerminals?: BatteryCommunicationTerminalInput[];
  batteryRatings: BatteryRatings;
}

const positiveNotes = 'DC positive terminal. Requires overcurrent protection (fuse/breaker) on the positive conductor.';
const negativeNotes = 'DC negative terminal.';

export function defineCatalogBattery(input: CatalogBatteryInput): Product {
  const communicationTerminals = input.communicationTerminals ?? [];
  const communicationPorts: ProductCommunicationPort[] = communicationTerminals.map((terminal) => ({
    id: terminal.id,
    name: terminal.name ?? terminal.label,
    connectorType: terminal.connectorType,
    supportedProtocols: terminal.supportedProtocols,
    ...(terminal.configuredProtocol != null ? { configuredProtocol: terminal.configuredProtocol } : {}),
    ...(terminal.isConfigurable != null ? { isConfigurable: terminal.isConfigurable } : {}),
  }));

  return {
    id: input.id,
    manufacturer: input.manufacturer,
    name: input.name,
    productType: 'battery',
    category: 'Batteries',
    nominalVoltage: input.nominalVoltage,
    capacityWh: input.capacityWh,
    maxCurrentA: input.maxCurrentA,
    ...(input.msrpUsd != null ? { msrpUsd: input.msrpUsd } : {}),
    ...(input.oemPriceUsd != null ? { oemPriceUsd: input.oemPriceUsd } : {}),
    ...(input.description != null ? { description: input.description } : {}),
    ...(input.partNumber != null ? { partNumber: input.partNumber } : {}),
    ...(input.productUrl != null ? { productUrl: input.productUrl } : {}),
    ...(input.source != null ? { source: input.source } : {}),
    ...(input.notes != null ? { notes: input.notes } : {}),
    dataQuality: input.dataQuality ?? 'partial',
    width: input.width,
    height: input.height,
    terminals: [
      {
        id: 'dc_pos',
        label: '+',
        side: input.positiveTerminal.side,
        offsetX: input.positiveTerminal.offsetX,
        offsetY: input.positiveTerminal.offsetY,
        maxCurrentA: input.positiveTerminal.maxCurrentA,
        connector: input.positiveTerminal.connector,
        terminalGroupId: 'dc_pos',
        notes: input.positiveTerminal.notes ?? positiveNotes,
      },
      {
        id: 'dc_neg',
        label: '-',
        side: input.negativeTerminal.side,
        offsetX: input.negativeTerminal.offsetX,
        offsetY: input.negativeTerminal.offsetY,
        maxCurrentA: input.negativeTerminal.maxCurrentA,
        connector: input.negativeTerminal.connector,
        terminalGroupId: 'dc_neg',
        notes: input.negativeTerminal.notes ?? negativeNotes,
      },
      ...communicationTerminals.map((terminal) => ({
        id: terminal.id,
        label: terminal.label,
        side: terminal.side,
        offsetX: terminal.offsetX,
        offsetY: terminal.offsetY,
        terminalGroupId: terminal.id,
      })),
    ],
    ports: [
      {
        id: 'dc',
        kind: 'dc',
        topology: 'two_pole',
        label: 'DC',
        nominalVoltageV: input.batteryRatings.nominalVoltageV,
        voltageClass: 'dc_low_voltage',
        maxCurrentA: input.maxCurrentA,
        role: 'bidirectional',
        direction: 'bidirectional',
      },
      ...communicationTerminals.map((terminal) => ({
        id: terminal.id,
        kind: 'comm' as const,
        label: terminal.name ?? terminal.label,
        topology: 'two_pole' as const,
        role: 'bidirectional' as const,
        direction: 'bidirectional' as const,
        connectorType: terminal.connectorType,
        supportedProtocols: terminal.supportedProtocols,
        ...(terminal.configuredProtocol != null ? { configuredProtocol: terminal.configuredProtocol } : {}),
        ...(terminal.isConfigurable != null ? { isConfigurable: terminal.isConfigurable } : {}),
      })),
    ],
    terminalGroups: [
      {
        id: 'dc_pos',
        portId: 'dc',
        label: 'DC Positive',
        groupType: 'power_conductor',
        polarity: 'positive',
        internallyCommon: true,
        maxCurrentA: input.positiveTerminal.maxCurrentA,
        requiresOvercurrentProtection: true,
        notes: 'Battery positive conductor group.',
      },
      {
        id: 'dc_neg',
        portId: 'dc',
        label: 'DC Negative',
        groupType: 'power_conductor',
        polarity: 'negative',
        internallyCommon: true,
        maxCurrentA: input.negativeTerminal.maxCurrentA,
        notes: 'Battery negative conductor group.',
      },
      ...communicationTerminals.map((terminal) => ({
        id: terminal.id,
        portId: terminal.id,
        label: terminal.name ?? terminal.label,
        groupType: 'communication_interface' as const,
        internallyCommon: true,
      })),
    ],
    batteryRatings: input.batteryRatings,
    ...(communicationPorts.length > 0 ? { communicationPorts } : {}),
  };
}
