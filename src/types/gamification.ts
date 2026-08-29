export type StatusVariant =
  | "idle"
  | "active"
  | "focus"
  | "complete"
  | "warning"
  | "recovery"
  | "parked"
  | "locked";

export interface PlayerStateMetric {
  id: string;
  label: string;
  value: string;
  percentage?: number;
  statusVariant?: StatusVariant;
  statusText?: string;
  hint?: string;
}

export interface DashboardStatItem {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  iconName?: string;
}

export interface PlayerProfile {
  xp: number;
  level: number;
  lifetimeXp: number;
  currentCombo: number;
  bestCombo: number;
}

export type XpEventType =
  | "step_completed"
  | "quest_completed"
  | "main_quest_completed"
  | "focus_session_completed"
  | "resume_after_interruption"
  | "side_quest_parked"
  | "recovery_completed"
  | "unstuck_action"
  | "daily_clear"
  | "daily_recovery_bonus"
  | "boss_defeated"
  | "challenge_completed"
  | "skill_unlocked_bonus";

export interface XpEvent {
  id: string;
  type: XpEventType;
  amount: number;
  createdAt: string;
  referenceId?: string;
  label?: string;
  metadata?: Record<string, unknown>;
}

export type AchievementCategory =
  | "progress"
  | "focus"
  | "recovery"
  | "discipline";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
}

export interface GamificationSettings {
  enabled: boolean;
  xpFeedback: boolean;
  achievementPopups: boolean;
  comboDisplay: boolean;
}

export interface LevelUpEvent {
  id: string;
  oldLevel: number;
  newLevel: number;
  oldTitle: string;
  newTitle: string;
  timestamp: string;
}

export interface XpFeedbackItem {
  id: string;
  amount: number;
  label: string;
  type: XpEventType;
  timestamp: number;
}

// Backward compatibility alias for AchievementItem
export type AchievementItem = Achievement;
