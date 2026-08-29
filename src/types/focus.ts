export type FocusSessionStatus = "idle" | "running" | "paused" | "completed";

export interface FocusSession {
  id: string;
  questId: string;
  questTitle: string;
  projectName?: string;
  startedAt: string;
  endedAt?: string;
  status: FocusSessionStatus;
  plannedMinutes: number;
  elapsedSeconds: number;
  pausedAt?: string;
  totalPausedSeconds: number;
  // Snapshot for session summary
  startingProgress: number;
  endingProgress?: number;
  startingCompletedStepIds: string[];
  endingCompletedStepIds?: string[];
  completedStepTitles?: string[];
}

export interface FocusTimerState {
  status: FocusSessionStatus;
  plannedMinutes: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  overtimeSeconds: number;
  isOvertime: boolean;
  isTimesUpPromptVisible: boolean;
}
