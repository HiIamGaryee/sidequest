import type {
  RecoveryType,
  RecoveryQuest,
  RecoveryLog,
  RecoveryPreferences,
  RecoveryStatusLabel,
} from "@/types/recovery";
import {
  RECOVERY_INTERVALS,
  RECOVERY_DURATIONS,
  RECOVERY_PRIORITY_ORDER,
  GLOBAL_RECOVERY_COOLDOWN_MINUTES,
  RECOVERY_CONFIG,
} from "@/config/recovery";

export function isRecoveryTypeEnabled(
  preferences: RecoveryPreferences,
  type: RecoveryType
): boolean {
  if (!preferences.enabled) return false;
  switch (type) {
    case "water":
      return preferences.waterEnabled;
    case "movement":
      return preferences.movementEnabled;
    case "stretch":
      return preferences.stretchEnabled;
    case "eyes":
      return preferences.eyesEnabled;
    case "bio":
      return preferences.bioEnabled;
    case "break":
      return preferences.breakEnabled;
    default:
      return false;
  }
}

export function getLatestRecoveryLog(
  logs: RecoveryLog[],
  type?: RecoveryType
): RecoveryLog | undefined {
  if (!type) {
    return logs[0];
  }
  return logs.find((log) => log.type === type);
}

export function getMinutesSinceRecovery(
  logs: RecoveryLog[],
  type: RecoveryType,
  fallbackMinutes?: number
): number | null {
  const latest = getLatestRecoveryLog(logs, type);
  if (!latest) {
    return fallbackMinutes !== undefined ? fallbackMinutes : null;
  }
  const diffMs = Date.now() - new Date(latest.timestamp).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60)));
}

export function getPendingRecoveryQuest(
  quests: RecoveryQuest[]
): RecoveryQuest | undefined {
  return quests.find((q) => q.status === "pending" || q.status === "active");
}

export function getActiveRecoveryQuest(
  quests: RecoveryQuest[]
): RecoveryQuest | undefined {
  return quests.find((q) => q.status === "active");
}

export function formatRecoveryDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function formatRecoveryTimeAgo(isoString?: string): string {
  if (!isoString) return "No recent log";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins <= 0) return "Just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

export interface RecoveryStatusInfo {
  type: RecoveryType;
  label: string;
  statusLabel: RecoveryStatusLabel;
  statusVariant: "active" | "idle" | "focus" | "complete";
  timeDescription: string;
  minutesSince: number | null;
  isDue: boolean;
}

export function getRecoveryStatusInfo(
  logs: RecoveryLog[],
  type: RecoveryType,
  sessionElapsedMinutes = 0
): RecoveryStatusInfo {
  const config = RECOVERY_CONFIG[type];
  const interval = RECOVERY_INTERVALS[type];
  const latestLog = getLatestRecoveryLog(logs, type);

  let minutesSince: number | null = null;
  if (latestLog) {
    minutesSince = Math.max(0, Math.floor((Date.now() - new Date(latestLog.timestamp).getTime()) / (1000 * 60)));
  } else if (sessionElapsedMinutes > 0) {
    minutesSince = sessionElapsedMinutes;
  }

  let statusLabel: RecoveryStatusLabel = "CLEAR";
  let statusVariant: "active" | "idle" | "focus" | "complete" = "idle";
  let timeDescription = "No recent log";
  let isDue = false;

  if (minutesSince === null) {
    timeDescription = "No recent log";
    statusLabel = "CLEAR";
    statusVariant = "idle";
  } else if (minutesSince >= interval) {
    isDue = true;
    statusLabel = "READY";
    statusVariant = "active";
    if (type === "movement") {
      timeDescription = `${minutesSince} min seated`;
    } else {
      timeDescription = `Due now (${minutesSince}m)`;
    }
  } else if (minutesSince >= interval - 10) {
    statusLabel = "DUE SOON";
    statusVariant = "focus";
    const remaining = interval - minutesSince;
    timeDescription = `Due in ~${remaining} min`;
  } else {
    statusLabel = "CLEAR";
    statusVariant = "complete";
    timeDescription = latestLog ? `Logged ${minutesSince} min ago` : `${minutesSince} min in`;
  }

  return {
    type,
    label: config.label,
    statusLabel,
    statusVariant,
    timeDescription,
    minutesSince,
    isDue,
  };
}

export interface EvaluateRecoveryInput {
  preferences: RecoveryPreferences;
  focusSessionElapsedMinutes: number;
  focusSessionStatus: string;
  questProgress?: number;
  quests: RecoveryQuest[];
  logs: RecoveryLog[];
  lastGlobalActionTimestamp: number | null;
  isModalOpen?: boolean;
}

export function evaluateRecoveryNeeds(
  input: EvaluateRecoveryInput
): RecoveryType | null {
  const {
    preferences,
    focusSessionElapsedMinutes,
    focusSessionStatus,
    questProgress = 0,
    quests,
    logs,
    lastGlobalActionTimestamp,
    isModalOpen = false,
  } = input;

  // 1. Master toggle check
  if (!preferences.enabled) {
    return null;
  }

  // 2. Modals open or UI busy
  if (isModalOpen) {
    return null;
  }

  // 3. Smart Interruption Protection: If Main Quest is near completion (>= 90%), delay prompt
  if (questProgress >= 90 && questProgress < 100) {
    return null;
  }

  // 4. Do not duplicate active or pending prompts
  const activeOrPending = quests.find(
    (q) => q.status === "pending" || q.status === "active"
  );
  if (activeOrPending) {
    return null;
  }

  // 5. Check Global Cooldown (10 minutes after any quest completed, skipped, or snoozed)
  if (lastGlobalActionTimestamp !== null) {
    const minutesSinceLastGlobal =
      (Date.now() - lastGlobalActionTimestamp) / (1000 * 60);
    if (minutesSinceLastGlobal < GLOBAL_RECOVERY_COOLDOWN_MINUTES) {
      return null;
    }
  }

  const now = Date.now();

  // 6. Check priority order
  for (const type of RECOVERY_PRIORITY_ORDER) {
    if (!isRecoveryTypeEnabled(preferences, type)) {
      continue;
    }

    // Check if this type has an active snooze
    const recentQuestForType = quests.find(
      (q) => q.type === type && q.status === "snoozed" && q.snoozedUntil
    );
    if (recentQuestForType && recentQuestForType.snoozedUntil) {
      const snoozeExpiry = new Date(recentQuestForType.snoozedUntil).getTime();
      if (now < snoozeExpiry) {
        // Still snoozed, skip this type
        continue;
      }
    }

    const intervalMinutes = RECOVERY_INTERVALS[type];
    const minutesSince = getMinutesSinceRecovery(
      logs,
      type,
      focusSessionElapsedMinutes
    );

    // If elapsed time since last log or session start >= interval
    if (minutesSince !== null && minutesSince >= intervalMinutes) {
      return type;
    }
  }

  return null;
}
