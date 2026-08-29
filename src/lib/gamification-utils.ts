import {
  LEVEL_THRESHOLDS,
  ACHIEVEMENT_DEFINITIONS,
  XP_REWARDS,
} from "@/config/gamification";
import type {
  XpEvent,
  XpEventType,
  Achievement,
  PlayerProfile,
} from "@/types/gamification";

/**
 * Returns level info based on current XP
 */
export function getLevelFromXp(xp: number) {
  const safeXp = Math.max(0, xp);
  let currentThreshold = LEVEL_THRESHOLDS[0];

  for (const threshold of LEVEL_THRESHOLDS) {
    if (safeXp >= threshold.minXp) {
      currentThreshold = threshold;
    } else {
      break;
    }
  }

  const nextThreshold =
    LEVEL_THRESHOLDS.find((t) => t.level === currentThreshold.level + 1) || {
      level: currentThreshold.level + 1,
      minXp: currentThreshold.minXp + 1000,
      title: currentThreshold.title,
    };

  const xpIntoCurrentLevel = safeXp - currentThreshold.minXp;
  const xpNeededForLevel = Math.max(1, nextThreshold.minXp - currentThreshold.minXp);
  const percentage = Math.min(
    100,
    Math.max(0, Math.round((xpIntoCurrentLevel / xpNeededForLevel) * 100))
  );

  return {
    level: currentThreshold.level,
    title: currentThreshold.title,
    minXp: currentThreshold.minXp,
    nextLevelXp: nextThreshold.minXp,
    progressXp: xpIntoCurrentLevel,
    neededXp: xpNeededForLevel,
    percentage,
    remainingXp: Math.max(0, nextThreshold.minXp - safeXp),
  };
}

/**
 * Get min XP required for a given level
 */
export function getXpForLevel(level: number): number {
  const threshold = LEVEL_THRESHOLDS.find((t) => t.level === level);
  return threshold ? threshold.minXp : (level - 1) * 500;
}

/**
 * Get XP target for the next level
 */
export function getXpForNextLevel(level: number): number {
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level + 1);
  return nextThreshold ? nextThreshold.minXp : level * 500;
}

/**
 * Get level progress percentage
 */
export function getLevelProgress(xp: number): number {
  return getLevelFromXp(xp).percentage;
}

/**
 * Get XP needed to reach next level
 */
export function getXpToNextLevel(xp: number): number {
  return getLevelFromXp(xp).remainingXp;
}

/**
 * Calculate XP earned today (during current local calendar day)
 */
export function getTodayXp(events: XpEvent[]): number {
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  return events
    .filter((event) => {
      const eventTime = new Date(event.createdAt).getTime();
      return eventTime >= startOfDay;
    })
    .reduce((sum, event) => sum + event.amount, 0);
}

/**
 * Check if an XP event already exists for a specific type and reference ID
 */
export function hasXpEventForReference(
  events: XpEvent[],
  type: XpEventType,
  referenceId: string
): boolean {
  if (!referenceId) return false;
  return events.some(
    (event) => event.type === type && event.referenceId === referenceId
  );
}

/**
 * Format XP value with + prefix
 */
export function formatXp(amount: number): string {
  return amount >= 0 ? `+${amount} XP` : `${amount} XP`;
}
