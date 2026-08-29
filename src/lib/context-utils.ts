import type { WorkContext, SaveWorkContextInput } from "@/types/work-context";
import type { Quest } from "@/types/quest";

export function getLatestQuestContext(
  contexts: WorkContext[],
  questId: string
): WorkContext | undefined {
  const filtered = contexts.filter((c) => c.questId === questId);
  if (filtered.length === 0) return undefined;
  return filtered.sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  )[0];
}

export function getLatestResumableContext(
  contexts: WorkContext[],
  activeQuests: Quest[],
  activeMainQuestId: string | null
): WorkContext | undefined {
  const activeQuestIds = new Set(
    activeQuests.filter((q) => q.status !== "completed").map((q) => q.id)
  );

  if (activeQuestIds.size === 0 || contexts.length === 0) {
    return undefined;
  }

  // 1. If activeMainQuestId has a context, prioritize it
  if (activeMainQuestId && activeQuestIds.has(activeMainQuestId)) {
    const mainQuestContext = getLatestQuestContext(contexts, activeMainQuestId);
    if (mainQuestContext) {
      return mainQuestContext;
    }
  }

  // 2. Otherwise return the latest context from any active quest
  const eligible = contexts
    .filter((c) => activeQuestIds.has(c.questId))
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

  return eligible[0];
}

export function isDuplicateContext(
  lastContext: WorkContext | undefined,
  newContext: SaveWorkContextInput
): boolean {
  if (!lastContext) return false;
  if (lastContext.questId !== newContext.questId) return false;

  const timeDiffMs = Date.now() - new Date(lastContext.savedAt).getTime();
  const isRecent = timeDiffMs < 2 * 60 * 1000; // 2 minutes

  const noteMatch = (lastContext.note || "") === (newContext.note || "");
  const progressMatch =
    newContext.progress === undefined || lastContext.progress === newContext.progress;
  const stepMatch = (lastContext.currentStepId || "") === (newContext.currentStepId || "");
  const nextActionMatch = (lastContext.nextAction || "") === (newContext.nextAction || "");

  return isRecent && noteMatch && progressMatch && stepMatch && nextActionMatch;
}

export function formatContextTimeAgo(dateString: string): string {
  try {
    const timeMs = new Date(dateString).getTime();
    const diffSec = Math.floor((Date.now() - timeMs) / 1000);

    if (diffSec < 45) return "Just now";
    if (diffSec < 90) return "1 min ago";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    if (diffSec < 7200) return "1 hour ago";
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return "Yesterday";
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return "Recently";
  }
}
