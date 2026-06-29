// ============================================================
// System Design Validation Engine — public surface
// ============================================================
// Import the engine from here:
//   import { analyzeSystemDesign } from '../utils/analysis';
// ============================================================

export { analyzeSystemDesign } from './systemDesignValidation';
export { resolveTerminalGroups } from './terminalGroups';
export type {
  SystemDesignAnalysis,
  DesignIssue,
  DesignIssueSeverity,
  DesignIssueCategory,
  ConnectionDesignAnalysis,
  TerminalDesignAnalysis,
  TerminalGroupDesignAnalysis,
  ComponentDesignAnalysis,
  ResolvedTerminalGroup,
} from './types';
