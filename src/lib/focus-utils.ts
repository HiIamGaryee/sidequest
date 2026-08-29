import type { FocusSession } from "@/types/focus";
import type { QuestStep } from "@/types/quest";

/**
 * Formats a duration in seconds as standard MM:SS (e.g. 24:58 or 05:02).
 * Clamps to 00:00 if negative.
 */
export function formatTimer(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Formats overtime seconds as +MM:SS (e.g. +03:42).
 */
export function formatOvertime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `+${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Formats seconds into human-readable duration (e.g. "23 min" or "23m 18s" or "< 1 min").
 */
export function formatDurationHuman(totalSeconds: number, includeSeconds = false): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  if (includeSeconds) {
    if (minutes === 0) return `${seconds}s`;
    if (seconds === 0) return `${minutes}m`;
    return `${minutes}m ${seconds}s`;
  }

  if (minutes === 0) return "< 1 min";
  if (minutes === 1) return "1 min";
  return `${minutes} min`;
}

/**
 * Gets human readable focus duration for a session.
 */
export function getSessionDuration(session: FocusSession, includeSeconds = false): string {
  return formatDurationHuman(session.elapsedSeconds, includeSeconds);
}

/**
 * Calculates the progress change during a session.
 */
export function getProgressDelta(session: FocusSession): {
  start: number;
  end: number;
  delta: number;
} {
  const start = session.startingProgress ?? 0;
  const end = session.endingProgress ?? start;
  return {
    start,
    end,
    delta: end - start,
  };
}

/**
 * Finds the list of step titles that were completed during this specific session.
 */
export function getCompletedStepsDuringSession(
  session: FocusSession,
  allSteps: QuestStep[]
): string[] {
  if (session.completedStepTitles && session.completedStepTitles.length > 0) {
    return session.completedStepTitles;
  }

  const startingIds = new Set(session.startingCompletedStepIds || []);
  const endingIds = new Set(session.endingCompletedStepIds || []);

  const newlyCompletedIds = Array.from(endingIds).filter((id) => !startingIds.has(id));

  return allSteps
    .filter((step) => newlyCompletedIds.includes(step.id))
    .map((step) => step.title);
}
