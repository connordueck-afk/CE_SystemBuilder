// ============================================================
// System Design Validation Engine — analysis types
// ============================================================
// One authoritative analysis object (`SystemDesignAnalysis`) describing the
// validated design. The engine composes deterministic computation stages
// (connectivity graph, per-connection sizing, communication networks,
// electrical summary) and layers the terminal-group model + design issues on
// top. Legacy result shapes are produced via adapters under `.legacy` so the
// existing UI keeps working through a single entry point.
// ============================================================

import type {
  CommunicationNetwork,
  ConnectionPointKind,
  ConnectionPolarity,
  SystemWarning,
  TerminalGroupType,
} from '../../types/system';
import type { BusType, ElectricalNet, ElectricalNetlist } from '../electricalNetlist';
import type { ConnectionCircuitAnalysis, SystemCircuitAnalysis } from '../circuitAnalysis';
import type { ElectricalSummary } from '../systemSummary';
import type { ProtectionRecommendation } from '../protectionRecommendations';

export type DesignIssueSeverity = 'error' | 'warning' | 'info';

export type DesignIssueCategory =
  | 'connection'
  | 'capacity'
  | 'protection'
  | 'cable'
  | 'terminal'
  | 'compatibility'
  | 'communication'
  | 'product_data';

/** A single validation finding produced by the engine. */
export interface DesignIssue {
  id: string;
  severity: DesignIssueSeverity;
  category: DesignIssueCategory;
  code: string;
  message: string;
  componentId?: string;
  connectionId?: string;
  terminalKey?: string;
  terminalGroupKey?: string;
}

/**
 * A terminal group resolved for a placed component — either explicit (from the
 * product's `terminalGroups`) or derived from the resolved portId + kind + polarity
 * when the product does not declare one. This is the internal common node / logical interface.
 */
export interface ResolvedTerminalGroup {
  /** `${componentId}:${groupId}` */
  key: string;
  componentId: string;
  groupId: string;
  portId?: string;
  label: string;
  groupType: TerminalGroupType;
  kind?: ConnectionPointKind;
  polarity?: ConnectionPolarity;
  /** True when all member terminals are the same internal node. */
  internallyCommon: boolean;
  /** Internal bus / common-node current rating (A). */
  maxCurrentA?: number;
  maxVoltageV?: number;
  /** Member terminal ids on this component. */
  terminalIds: string[];
  /** True when this group was derived (product had no explicit terminalGroupId). */
  derived: boolean;
}

export interface TerminalDesignAnalysis {
  /** `${componentId}:${terminalId}` */
  key: string;
  componentId: string;
  terminalId: string;
  terminalGroupKey?: string;
  maxCurrentA?: number;
  /** Largest branch design current on a conductor at this terminal. */
  designCurrentA: number;
  connectionCount: number;
  maxConnections?: number;
  overCurrent: boolean;
  tooManyConnections: boolean;
}

export interface TerminalGroupDesignAnalysis {
  key: string;
  componentId: string;
  groupId: string;
  internallyCommon: boolean;
  maxCurrentA?: number;
  /** Largest conductor design current seen on any member terminal. */
  designCurrentA: number;
  overRated: boolean;
}

export interface ComponentDesignAnalysis {
  componentId: string;
  productId: string;
  issues: DesignIssue[];
}

/** Per-connection design analysis (legacy-compatible shape). */
export type ConnectionDesignAnalysis = ConnectionCircuitAnalysis;

/**
 * The single authoritative analysis object. The UI consumes this (directly or via
 * the `.legacy` adapters) instead of calling the individual analysis modules.
 */
export interface SystemDesignAnalysis {
  graph: ElectricalNetlist;
  powerDomains: ElectricalNet[];
  communicationNetworks: CommunicationNetwork[];

  connections: Record<string, ConnectionDesignAnalysis>;
  terminals: Record<string, TerminalDesignAnalysis>;
  terminalGroups: Record<string, TerminalGroupDesignAnalysis>;
  components: Record<string, ComponentDesignAnalysis>;

  issues: DesignIssue[];
  warnings: SystemWarning[];

  legacy: {
    circuitAnalysis: SystemCircuitAnalysis;
    electricalNetlist: ElectricalNetlist;
    electricalSummary: ElectricalSummary;
    protectionRecommendations: ProtectionRecommendation[];
  };
}

export type { BusType };
