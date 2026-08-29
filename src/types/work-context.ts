export type ContextReason =
  | "manual"
  | "task-switch"
  | "interruption"
  | "session-end";

export interface WorkContext {
  id: string;
  questId: string;
  savedAt: string;
  reason: ContextReason;
  note?: string;
  currentStepId?: string;
  nextAction?: string;
  blocker?: string;
  progress: number;
}

export interface SaveWorkContextInput {
  questId: string;
  reason: ContextReason;
  note?: string;
  currentStepId?: string;
  nextAction?: string;
  blocker?: string;
  progress?: number;
}
