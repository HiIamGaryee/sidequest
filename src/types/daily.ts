import type { RecoveryType } from "./recovery";

export type DailyMissionRole = "main" | "side";

export interface DailyMission {
  id: string;
  date: string; // YYYY-MM-DD
  questId: string;
  role: DailyMissionRole;
  completed: boolean;
  completedAt?: string;
}

export interface DailyRecoveryGoal {
  type: RecoveryType;
  target: number;
}

export interface DailyLoadout {
  date: string; // YYYY-MM-DD
  mainQuestId?: string;
  sideQuestIds: string[];
  recoveryGoals: DailyRecoveryGoal[];
  completedAt?: string;
  claimedClearBonusAt?: string;
  claimedRecoveryBonusAt?: string;
}

/**
 * Returns a standardized local calendar date key: "YYYY-MM-DD".
 * Avoids UTC mismatch by querying local year, month, and date.
 */
export function getLocalDateKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const DEFAULT_DAILY_RECOVERY_GOALS: DailyRecoveryGoal[] = [
  { type: "water", target: 3 },
  { type: "movement", target: 2 },
];
