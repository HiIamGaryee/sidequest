import * as React from "react";
import type {
  BossBattleConfig,
  BossPhase,
  BossDamageFeedback,
} from "@/types/boss";
import type { Project, Quest } from "@/types/quest";
import { usePersistence } from "@/stores/PersistenceContext";
import { useQuestContext } from "@/stores/QuestContext";
import { useGamificationContext } from "@/stores/GamificationContext";
import { XP_REWARDS } from "@/config/gamification";
import { soundService } from "@/services/sound/sound-service";
import { useToast } from "@/hooks/useToast";

export interface BossStateInfo {
  config: BossBattleConfig;
  project: Project;
  quests: Quest[];
  progress: number;
  hpRemaining: number;
  isDefeated: boolean;
  activePhase: BossPhase | null;
  phaseProgress: Array<{
    phase: BossPhase;
    quests: Quest[];
    progress: number;
    isComplete: boolean;
    isCurrent: boolean;
  }>;
}

export interface BossContextValue {
  bossConfigs: Record<string, BossBattleConfig>;
  damageFeedbacks: BossDamageFeedback[];
  getBossState: (projectId: string) => BossStateInfo | null;
  toggleBossMode: (projectId: string, enabled?: boolean) => void;
  updateBossTitle: (projectId: string, title: string) => void;
  updateBossPhases: (projectId: string, phases: BossPhase[]) => void;
  autoGeneratePhases: (projectId: string) => void;
  claimBossDefeatReward: (projectId: string) => void;
}

const BossContext = React.createContext<BossContextValue | null>(null);

export function BossProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { initialState, saveSnapshot, appSettings } = usePersistence();
  const { projects, quests, getProjectQuests } = useQuestContext();
  const { awardXp } = useGamificationContext();

  const [bossConfigs, setBossConfigs] = React.useState<Record<string, BossBattleConfig>>(() => {
    return initialState.bossConfigs || {};
  });

  const [damageFeedbacks, setDamageFeedbacks] = React.useState<BossDamageFeedback[]>([]);

  // Listen to demo reset
  React.useEffect(() => {
    const handleReset = () => {
      setBossConfigs(initialState.bossConfigs || {});
    };
    window.addEventListener("sidequest:demo-reset", handleReset);
    return () => window.removeEventListener("sidequest:demo-reset", handleReset);
  }, [initialState.bossConfigs]);

  const persistBossConfigs = React.useCallback(
    (next: Record<string, BossBattleConfig>) => {
      setBossConfigs(next);
      saveSnapshot({ bossConfigs: next });
    },
    [saveSnapshot]
  );

  // Auto-generate phases if none exist for a project
  const createDefaultPhases = React.useCallback(
    (projectId: string, projectQuests: Quest[]): BossPhase[] => {
      if (projectQuests.length === 0) {
        return [
          {
            id: `phase-${projectId}-1`,
            projectId,
            title: "Phase 1: Engage Target",
            order: 1,
            questIds: [],
          },
        ];
      }

      if (projectQuests.length <= 2) {
        return [
          {
            id: `phase-${projectId}-1`,
            projectId,
            title: "Phase 1: Siege Opening",
            order: 1,
            questIds: projectQuests.map((q) => q.id),
          },
        ];
      }

      // Distribute across 2 or 3 phases
      const phaseCount = projectQuests.length >= 6 ? 3 : 2;
      const chunkSize = Math.ceil(projectQuests.length / phaseCount);
      const phases: BossPhase[] = [];

      for (let i = 0; i < phaseCount; i++) {
        const chunk = projectQuests.slice(i * chunkSize, (i + 1) * chunkSize);
        phases.push({
          id: `phase-${projectId}-${i + 1}`,
          projectId,
          title:
            i === 0
              ? "Phase 1: Foundation & Recon"
              : i === phaseCount - 1
              ? "Final Phase: Execution & Delivery"
              : "Phase 2: Core Engineering",
          order: i + 1,
          questIds: chunk.map((q) => q.id),
        });
      }

      return phases;
    },
    []
  );

  const getBossState = React.useCallback(
    (projectId: string): BossStateInfo | null => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return null;

      const projectQuests = getProjectQuests(projectId);
      let config = bossConfigs[projectId];

      if (!config) {
        config = {
          projectId,
          enabled: false,
          title: `BOSS: ${project.name.toUpperCase()}`,
          phases: createDefaultPhases(projectId, projectQuests),
        };
      }

      // Compute progress from quests
      let totalProgress = 0;
      if (projectQuests.length > 0) {
        const sum = projectQuests.reduce((acc, q) => acc + q.progress, 0);
        totalProgress = Math.round(sum / projectQuests.length);
      }

      const hpRemaining = Math.max(0, 100 - totalProgress);
      const isDefeated = totalProgress >= 100 && projectQuests.length > 0;

      // Calculate phases progress
      const phases = config.phases && config.phases.length > 0
        ? config.phases
        : createDefaultPhases(projectId, projectQuests);

      let foundActive = false;
      let activePhase: BossPhase | null = null;

      const phaseProgress = phases.map((phase) => {
        const pQuests = projectQuests.filter((q) => phase.questIds.includes(q.id));
        let pProgress = 0;
        if (pQuests.length > 0) {
          const sum = pQuests.reduce((acc, q) => acc + q.progress, 0);
          pProgress = Math.round(sum / pQuests.length);
        } else {
          pProgress = totalProgress;
        }

        const isComplete = pProgress >= 100;
        let isCurrent = false;
        if (!isComplete && !foundActive) {
          isCurrent = true;
          foundActive = true;
          activePhase = phase;
        }

        return {
          phase,
          quests: pQuests,
          progress: pProgress,
          isComplete,
          isCurrent,
        };
      });

      if (!activePhase && phaseProgress.length > 0) {
        activePhase = phaseProgress[phaseProgress.length - 1].phase;
      }

      return {
        config,
        project,
        quests: projectQuests,
        progress: totalProgress,
        hpRemaining,
        isDefeated,
        activePhase,
        phaseProgress,
      };
    },
    [projects, bossConfigs, getProjectQuests, createDefaultPhases]
  );

  const toggleBossMode = React.useCallback(
    (projectId: string, enabled?: boolean) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      const projectQuests = getProjectQuests(projectId);
      const current = bossConfigs[projectId] || {
        projectId,
        enabled: false,
        title: `BOSS: ${project.name.toUpperCase()}`,
        phases: createDefaultPhases(projectId, projectQuests),
      };

      const nextEnabled = typeof enabled === "boolean" ? enabled : !current.enabled;
      const updated: BossBattleConfig = {
        ...current,
        enabled: nextEnabled,
      };

      const next = { ...bossConfigs, [projectId]: updated };
      persistBossConfigs(next);

      toast({
        title: nextEnabled ? "Boss Battle Engaged" : "Standard Project View",
        description: nextEnabled
          ? `Project '${project.name}' is now in Boss Battle Mode.`
          : `Switched '${project.name}' to standard list view.`,
      });
    },
    [projects, bossConfigs, getProjectQuests, createDefaultPhases, persistBossConfigs, toast]
  );

  const updateBossTitle = React.useCallback(
    (projectId: string, title: string) => {
      const current = bossConfigs[projectId] || {
        projectId,
        enabled: true,
        phases: [],
      };
      const updated = { ...current, title };
      const next = { ...bossConfigs, [projectId]: updated };
      persistBossConfigs(next);
    },
    [bossConfigs, persistBossConfigs]
  );

  const updateBossPhases = React.useCallback(
    (projectId: string, phases: BossPhase[]) => {
      const current = bossConfigs[projectId] || {
        projectId,
        enabled: true,
      };
      const updated = { ...current, phases };
      const next = { ...bossConfigs, [projectId]: updated };
      persistBossConfigs(next);
    },
    [bossConfigs, persistBossConfigs]
  );

  const autoGeneratePhases = React.useCallback(
    (projectId: string) => {
      const projectQuests = getProjectQuests(projectId);
      const phases = createDefaultPhases(projectId, projectQuests);
      updateBossPhases(projectId, phases);
    },
    [getProjectQuests, createDefaultPhases, updateBossPhases]
  );

  const claimBossDefeatReward = React.useCallback(
    (projectId: string) => {
      const state = getBossState(projectId);
      if (!state || !state.isDefeated) return;
      if (state.config.claimedDefeatRewardAt) return;

      const refId = `boss_defeated:${projectId}`;
      awardXp({
        type: "boss_defeated",
        customAmount: XP_REWARDS.questCompleted * 3,
        referenceId: refId,
        label: `Boss Defeated: ${state.project.name}`,
      });

      soundService.playAchievementSound(appSettings.soundEffects);

      const updated: BossBattleConfig = {
        ...state.config,
        defeatedAt: state.config.defeatedAt || new Date().toISOString(),
        claimedDefeatRewardAt: new Date().toISOString(),
      };

      const next = { ...bossConfigs, [projectId]: updated };
      persistBossConfigs(next);

      toast({
        title: "BOSS DEFEATED!",
        description: `Everything is done. Suspicious. (+${XP_REWARDS.questCompleted * 3} XP)`,
      });
    },
    [getBossState, awardXp, appSettings.soundEffects, bossConfigs, persistBossConfigs, toast]
  );

  // Monitor projects for completion to trigger defeat reward
  React.useEffect(() => {
    Object.keys(bossConfigs).forEach((projId) => {
      const conf = bossConfigs[projId];
      if (conf?.enabled && !conf.claimedDefeatRewardAt) {
        const state = getBossState(projId);
        if (state?.isDefeated) {
          claimBossDefeatReward(projId);
        }
      }
    });
  }, [bossConfigs, quests, getBossState, claimBossDefeatReward]);

  const value = React.useMemo<BossContextValue>(
    () => ({
      bossConfigs,
      damageFeedbacks,
      getBossState,
      toggleBossMode,
      updateBossTitle,
      updateBossPhases,
      autoGeneratePhases,
      claimBossDefeatReward,
    }),
    [
      bossConfigs,
      damageFeedbacks,
      getBossState,
      toggleBossMode,
      updateBossTitle,
      updateBossPhases,
      autoGeneratePhases,
      claimBossDefeatReward,
    ]
  );

  return <BossContext.Provider value={value}>{children}</BossContext.Provider>;
}

export function useBossContext(): BossContextValue {
  const ctx = React.useContext(BossContext);
  if (!ctx) {
    throw new Error("useBossContext must be used within a BossProvider");
  }
  return ctx;
}
