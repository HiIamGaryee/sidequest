import * as React from "react";
import { useContextKeeperContext } from "@/stores/ContextKeeperContext";
import { useQuests } from "@/hooks/useQuests";
import type { ContextReason, WorkContext } from "@/types/work-context";

export function useContextKeeper() {
  const contextKeeper = useContextKeeperContext();
  const {
    quests,
    activeMainQuestId,
    getMainQuest,
    getQuestSteps,
    getQuestNextAction,
    getQuestProgress,
    setMainQuest,
  } = useQuests();

  const currentMainQuest = getMainQuest();

  // Snapshot the current thread with one convenient call
  const saveCurrentThread = React.useCallback(
    (
      reason: ContextReason = "manual",
      note?: string,
      customQuestId?: string
    ): WorkContext | null => {
      const targetQuest = customQuestId
        ? quests.find((q) => q.id === customQuestId)
        : currentMainQuest;

      if (!targetQuest) return null;

      const steps = getQuestSteps(targetQuest.id);
      const incomplete = steps.filter((s) => s.status !== "completed");
      const currentStep = incomplete.length > 0 ? incomplete[0] : undefined;
      const nextAction = getQuestNextAction(targetQuest);
      const progress = getQuestProgress(targetQuest);

      return contextKeeper.saveWorkContext({
        questId: targetQuest.id,
        reason,
        note,
        currentStepId: currentStep?.id,
        nextAction,
        blocker: targetQuest.blocker,
        progress,
      });
    },
    [currentMainQuest, quests, getQuestSteps, getQuestNextAction, getQuestProgress, contextKeeper]
  );

  // Resume a saved work context: activates quest as Main Quest
  const resumeThread = React.useCallback(
    (contextId: string): { quest: (typeof quests)[0]; context: WorkContext } | null => {
      const context = contextKeeper.workContexts.find((c) => c.id === contextId);
      if (!context) return null;

      const targetQuest = quests.find((q) => q.id === context.questId);
      if (!targetQuest) return null;

      setMainQuest(targetQuest.id);
      return { quest: targetQuest, context };
    },
    [contextKeeper.workContexts, quests, setMainQuest]
  );

  const latestResumable = React.useMemo(() => {
    return contextKeeper.getLatestResumable(quests, activeMainQuestId);
  }, [contextKeeper, quests, activeMainQuestId]);

  const currentMainQuestContext = React.useMemo(() => {
    if (!activeMainQuestId) return undefined;
    return contextKeeper.getLatestContext(activeMainQuestId);
  }, [contextKeeper, activeMainQuestId]);

  return {
    ...contextKeeper,
    saveCurrentThread,
    resumeThread,
    latestResumable,
    currentMainQuestContext,
  };
}
