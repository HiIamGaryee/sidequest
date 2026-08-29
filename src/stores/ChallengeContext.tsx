import * as React from "react";
import type {
  WorkChallenge,
  ChallengeType,
} from "@/types/challenge";
import { CHALLENGE_PRESETS } from "@/config/challenges";
import { usePersistence } from "@/stores/PersistenceContext";
import { useQuestContext } from "@/stores/QuestContext";
import { useGamificationContext } from "@/stores/GamificationContext";
import { soundService } from "@/services/sound/sound-service";
import { useToast } from "@/hooks/useToast";

export interface ChallengeContextValue {
  activeChallenge: WorkChallenge | null;
  challengeHistory: WorkChallenge[];
  remainingSeconds: number | null;
  progressPercentage: number;
  // Actions
  startChallenge: (
    type: ChallengeType,
    customQuestId?: string,
    customDuration?: number
  ) => { success: boolean; error?: string };
  completeChallenge: (challengeId?: string) => void;
  cancelChallenge: () => void;
  retryChallenge: () => void;
  clearActiveChallenge: () => void;
}

const ChallengeContext = React.createContext<ChallengeContextValue | null>(null);

export function ChallengeProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { initialState, saveSnapshot, appSettings } = usePersistence();
  const { quests, activeMainQuestId, getMainQuest, questSteps, getQuestSteps } = useQuestContext();
  const { awardXp } = useGamificationContext();

  const [activeChallenge, setActiveChallenge] = React.useState<WorkChallenge | null>(() => {
    return initialState.activeChallenge || null;
  });

  const [challengeHistory, setChallengeHistory] = React.useState<WorkChallenge[]>(() => {
    return initialState.challengeHistory || [];
  });

  const [remainingSeconds, setRemainingSeconds] = React.useState<number | null>(null);

  // Listen to demo reset
  React.useEffect(() => {
    const handleReset = () => {
      setActiveChallenge(initialState.activeChallenge || null);
      setChallengeHistory(initialState.challengeHistory || []);
    };
    window.addEventListener("sidequest:demo-reset", handleReset);
    return () => window.removeEventListener("sidequest:demo-reset", handleReset);
  }, [initialState.activeChallenge, initialState.challengeHistory]);

  const persistChallenges = React.useCallback(
    (active: WorkChallenge | null, history: WorkChallenge[]) => {
      setActiveChallenge(active);
      setChallengeHistory(history);
      saveSnapshot({ activeChallenge: active, challengeHistory: history });
    },
    [saveSnapshot]
  );

  // Timer ticker for timed_action challenges
  React.useEffect(() => {
    if (!activeChallenge || activeChallenge.status !== "active") {
      setRemainingSeconds(null);
      return;
    }

    if (activeChallenge.type !== "timed_action" || !activeChallenge.startedAt || !activeChallenge.durationSeconds) {
      setRemainingSeconds(null);
      return;
    }

    const startTime = new Date(activeChallenge.startedAt).getTime();
    const durationMs = activeChallenge.durationSeconds * 1000;
    const endTime = startTime + durationMs;

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((endTime - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        // Mark as expired without penalty
        const expired: WorkChallenge = {
          ...activeChallenge,
          status: "expired",
          expiredAt: new Date().toISOString(),
        };
        const nextHistory = [expired, ...challengeHistory.slice(0, 49)];
        persistChallenges(expired, nextHistory);

        toast({
          title: "CHALLENGE ENDED",
          description: "Almost. You can try again or break the task down smaller.",
        });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeChallenge, challengeHistory, persistChallenges, toast]);

  // Start challenge action
  const startChallenge = React.useCallback(
    (
      type: ChallengeType,
      customQuestId?: string,
      customDuration?: number
    ): { success: boolean; error?: string } => {
      const preset = CHALLENGE_PRESETS.find((p) => p.type === type) || CHALLENGE_PRESETS[0];

      // Target quest: provided or global main quest or first active quest
      const mainQuest = getMainQuest();
      const targetQuest =
        (customQuestId ? quests.find((q) => q.id === customQuestId) : null) ||
        mainQuest ||
        quests.find((q) => q.status === "active" || q.status === "todo") ||
        quests[0];

      if (!targetQuest) {
        const err = "No available Quest to attach challenge to. Create a Quest first.";
        toast({
          title: "Cannot Start Challenge",
          description: err,
          variant: "destructive",
        });
        return { success: false, error: err };
      }

      // Count initial completed steps for this quest
      const steps = getQuestSteps(targetQuest.id);
      const initialCompletedSteps = steps.filter((s) => s.status === "completed").length;
      const nextStep = steps.find((s) => s.status !== "completed");

      const durationSec = customDuration || preset.durationSeconds;

      const newChallenge: WorkChallenge = {
        id: `challenge-${Date.now()}`,
        type,
        title: preset.title,
        description: preset.description,
        questId: targetQuest.id,
        questTitle: targetQuest.title,
        status: "active",
        targetValue: preset.targetValue,
        currentValue: 0,
        durationSeconds: durationSec,
        startedAt: new Date().toISOString(),
        xpReward: preset.xpReward,
        initialStepCompletedCount: initialCompletedSteps,
        initialQuestProgress: targetQuest.progress,
        activeStepId: nextStep?.id,
      };

      persistChallenges(newChallenge, challengeHistory);

      toast({
        title: `Challenge Started: ${preset.title}`,
        description: `${preset.description} Attached to '${targetQuest.title}'.`,
      });

      return { success: true };
    },
    [
      quests,
      getMainQuest,
      getQuestSteps,
      challengeHistory,
      persistChallenges,
      toast,
    ]
  );

  // Complete challenge action
  const completeChallenge = React.useCallback(
    (challengeId?: string) => {
      const target = activeChallenge;
      if (!target || (challengeId && target.id !== challengeId)) return;
      if (target.status !== "active") return;

      const completed: WorkChallenge = {
        ...target,
        status: "completed",
        completedAt: new Date().toISOString(),
        currentValue: target.targetValue,
      };

      const nextHistory = [completed, ...challengeHistory.slice(0, 49)];
      persistChallenges(null, nextHistory);

      // Record XP reward
      awardXp({
        type: "challenge_completed",
        customAmount: target.xpReward,
        referenceId: `challenge:${target.id}`,
        label: `Challenge Cleared: ${target.title}`,
      });

      soundService.playAchievementSound(appSettings.soundEffects);

      toast({
        title: "CHALLENGE COMPLETED!",
        description: `Great focus sprint. (+${target.xpReward} XP)`,
      });
    },
    [
      activeChallenge,
      challengeHistory,
      persistChallenges,
      awardXp,
      appSettings.soundEffects,
      toast,
    ]
  );

  // Cancel challenge
  const cancelChallenge = React.useCallback(() => {
    if (!activeChallenge) return;

    const cancelled: WorkChallenge = {
      ...activeChallenge,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    };

    const nextHistory = [cancelled, ...challengeHistory.slice(0, 49)];
    persistChallenges(null, nextHistory);

    toast({
      title: "Challenge Cancelled",
      description: "Challenge stood down without penalty.",
    });
  }, [activeChallenge, challengeHistory, persistChallenges, toast]);

  // Retry previous / expired challenge
  const retryChallenge = React.useCallback(() => {
    if (activeChallenge) {
      startChallenge(
        activeChallenge.type,
        activeChallenge.questId,
        activeChallenge.durationSeconds
      );
    }
  }, [activeChallenge, startChallenge]);

  const clearActiveChallenge = React.useCallback(() => {
    persistChallenges(null, challengeHistory);
  }, [challengeHistory, persistChallenges]);

  // Automated step completion detector for active challenge
  React.useEffect(() => {
    if (!activeChallenge || activeChallenge.status !== "active") return;

    const targetQuest = quests.find((q) => q.id === activeChallenge.questId);
    if (!targetQuest) return;

    // 1. Timed Action: if active step completed or quest completed
    if (activeChallenge.type === "timed_action") {
      if (activeChallenge.activeStepId) {
        const step = questSteps.find((s) => s.id === activeChallenge.activeStepId);
        if (step && step.status === "completed") {
          completeChallenge();
          return;
        }
      }
      if (targetQuest.status === "completed") {
        completeChallenge();
        return;
      }
    }

    // 2. Step Count (e.g. 3 steps completed since start)
    if (activeChallenge.type === "step_count") {
      const currentCompleted = questSteps.filter(
        (s) => s.questId === targetQuest.id && s.status === "completed"
      ).length;
      const initial = activeChallenge.initialStepCompletedCount || 0;
      const delta = currentCompleted - initial;

      if (delta >= activeChallenge.targetValue || targetQuest.status === "completed") {
        completeChallenge();
        return;
      }
    }

    // 3. Main Quest Progress (e.g. +10% gain)
    if (activeChallenge.type === "main_quest_progress") {
      const initial = activeChallenge.initialQuestProgress || 0;
      const delta = targetQuest.progress - initial;

      if (delta >= activeChallenge.targetValue || targetQuest.status === "completed" || targetQuest.progress >= 100) {
        completeChallenge();
        return;
      }
    }

    // 4. No switch (completed 1 step on target quest)
    if (activeChallenge.type === "no_switch") {
      const currentCompleted = questSteps.filter(
        (s) => s.questId === targetQuest.id && s.status === "completed"
      ).length;
      const initial = activeChallenge.initialStepCompletedCount || 0;
      if (currentCompleted > initial || targetQuest.status === "completed") {
        completeChallenge();
        return;
      }
    }
  }, [activeChallenge, quests, questSteps, completeChallenge]);

  // Compute progress percentage for HUD
  const progressPercentage = React.useMemo(() => {
    if (!activeChallenge) return 0;
    if (activeChallenge.type === "timed_action") {
      if (!activeChallenge.durationSeconds || remainingSeconds === null) return 0;
      const elapsed = activeChallenge.durationSeconds - remainingSeconds;
      return Math.min(100, Math.round((elapsed / activeChallenge.durationSeconds) * 100));
    }

    if (activeChallenge.type === "step_count") {
      const currentCompleted = questSteps.filter(
        (s) => s.questId === activeChallenge.questId && s.status === "completed"
      ).length;
      const initial = activeChallenge.initialStepCompletedCount || 0;
      const delta = Math.max(0, currentCompleted - initial);
      return Math.min(100, Math.round((delta / activeChallenge.targetValue) * 100));
    }

    if (activeChallenge.type === "main_quest_progress") {
      const targetQuest = quests.find((q) => q.id === activeChallenge.questId);
      if (!targetQuest) return 0;
      const initial = activeChallenge.initialQuestProgress || 0;
      const delta = Math.max(0, targetQuest.progress - initial);
      return Math.min(100, Math.round((delta / activeChallenge.targetValue) * 100));
    }

    return 0;
  }, [activeChallenge, remainingSeconds, questSteps, quests]);

  const value = React.useMemo<ChallengeContextValue>(
    () => ({
      activeChallenge,
      challengeHistory,
      remainingSeconds,
      progressPercentage,
      startChallenge,
      completeChallenge,
      cancelChallenge,
      retryChallenge,
      clearActiveChallenge,
    }),
    [
      activeChallenge,
      challengeHistory,
      remainingSeconds,
      progressPercentage,
      startChallenge,
      completeChallenge,
      cancelChallenge,
      retryChallenge,
      clearActiveChallenge,
    ]
  );

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
}

export function useChallengeContext(): ChallengeContextValue {
  const ctx = React.useContext(ChallengeContext);
  if (!ctx) {
    throw new Error("useChallengeContext must be used within a ChallengeProvider");
  }
  return ctx;
}
