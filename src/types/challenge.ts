export type ChallengeType =
  | "timed_action"
  | "step_count"
  | "main_quest_progress"
  | "no_switch";

export type ChallengeStatus =
  | "ready"
  | "active"
  | "completed"
  | "expired"
  | "cancelled";

export interface WorkChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  questId: string;
  questTitle: string;
  status: ChallengeStatus;
  targetValue: number; // e.g. 3 steps, 10% progress, 600s
  currentValue: number; // current step count, current delta, etc.
  durationSeconds?: number; // for timed_action (e.g. 600s = 10m)
  startedAt?: string;
  completedAt?: string;
  expiredAt?: string;
  cancelledAt?: string;
  xpReward: number;
  initialStepCompletedCount?: number;
  initialQuestProgress?: number;
  activeStepId?: string;
}

export interface ChallengePreset {
  type: ChallengeType;
  title: string;
  description: string;
  targetValue: number;
  durationSeconds?: number;
  xpReward: number;
  iconName: string;
}
