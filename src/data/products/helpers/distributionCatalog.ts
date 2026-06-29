import type {
  BusbarRatings,
  CommunicationProtocol,
  ConnectorKind,
  DataQuality,
  DistributionTopology,
  NominalVoltage,
  Product,
  ProductCommunicationPort,
  ProductPort,
  TerminalConnector,
  TerminalDefinition,
  TerminalGroupDefinition,
  TerminalSide,
} from '../../../types/system';

type DistributionProductType = 'busbar' | 'dc_distribution';

interface DistributionProductInput {
  id: string;
  manufacturer: string;
  name: string;
  productType: DistributionProductType;
  category?: string;
  nominalVoltage?: NominalVoltage | NominalVoltage[];
  maxCurrentA?: number;
  msrpUsd?: number;
  oemPriceUsd?: number;
  description?: string;
  partNumber?: string;
  productUrl?: string;
  imageUrl?: string;
  source?: string;
  notes?: string;
  dataQuality?: DataQuality;
  width: number;
  height: number;
  terminals: TerminalDefinition[];
  terminalGroups: TerminalGroupDefinition[];
  ports: ProductPort[];
  busbarRatings?: BusbarRatings;
  distributionTopology?: DistributionTopology;
  communicationPorts?: ProductCommunicationPort[];
}

interface GenericBusbarInput {
  id: string;
  name: string;
  connectionCount: number;
  maxCurrentA: number;
  msrpUsd: number;
  oemPriceUsd: number;
  width: number;
  offsets: number[];
}

interface DcStudTerminalInput {
  id: string;
  label: string;
  terminalGroupId: string;
  side: TerminalSide;
  offsetX: number;
  offsetY: number;
  notes?: string;
  busLinkStandard?: string;
  maxCurrentA?: number;
  connector?: TerminalConnector;
}

interface CommunicationTerminalInput {
  id: string;
  label: string;
  terminalGroupId: string;
  side: TerminalSide;
  offsetX: number;
  offsetY: number;
}

interface DcPortInput {
  id: string;
  label?: string;
  topology?: ProductPort['topology'];
  role?: ProductPort['role'];
  direction?: ProductPort['direction'];
  nominalVoltageV?: number;
  maxCurrentA?: number;
}

interface PowerGroupInput {
  id: string;
  portId: string;
  label: string;
  polarity?: TerminalGroupDefinition['polarity'];
  internallyCommon?: boolean;
  maxCurrentA?: number;
  requiresOvercurrentProtection?: boolean;
  maxFuseA?: number;
  notes?: string;
}

interface CommPortInput {
  id: string;
  label: string;
  protocols: CommunicationProtocol[];
  configuredProtocol?: CommunicationProtocol;
  connectorType?: ProductPort['connectorType'];
}

const m8Stud: TerminalConnector = { kind: 'stud', holeSize: 'M8' };

export function defineDistributionProduct(input: DistributionProductInput): Product {
  return {
    id: input.id,
    manufacturer: input.manufacturer,
    name: input.name,
    productType: input.productType,
    category: input.category ?? 'Distribution',
    ...(input.nominalVoltage != null ? { nominalVoltage: input.nominalVoltage } : {}),
    ...(input.maxCurrentA != null ? { maxCurrentA: input.maxCurrentA } : {}),
    ...(input.msrpUsd != null ? { msrpUsd: input.msrpUsd } : {}),
    ...(input.oemPriceUsd != null ? { oemPriceUsd: input.oemPriceUsd } : {}),
    ...(input.description != null ? { description: input.description } : {}),
    ...(input.partNumber != null ? { partNumber: input.partNumber } : {}),
    ...(input.productUrl != null ? { productUrl: input.productUrl } : {}),
    ...(input.imageUrl != null ? { imageUrl: input.imageUrl } : {}),
    ...(input.source != null ? { source: input.source } : {}),
    ...(input.notes != null ? { notes: input.notes } : {}),
    dataQuality: input.dataQuality ?? 'partial',
    width: input.width,
    height: input.height,
    terminals: input.terminals,
    terminalGroups: input.terminalGroups,
    ports: input.ports,
    ...(input.busbarRatings != null ? { busbarRatings: input.busbarRatings } : {}),
    ...(input.distributionTopology != null ? { distributionTopology: input.distributionTopology } : {}),
    ...(input.communicationPorts != null ? { communicationPorts: input.communicationPorts } : {}),
  };
}

export function defineGenericBusbar(input: GenericBusbarInput): Product {
  return defineDistributionProduct({
    id: input.id,
    manufacturer: 'Generic',
    name: input.name,
    productType: 'busbar',
    category: `${input.connectionCount} connection points`,
    nominalVoltage: [12, 24, 48],
    maxCurrentA: input.maxCurrentA,
    msrpUsd: input.msrpUsd,
    oemPriceUsd: input.oemPriceUsd,
    description: `Single-conductor DC busbar with ${input.connectionCount} connection points. Set the bus assignment on the placed component.`,
    source: 'Estimate',
    dataQuality: 'placeholder',
    width: input.width,
    height: 80,
    terminals: input.offsets.map((offsetX, index) => ({
      id: `terminal_${index + 1}`,
      label: `T${index + 1}`,
      side: 'bottom',
      offsetX,
      offsetY: 30,
      connector: m8Stud,
      notes: 'Bus connection point. Polarity determined by component busPolarity assignment.',
      terminalGroupId: 'bus',
    })),
    terminalGroups: [
      {
        id: 'bus',
        portId: 'main',
        label: 'Bus',
        groupType: 'power_conductor',
        internallyCommon: true,
        maxCurrentA: input.maxCurrentA,
        notes: 'All studs share one internal bus node. Polarity set per placed component (busPolarity).',
      },
    ],
    busbarRatings: {
      currentRatingA: input.maxCurrentA,
      connectionCount: input.connectionCount,
    },
    ports: [
      dcPort({
        id: 'main',
        label: 'Main',
        topology: 'bus',
        role: 'bus',
        direction: 'bidirectional',
        nominalVoltageV: 12,
        maxCurrentA: input.maxCurrentA,
      }, 'generic'),
    ],
  });
}

export function dcPort(input: DcPortInput, kind: ProductPort['kind'] = 'dc'): ProductPort {
  return {
    id: input.id,
    kind,
    topology: input.topology ?? 'bus',
    label: input.label,
    voltageClass: kind === 'dc' ? 'dc_low_voltage' : undefined,
    nominalVoltageV: input.nominalVoltageV ?? 12,
    ...(input.maxCurrentA != null ? { maxCurrentA: input.maxCurrentA } : {}),
    role: input.role ?? 'bus',
    direction: input.direction ?? 'bidirectional',
  };
}

export function commPort(input: CommPortInput): ProductPort {
  return {
    id: input.id,
    kind: 'comm',
    topology: 'two_pole',
    label: input.label,
    role: 'bidirectional',
    direction: 'bidirectional',
    connectorType: input.connectorType ?? 'RJ45',
    supportedProtocols: input.protocols,
    configuredProtocol: input.configuredProtocol ?? input.protocols[0],
  };
}

export function powerGroup(input: PowerGroupInput): TerminalGroupDefinition {
  return {
    id: input.id,
    portId: input.portId,
    label: input.label,
    groupType: 'power_conductor',
    ...(input.polarity != null ? { polarity: input.polarity } : {}),
    internallyCommon: input.internallyCommon ?? true,
    ...(input.maxCurrentA != null ? { maxCurrentA: input.maxCurrentA } : {}),
    ...(input.requiresOvercurrentProtection != null ? { requiresOvercurrentProtection: input.requiresOvercurrentProtection } : {}),
    ...(input.maxFuseA != null ? { maxFuseA: input.maxFuseA } : {}),
    ...(input.notes != null ? { notes: input.notes } : {}),
  };
}

export function commGroup(id: string, portId: string, label: string): TerminalGroupDefinition {
  return {
    id,
    portId,
    label,
    groupType: 'communication_interface',
    internallyCommon: false,
  };
}

export function signalGroup(id: string, portId: string, label: string): TerminalGroupDefinition {
  return {
    id,
    portId,
    label,
    groupType: 'signal_interface',
    internallyCommon: false,
  };
}

export function dcStudTerminal(input: DcStudTerminalInput): TerminalDefinition {
  return {
    id: input.id,
    label: input.label,
    side: input.side,
    offsetX: input.offsetX,
    offsetY: input.offsetY,
    terminalGroupId: input.terminalGroupId,
    connector: input.connector ?? m8Stud,
    ...(input.busLinkStandard != null ? { busLinkStandard: input.busLinkStandard } : {}),
    ...(input.maxCurrentA != null ? { maxCurrentA: input.maxCurrentA } : {}),
    ...(input.notes != null ? { notes: input.notes } : {}),
  };
}

export function commTerminal(input: CommunicationTerminalInput): TerminalDefinition {
  return {
    id: input.id,
    label: input.label,
    side: input.side,
    offsetX: input.offsetX,
    offsetY: input.offsetY,
    terminalGroupId: input.terminalGroupId,
  };
}

export function communicationPort(
  id: string,
  name: string,
  protocols: CommunicationProtocol[],
  connectorType: ProductCommunicationPort['connectorType'] = 'RJ45'
): ProductCommunicationPort {
  return {
    id,
    name,
    connectorType,
    supportedProtocols: protocols,
    configuredProtocol: protocols[0],
  };
}

export function connector(kind: ConnectorKind, holeSize?: string): TerminalConnector {
  return holeSize ? { kind, holeSize } : { kind };
}
