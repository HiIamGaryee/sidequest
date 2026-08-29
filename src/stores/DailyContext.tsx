import * as React from "react";
import {
  type DailyLoadout,
  type DailyRecoveryGoal,
  getLocalDateKey,
  DEFAULT_DAILY_RECOVERY_GOALS,
} from "@/types/daily";
import type { Quest } from "@/types/quest";
import type { RecoveryType } from "@/types/recovery";
import { usePersistence } from "@/stores/PersistenceContext";
import { useQuestContext } from "@/stores/QuestContext";
import { useRecoveryContext } from "@/stores/RecoveryContext";
import { useGamificationContext } from "@/stores/GamificationContext";
import { XP_REWARDS } from "@/config/gamification";
import { useToast } from "@/hooks/useToast";

export interface DailyContextValue {
  todayKey: string;
  loadout: DailyLoadout;
  allLoadouts: Record<string, DailyLoadout>;
  mainMissionQuest: Quest | null;
  sideMissionQuests: Quest[];
  isMainMissionComplete: boolean;
  areSideMissionsComplete: boolean;
  isDailyClear: boolean;
  isRecoveryGoalsMet: boolean;
  recoveryGoalsProgress: Array<{
    type: RecoveryType;
    target: number;
    current: number;
    met: boolean;
  }>;
  // Actions
  setMainMission: (questId: string, setAsGlobalMainQuest?: boolean) => void;
  clearMainMission: () => void;
  addSideMission: (questId: string) => { success: boolean; error?: string };
  removeSideMission: (questId: string) => void;
  updateRecoveryGoal: (type: RecoveryType, target: number) => void;
  claimDailyClearBonus: () => void;
  claimRecoveryBonus: () => void;
}

const DailyContext = React.createContext<DailyContextValue | null>(null);

export function DailyProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { initialState, saveSnapshot } = usePersistence();
  const { quests, activeMainQuestId, setMainQuest } = useQuestContext();
  const { recoveryLogs } = useRecoveryContext();
  const { awardXp } = useGamificationContext();

  const [todayKey, setTodayKey] = React.useState<string>(() => getLocalDateKey());

  const logsToday = React.useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return recoveryLogs.filter((l) => new Date(l.timestamp).getTime() >= startOfDay.getTime());
  }, [recoveryLogs]);

  // Periodically refresh date key if user crosses midnight
  React.useEffect(() => {
    const timer = setInterval(() => {
      const current = getLocalDateKey();
      if (current !== todayKey) {
        setTodayKey(current);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [todayKey]);

  const [allLoadouts, setAllLoadouts] = React.useState<Record<string, DailyLoadout>>(() => {
    return initialState.dailyLoadouts || {};
  });

  // Listen to demo reset
  React.useEffect(() => {
    const handleReset = () => {
      setAllLoadouts(initialState.dailyLoadouts || {});
    };
    window.addEventListener("sidequest:demo-reset", handleReset);
    return () => window.removeEventListener("sidequest:demo-reset", handleReset);
  }, [initialState.dailyLoadouts]);

  // Derive today's loadout (with fallback defaults)
  const todayLoadout = React.useMemo<DailyLoadout>(() => {
    const existing = allLoadouts[todayKey];
    if (existing) return existing;

    // Provide default fallback structure for today
    return {
      date: todayKey,
      mainQuestId: activeMainQuestId || undefined,
      sideQuestIds: [],
      recoveryGoals: DEFAULT_DAILY_RECOVERY_GOALS.map((g) => ({ ...g })),
    };
  }, [allLoadouts, todayKey, activeMainQuestId]);

  // Persist loadouts helper
  const persistLoadouts = React.useCallback(
    (next: Record<string, DailyLoadout>) => {
      setAllLoadouts(next);
      saveSnapshot({ dailyLoadouts: next });
    },
    [saveSnapshot]
  );

  // Resolved Quests
  const mainMissionQuest = React.useMemo(() => {
    if (!todayLoadout.mainQuestId) return null;
    return quests.find((q) => q.id === todayLoadout.mainQuestId) || null;
  }, [quests, todayLoadout.mainQuestId]);

  const sideMissionQuests = React.useMemo(() => {
    return (todayLoadout.sideQuestIds || [])
      .map((id) => quests.find((q) => q.id === id))
      .filter((q): q is Quest => Boolean(q));
  }, [quests, todayLoadout.sideQuestIds]);

  // Completion statuses
  const isMainMissionComplete = React.useMemo(() => {
    if (!mainMissionQuest) return false;
    return mainMissionQuest.status === "completed" || mainMissionQuest.progress >= 100;
  }, [mainMissionQuest]);

  const areSideMissionsComplete = React.useMemo(() => {
    if (sideMissionQuests.length === 0) return true;
    return sideMissionQuests.every((q) => q.status === "completed" || q.progress >= 100);
  }, [sideMissionQuests]);

  const hasAnyMissions = Boolean(mainMissionQuest || sideMissionQuests.length > 0);
  const isDailyClear = Boolean(
    hasAnyMissions &&
      (!mainMissionQuest || isMainMissionComplete) &&
      areSideMissionsComplete
  );

  // Recovery goals calculation
  const recoveryGoalsProgress = React.useMemo(() => {
    const goals = todayLoadout.recoveryGoals || DEFAULT_DAILY_RECOVERY_GOALS;
    return goals.map((goal) => {
      const current = logsToday.filter((l) => l.type === goal.type).length;
      return {
        type: goal.type,
        target: goal.target,
        current,
        met: goal.target <= 0 || current >= goal.target,
      };
    });
  }, [todayLoadout.recoveryGoals, logsToday]);

  const isRecoveryGoalsMet = React.useMemo(() => {
    if (recoveryGoalsProgress.length === 0) return true;
    return recoveryGoalsProgress.every((g) => g.met);
  }, [recoveryGoalsProgress]);

  // Actions
  const setMainMission = React.useCallback(
    (questId: string, setAsGlobalMainQuest = false) => {
      const current = { ...todayLoadout };
      current.mainQuestId = questId;
      // If was previously in side missions, remove it
      current.sideQuestIds = (current.sideQuestIds || []).filter((id) => id !== questId);

      const next = { ...allLoadouts, [todayKey]: current };
      persistLoadouts(next);

      if (setAsGlobalMainQuest) {
        setMainQuest(questId);
      }

      toast({
        title: "Daily Main Mission Set",
        description: "Assigned as your top priority mission for today.",
      });
    },
    [todayLoadout, allLoadouts, todayKey, persistLoadouts, setMainQuest, toast]
  );

  const clearMainMission = React.useCallback(() => {
    const current = { ...todayLoadout };
    delete current.mainQuestId;
    const next = { ...allLoadouts, [todayKey]: current };
    persistLoadouts(next);
  }, [todayLoadout, allLoadouts, todayKey, persistLoadouts]);

  const addSideMission = React.useCallback(
    (questId: string): { success: boolean; error?: string } => {
      const current = { ...todayLoadout };
      const sides = [...(current.sideQuestIds || [])];

      if (sides.includes(questId)) {
        return { success: true };
      }

      if (sides.length >= 2) {
        const errorMsg =
          "YOUR LOADOUT IS FULL. You already picked two Side Missions. Finish or replace one first.";
        toast({
          title: "Loadout Full",
          description: errorMsg,
          variant: "destructive",
        });
        return { success: false, error: errorMsg };
      }

      // If this quest was the daily main, remove from main
      if (current.mainQuestId === questId) {
        delete current.mainQuestId;
      }

      sides.push(questId);
      current.sideQuestIds = sides;

      const next = { ...allLoadouts, [todayKey]: current };
      persistLoadouts(next);

      toast({
        title: "Side Mission Added",
        description: `Loadout: ${sides.length} of 2 Side Missions assigned.`,
      });

      return { success: true };
    },
    [todayLoadout, allLoadouts, todayKey, persistLoadouts, toast]
  );

  const removeSideMission = React.useCallback(
    (questId: string) => {
      const current = { ...todayLoadout };
      current.sideQuestIds = (current.sideQuestIds || []).filter((id) => id !== questId);
      const next = { ...allLoadouts, [todayKey]: current };
      persistLoadouts(next);
    },
    [todayLoadout, allLoadouts, todayKey, persistLoadouts]
  );

  const updateRecoveryGoal = React.useCallback(
    (type: RecoveryType, target: number) => {
      const current = { ...todayLoadout };
      const goals = [...(current.recoveryGoals || DEFAULT_DAILY_RECOVERY_GOALS)];
      const idx = goals.findIndex((g) => g.type === type);
      if (idx >= 0) {
        goals[idx] = { type, target: Math.max(0, target) };
      } else {
        goals.push({ type, target: Math.max(0, target) });
      }
      current.recoveryGoals = goals;
      const next = { ...allLoadouts, [todayKey]: current };
      persistLoadouts(next);
    },
    [todayLoadout, allLoadouts, todayKey, persistLoadouts]
  );

  const claimDailyClearBonus = React.useCallback(() => {
    if (!isDailyClear) return;
    if (todayLoadout.claimedClearBonusAt) return;

    const refId = `daily_clear:${todayKey}`;
    awardXp({
      type: "daily_clear",
      customAmount: 40,
      referenceId: refId,
      label: `Daily Loadout Cleared (${todayKey})`,
    });

    const updated = {
      ...todayLoadout,
      completedAt: todayLoadout.completedAt || new Date().toISOString(),
      claimedClearBonusAt: new Date().toISOString(),
    };
    persistLoadouts({ ...allLoadouts, [todayKey]: updated });

    toast({
      title: "DAILY MISSIONS CLEARED!",
      description: "Productive enough. Go be a person. (+40 XP)",
    });
  }, [isDailyClear, todayLoadout, todayKey, awardXp, persistLoadouts, allLoadouts, toast]);

  const claimRecoveryBonus = React.useCallback(() => {
    if (!isRecoveryGoalsMet) return;
    if (todayLoadout.claimedRecoveryBonusAt) return;

    const refId = `daily_recovery_bonus:${todayKey}`;
    awardXp({
      type: "daily_recovery_bonus",
      customAmount: 10,
      referenceId: refId,
      label: `Daily Recovery Goals Met (${todayKey})`,
    });

    const updated = {
      ...todayLoadout,
      claimedRecoveryBonusAt: new Date().toISOString(),
    };
    persistLoadouts({ ...allLoadouts, [todayKey]: updated });

    toast({
      title: "Recovery Bonus Claimed",
      description: "You took care of yourself today. (+10 XP)",
    });
  }, [isRecoveryGoalsMet, todayLoadout, todayKey, awardXp, persistLoadouts, allLoadouts, toast]);

  // Auto-claim daily clear bonus when conditions are met for first time
  React.useEffect(() => {
    if (isDailyClear && !todayLoadout.claimedClearBonusAt && hasAnyMissions) {
      claimDailyClearBonus();
    }
  }, [isDailyClear, todayLoadout.claimedClearBonusAt, hasAnyMissions, claimDailyClearBonus]);

  const value = React.useMemo<DailyContextValue>(
    () => ({
      todayKey,
      loadout: todayLoadout,
      allLoadouts,
      mainMissionQuest,
      sideMissionQuests,
      isMainMissionComplete,
      areSideMissionsComplete,
      isDailyClear,
      isRecoveryGoalsMet,
      recoveryGoalsProgress,
      setMainMission,
      clearMainMission,
      addSideMission,
      removeSideMission,
      updateRecoveryGoal,
      claimDailyClearBonus,
      claimRecoveryBonus,
    }),
    [
      todayKey,
      todayLoadout,
      allLoadouts,
      mainMissionQuest,
      sideMissionQuests,
      isMainMissionComplete,
      areSideMissionsComplete,
      isDailyClear,
      isRecoveryGoalsMet,
      recoveryGoalsProgress,
      setMainMission,
      clearMainMission,
      addSideMission,
      removeSideMission,
      updateRecoveryGoal,
      claimDailyClearBonus,
      claimRecoveryBonus,
    ]
  );

  return <DailyContext.Provider value={value}>{children}</DailyContext.Provider>;
}

export function useDailyContext(): DailyContextValue {
  const ctx = React.useContext(DailyContext);
  if (!ctx) {
    throw new Error("useDailyContext must be used within a DailyProvider");
  }
  return ctx;
}
