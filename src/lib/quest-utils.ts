import type { Quest, QuestPriority, QuestStep } from "@/types/quest";

/**
 * Returns all steps for a specific quest, sorted by order ascending.
 */
export function getQuestSteps(steps: QuestStep[], questId: string): QuestStep[] {
  return steps
    .filter((s) => s.questId === questId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Returns incomplete steps for a specific quest.
 */
export function getIncompleteSteps(steps: QuestStep[], questId: string): QuestStep[] {
  return getQuestSteps(steps, questId).filter((s) => s.status !== "completed");
}

/**
 * Returns completed steps for a specific quest.
 */
export function getCompletedSteps(steps: QuestStep[], questId: string): QuestStep[] {
  return getQuestSteps(steps, questId).filter((s) => s.status === "completed");
}

/**
 * Returns step count summary for a quest.
 */
export function getStepCounts(steps: QuestStep[], questId: string) {
  const questSteps = getQuestSteps(steps, questId);
  const completed = questSteps.filter((s) => s.status === "completed").length;
  const total = questSteps.length;
  return {
    total,
    completed,
    remaining: total - completed,
  };
}

/**
 * Derives the current Next Action for a quest:
 * 1. If quest has incomplete steps: title of the first incomplete step by order.
 * 2. Else if quest has manual nextAction: quest.nextAction.
 * 3. Else: undefined.
 */
export function getQuestNextAction(quest: Quest, steps: QuestStep[]): string | undefined {
  const incompleteSteps = getIncompleteSteps(steps, quest.id);
  if (incompleteSteps.length > 0) {
    return incompleteSteps[0].title;
  }
  if (quest.nextAction && quest.nextAction.trim().length > 0) {
    return quest.nextAction;
  }
  return undefined;
}

/**
 * Calculates derived progress for a specific quest:
 * - If quest has steps: completedSteps / totalSteps * 100
 * - If quest has 0 steps: fallback to manual quest.progress
 */
export function calculateQuestProgress(quest: Quest, steps: QuestStep[]): number {
  const questSteps = getQuestSteps(steps, quest.id);
  if (questSteps.length > 0) {
    const completedCount = questSteps.filter((s) => s.status === "completed").length;
    return Math.round((completedCount / questSteps.length) * 100);
  }
  return quest.progress ?? 0;
}

/**
 * Calculates derived progress for a collection of quests (0 - 100).
 * Takes steps into account for every quest.
 */
export function calculateProjectProgress(quests: Quest[], steps: QuestStep[]): number {
  if (!quests || quests.length === 0) return 0;
  const totalProgress = quests.reduce(
    (acc, quest) => acc + calculateQuestProgress(quest, steps),
    0
  );
  return Math.round(totalProgress / quests.length);
}

/**
 * Returns total quest count for a specific project.
 */
export function getProjectQuestCount(quests: Quest[], projectId: string): number {
  return quests.filter((q) => q.projectId === projectId).length;
}

/**
 * Returns completed quest count for a project or all quests globally.
 */
export function getCompletedQuestCount(quests: Quest[], projectId?: string): number {
  if (projectId) {
    return quests.filter((q) => q.projectId === projectId && q.status === "completed").length;
  }
  return quests.filter((q) => q.status === "completed").length;
}

/**
 * Normalizes an array of steps so their order property is strictly sequential (1, 2, 3...).
 */
export function normalizeStepOrder(steps: QuestStep[]): QuestStep[] {
  return steps
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({
      ...step,
      order: index + 1,
    }));
}

const PRIORITY_WEIGHTS: Record<QuestPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Sorts quests logically:
 * 1. Active Main Quest first
 * 2. Active / Todo quests by explicit order property (ascending), then Priority (High -> Medium -> Low), then creation date
 * 3. Completed quests at the bottom, sorted by order ascending
 */
export function sortQuests(quests: Quest[], activeMainQuestId: string | null): Quest[] {
  return [...quests].sort((a, b) => {
    // 1. Active Main Quest always pinned on top
    if (a.id === activeMainQuestId && b.id !== activeMainQuestId) return -1;
    if (b.id === activeMainQuestId && a.id !== activeMainQuestId) return 1;

    // 2. Completed quests at the bottom
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (b.status === "completed" && a.status !== "completed") return -1;

    // 3. Stable user-defined order
    const orderA = a.order ?? 9999;
    const orderB = b.order ?? 9999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // 4. Priority weight within same status
    const pA = PRIORITY_WEIGHTS[a.priority] || 0;
    const pB = PRIORITY_WEIGHTS[b.priority] || 0;
    if (pA !== pB) return pB - pA;

    // 5. Creation time fallback (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
