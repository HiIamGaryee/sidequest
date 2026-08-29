// WebMCP TypeScript Domain Types

export type ToolCategory =
  | "WORK"
  | "FOCUS"
  | "CONTEXT"
  | "SIDE QUEST"
  | "RECOVERY"
  | "PLAYER";

export type ActionType = "read" | "mutation";

export interface StateSnapshot {
  mainQuestTitle?: string;
  nextAction?: string;
  progress?: number;
  focusStatus?: string;
  parkedSideQuestCount?: number;
}

export interface AgentActivity {
  id: string;
  toolName: string;
  category?: ToolCategory;
  actionType?: ActionType;
  summary: string;
  status: "success" | "error";
  timestamp: string;
  durationMs?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  beforeState?: StateSnapshot;
  afterState?: StateSnapshot;
  error?: {
    code: string;
    message: string;
  };
}

export interface WebMcpStatus {
  isSupported: boolean;
  isRegistered: boolean;
  registeredCount: number;
  lastAction?: AgentActivity;
  error?: string;
}

export interface ToolResultSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ToolResultError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ToolResult<T = unknown> = ToolResultSuccess<T> | ToolResultError;

export interface AgentActionNotification {
  id: string;
  title: string;
  summary: string;
  toolName: string;
  category?: ToolCategory;
  actionType?: ActionType;
  durationMs?: number;
  timestamp: number;
  status: "success" | "error";
}

export interface DemoScenarioStep {
  id: string;
  title: string;
  description: string;
  tools: string[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface DemoReadinessReport {
  isSupported: boolean;
  isRegistered: boolean;
  toolCount: number;
  isDemoDataActive: boolean;
  hasMainQuest: boolean;
  hasResumableContext: boolean;
  isFullyReady: boolean;
}
