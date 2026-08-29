export type RecoveryType =
  | "water"
  | "movement"
  | "stretch"
  | "eyes"
  | "bio"
  | "break";

export type RecoveryQuestStatus =
  | "pending"
  | "active"
  | "completed"
  | "snoozed"
  | "skipped";

export interface RecoveryQuest {
  id: string;
  type: RecoveryType;
  title: string;
  description: string;
  status: RecoveryQuestStatus;
  createdAt: string;
  completedAt?: string;
  snoozedUntil?: string;
  sourceSessionId?: string;
  durationSeconds?: number;
}

export interface RecoveryPreferences {
  enabled: boolean;
  waterEnabled: boolean;
  movementEnabled: boolean;
  stretchEnabled: boolean;
  eyesEnabled: boolean;
  bioEnabled: boolean;
  breakEnabled: boolean;
}

export interface RecoveryLog {
  id: string;
  type: RecoveryType;
  timestamp: string;
  sessionId?: string;
  durationSeconds?: number;
  questId?: string;
}

export type RecoveryStatusLabel =
  | "CLEAR"
  | "DUE SOON"
  | "READY"
  | "SNOOZED"
  | "ACTIVE"
  | "DONE";
