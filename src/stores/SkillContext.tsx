import * as React from "react";
import type {
  SkillNodeDefinition,
  SkillProgressInfo,
  SkillNodeState,
  SkillBranch,
} from "@/types/skill";
import { SKILL_DEFINITIONS, SKILL_BRANCHES, type SkillBranchMeta } from "@/config/skills";
import { usePersistence } from "@/stores/PersistenceContext";
import { useQuestContext } from "@/stores/QuestContext";
import { useFocusContext } from "@/stores/FocusContext";
import { useSideQuestContext } from "@/stores/SideQuestContext";
import { useContextKeeperContext } from "@/stores/ContextKeeperContext";
import { useRecoveryContext } from "@/stores/RecoveryContext";
import { useGamificationContext } from "@/stores/GamificationContext";
import { XP_REWARDS } from "@/config/gamification";
import { soundService } from "@/services/sound/sound-service";
import { useToast } from "@/hooks/useToast";

export interface SkillContextValue {
  branches: SkillBranchMeta[];
  skillsProgress: SkillProgressInfo[];
  unlockedCount: number;
  totalCount: number;
  latestUnlocked: SkillProgressInfo | null;
  nextAvailable: SkillProgressInfo | null;
  getBranchSkills: (branch: SkillBranch) => SkillProgressInfo[];
}

const SkillContext = React.createContext<SkillContextValue | null>(null);

export function SkillProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { initialState, saveSnapshot, appSettings } = usePersistence();
  const { quests } = useQuestContext();
  const { focusSessions } = useFocusContext();
  const { sideQuests } = useSideQuestContext();
  const { workContexts } = useContextKeeperContext();
  const { recoveryLogs } = useRecoveryContext();
  const { awardXp } = useGamificationContext();

  const [skillUnlocks, setSkillUnlocks] = React.useState<Record<string, string>>(() => {
    return initialState.skillUnlocks || {};
  });

  // Listen to demo reset
  React.useEffect(() => {
    const handleReset = () => {
      setSkillUnlocks(initialState.skillUnlocks || {});
    };
    window.addEventListener("sidequest:demo-reset", handleReset);
    return () => window.removeEventListener("sidequest:demo-reset", handleReset);
  }, [initialState.skillUnlocks]);

  const persistSkillUnlocks = React.useCallback(
    (next: Record<string, string>) => {
      setSkillUnlocks(next);
      saveSnapshot({ skillUnlocks: next });
    },
    [saveSnapshot]
  );

  // Compute metrics derived from live app state
  const metrics = React.useMemo(() => {
    const completedSessions = focusSessions.filter((s) => s.status === "completed");
    const focusSessionsCount = completedSessions.length;
    const hasDeepRun = completedSessions.some((s) => (s.elapsedSeconds / 60) >= 45 || s.plannedMinutes >= 45);

    const completedQuestsCount = quests.filter(
      (q) => q.status === "completed" || q.progress >= 100
    ).length;

    // Completed main quests count: completed quests with high priority or explicitly main
    const completedMainQuestsCount = quests.filter(
      (q) => (q.status === "completed" || q.progress >= 100) && q.priority === "high"
    ).length;

    const resumedContextsCount = workContexts.length;
    const parkedSideQuestsCount = sideQuests.filter((sq) => sq.status === "parked").length;

    const recoveryLogsCount = recoveryLogs.length;

    // Balanced days: distinct dates with both focus session and recovery log
    const focusDates = new Set(
      completedSessions.map((s) => (s.endedAt || s.startedAt || "").split("T")[0]).filter(Boolean)
    );
    const recoveryDates = new Set(
      recoveryLogs.map((l) => (l.timestamp || "").split("T")[0]).filter(Boolean)
    );
    let balancedDaysCount = 0;
    focusDates.forEach((d) => {
      if (recoveryDates.has(d)) balancedDaysCount++;
    });

    return {
      focusSessionsCount,
      hasDeepRun: hasDeepRun ? 1 : 0,
      completedQuestsCount,
      completedMainQuestsCount,
      resumedContextsCount,
      parkedSideQuestsCount,
      recoveryLogsCount,
      balancedDaysCount,
    };
  }, [focusSessions, quests, workContexts, sideQuests, recoveryLogs]);

  // Evaluate each skill node against metrics & prerequisite rules
  const skillsProgress = React.useMemo<SkillProgressInfo[]>(() => {
    return SKILL_DEFINITIONS.map((def) => {
      let currentCount = 0;

      switch (def.id) {
        case "locked-in-1":
        case "locked-in-2":
          currentCount = metrics.focusSessionsCount;
          break;
        case "deep-run":
          currentCount = metrics.hasDeepRun;
          break;
        case "closer-1":
        case "closer-2":
          currentCount = metrics.completedQuestsCount;
          break;
        case "main-quest-master":
          currentCount = metrics.completedMainQuestsCount;
          break;
        case "back-from-void-1":
        case "back-from-void-2":
          currentCount = metrics.resumedContextsCount;
          break;
        case "side-quest-tamer":
          currentCount = metrics.parkedSideQuestsCount;
          break;
        case "reset-1":
        case "reset-2":
          currentCount = metrics.recoveryLogsCount;
          break;
        case "balanced-run":
          currentCount = metrics.balancedDaysCount;
          break;
      }

      const targetCount = def.requiredCount;
      const percentage = Math.min(100, Math.round((currentCount / targetCount) * 100));

      const isRecordedUnlocked = Boolean(skillUnlocks[def.id]);
      const qualifiesForUnlock = currentCount >= targetCount;

      let state: SkillNodeState = "locked";

      if (isRecordedUnlocked || qualifiesForUnlock) {
        state = "unlocked";
      } else if (!def.prerequisiteId || skillUnlocks[def.prerequisiteId]) {
        state = "available";
      } else {
        state = "locked";
      }

      return {
        definition: def,
        state,
        currentCount,
        targetCount,
        percentage,
        unlockedAt: skillUnlocks[def.id],
      };
    });
  }, [metrics, skillUnlocks]);

  // Unlock detector: when a skill becomes qualified, record it
  React.useEffect(() => {
    let hasChanges = false;
    const nextUnlocks = { ...skillUnlocks };

    skillsProgress.forEach((item) => {
      if (item.state === "unlocked" && !skillUnlocks[item.definition.id]) {
        const nowIso = new Date().toISOString();
        nextUnlocks[item.definition.id] = nowIso;
        hasChanges = true;

        // Reward bonus XP
        awardXp({
          type: "skill_unlocked_bonus",
          customAmount: 50,
          referenceId: `skill:${item.definition.id}`,
          label: `Skill Unlocked: ${item.definition.title}`,
        });

        soundService.playAchievementSound(appSettings.soundEffects);

        toast({
          title: `SKILL UNLOCKED: ${item.definition.title}`,
          description: `${item.definition.description} Cosmetic Title: '${item.definition.cosmeticTitle}'. (+50 XP)`,
        });
      }
    });

    if (hasChanges) {
      persistSkillUnlocks(nextUnlocks);
    }
  }, [skillsProgress, skillUnlocks, awardXp, appSettings.soundEffects, persistSkillUnlocks, toast]);

  const unlockedCount = React.useMemo(() => {
    return skillsProgress.filter((s) => s.state === "unlocked").length;
  }, [skillsProgress]);

  const totalCount = SKILL_DEFINITIONS.length;

  const latestUnlocked = React.useMemo(() => {
    const unlocked = skillsProgress.filter((s) => s.state === "unlocked" && s.unlockedAt);
    if (unlocked.length === 0) return null;
    return unlocked.sort((a, b) => (b.unlockedAt || "").localeCompare(a.unlockedAt || ""))[0];
  }, [skillsProgress]);

  const nextAvailable = React.useMemo(() => {
    return skillsProgress.find((s) => s.state === "available") || null;
  }, [skillsProgress]);

  const getBranchSkills = React.useCallback(
    (branch: SkillBranch) => {
      return skillsProgress.filter((s) => s.definition.branch === branch);
    },
    [skillsProgress]
  );

  const value = React.useMemo<SkillContextValue>(
    () => ({
      branches: SKILL_BRANCHES,
      skillsProgress,
      unlockedCount,
      totalCount,
      latestUnlocked,
      nextAvailable,
      getBranchSkills,
    }),
    [
      skillsProgress,
      unlockedCount,
      totalCount,
      latestUnlocked,
      nextAvailable,
      getBranchSkills,
    ]
  );

  return <SkillContext.Provider value={value}>{children}</SkillContext.Provider>;
}

export function useSkillContext(): SkillContextValue {
  const ctx = React.useContext(SkillContext);
  if (!ctx) {
    throw new Error("useSkillContext must be used within a SkillProvider");
  }
  return ctx;
}
