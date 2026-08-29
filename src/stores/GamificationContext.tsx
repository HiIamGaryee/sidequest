import * as React from "react";
import type {
  PlayerProfile,
  XpEvent,
  XpEventType,
  Achievement,
  GamificationSettings,
  LevelUpEvent,
  XpFeedbackItem,
} from "@/types/gamification";
import {
  XP_REWARDS,
  ACHIEVEMENT_DEFINITIONS,
  DEFAULT_GAMIFICATION_SETTINGS,
} from "@/config/gamification";
import { getLevelFromXp, getTodayXp, hasXpEventForReference } from "@/lib/gamification-utils";
import { usePersistence } from "./PersistenceContext";
import { soundService } from "@/services/sound/sound-service";

export interface AwardXpInput {
  type: XpEventType;
  referenceId?: string;
  label?: string;
  customAmount?: number;
  metadata?: Record<string, unknown>;
}

export interface GamificationContextValue {
  playerProfile: PlayerProfile;
  xpEvents: XpEvent[];
  achievements: Achievement[];
  settings: GamificationSettings;
  activeLevelUp: LevelUpEvent | null;
  activeAchievementToast: Achievement | null;
  activeXpFeedback: XpFeedbackItem | null;
  comboFeedback: { combo: number; protected?: boolean } | null;
  todayXp: number;
  levelInfo: ReturnType<typeof getLevelFromXp>;
  // Actions
  awardXp: (input: AwardXpInput) => boolean;
  incrementCombo: (source?: string) => number;
  protectCombo: (reason?: string) => void;
  resetCombo: (reason?: string) => void;
  unlockAchievement: (id: string) => boolean;
  evaluateAchievements: (stats?: Partial<AchievementRuntimeStats>) => void;
  updateSettings: (patch: Partial<GamificationSettings>) => void;
  dismissLevelUp: () => void;
  dismissAchievementToast: () => void;
  dismissXpFeedback: () => void;
  // Inspection helpers for WebMCP
  getPlayerState: () => PlayerProfile & { levelTitle: string; xpToNextLevel: number };
  getXpSummary: () => { totalXp: number; todayXp: number; eventCount: number; events: XpEvent[] };
  getAchievements: () => Achievement[];
  getCurrentCombo: () => { current: number; best: number };
}

export interface AchievementRuntimeStats {
  completedQuestsCount: number;
  completedMainQuestsCount: number;
  completedTinyStepsCount: number;
  parkedSideQuestsCount: number;
  resumedCount: number;
  movementRecoveryCount: number;
  waterRecoveryCount: number;
  unstuckCount: number;
  hasLongFocusSession: boolean; // >= 25 mins
}

const GamificationContext = React.createContext<GamificationContextValue | null>(null);

// Initial in-memory seed events reflecting initial project state
const INITIAL_XP_EVENTS: XpEvent[] = [
  {
    id: "xp-seed-1",
    type: "quest_completed",
    amount: 30,
    referenceId: "quest-ui-foundation",
    label: "Completed: Build UI Foundation",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "xp-seed-2",
    type: "step_completed",
    amount: 5,
    referenceId: "step-seed-1",
    label: "Step Complete",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "xp-seed-3",
    type: "step_completed",
    amount: 5,
    referenceId: "step-seed-2",
    label: "Step Complete",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { initialState, saveSnapshot, isHydrated, appSettings } = usePersistence();

  const [xpEvents, setXpEvents] = React.useState<XpEvent[]>(() => initialState.xpEvents);
  const [settings, setSettings] = React.useState<GamificationSettings>(
    () => initialState.gamificationSettings || DEFAULT_GAMIFICATION_SETTINGS
  );
  const [currentCombo, setCurrentCombo] = React.useState<number>(
    () => initialState.playerProfile?.currentCombo || 0
  );
  const [bestCombo, setBestCombo] = React.useState<number>(
    () => initialState.playerProfile?.bestCombo || 0
  );

  // Modals & Feedback Queue
  const [activeLevelUp, setActiveLevelUp] = React.useState<LevelUpEvent | null>(null);
  const [activeAchievementToast, setActiveAchievementToast] = React.useState<Achievement | null>(null);
  const [activeXpFeedback, setActiveXpFeedback] = React.useState<XpFeedbackItem | null>(null);
  const [comboFeedback, setComboFeedback] = React.useState<{ combo: number; protected?: boolean } | null>(null);

  // Unlocked achievements store with metadata
  const [unlockedIds, setUnlockedIds] = React.useState<Record<string, string>>(
    () => initialState.unlockedAchievementIds || {}
  );

  // Sync state if initialState changes (demo load / import)
  React.useEffect(() => {
    if (isHydrated) {
      setXpEvents(initialState.xpEvents);
      setSettings(initialState.gamificationSettings || DEFAULT_GAMIFICATION_SETTINGS);
      setCurrentCombo(initialState.playerProfile?.currentCombo || 0);
      setBestCombo(initialState.playerProfile?.bestCombo || 0);
      setUnlockedIds(initialState.unlockedAchievementIds || {});
    }
  }, [initialState, isHydrated]);

  // Persist whenever gamification state changes
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isHydrated) {
      const total = xpEvents.reduce((sum, e) => sum + e.amount, 0);
      const lvl = getLevelFromXp(total).level;
      saveSnapshot({
        xpEvents,
        unlockedAchievementIds: unlockedIds,
        gamificationSettings: settings,
        playerProfile: {
          xp: total,
          level: lvl,
          lifetimeXp: total,
          currentCombo,
          bestCombo,
        },
      });
    }
  }, [xpEvents, unlockedIds, settings, currentCombo, bestCombo, isHydrated, saveSnapshot]);

  // Calculate total XP from events
  const totalXp = React.useMemo(() => {
    return xpEvents.reduce((sum, e) => sum + e.amount, 0);
  }, [xpEvents]);

  const levelInfo = React.useMemo(() => {
    return getLevelFromXp(totalXp);
  }, [totalXp]);

  const todayXp = React.useMemo(() => {
    return getTodayXp(xpEvents);
  }, [xpEvents]);

  const playerProfile: PlayerProfile = React.useMemo(() => ({
    xp: totalXp,
    level: levelInfo.level,
    lifetimeXp: totalXp,
    currentCombo,
    bestCombo,
  }), [totalXp, levelInfo.level, currentCombo, bestCombo]);

  // Build achievement list combining definitions, unlocked state, and runtime progress
  const [runtimeStats, setRuntimeStats] = React.useState<AchievementRuntimeStats>({
    completedQuestsCount: 1,
    completedMainQuestsCount: 0,
    completedTinyStepsCount: 0,
    parkedSideQuestsCount: 3,
    resumedCount: 0,
    movementRecoveryCount: 0,
    waterRecoveryCount: 0,
    unstuckCount: 0,
    hasLongFocusSession: false,
  });

  const achievements: Achievement[] = React.useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      const unlockedAt = unlockedIds[def.id];
      const isUnlocked = !!unlockedAt;

      let current = 0;
      switch (def.id) {
        case "back-from-the-void":
          current = runtimeStats.resumedCount;
          break;
        case "not-today-side-quest":
          current = runtimeStats.parkedSideQuestsCount;
          break;
        case "touch-grass":
          current = runtimeStats.movementRecoveryCount;
          break;
        case "hydrated-developer":
          current = runtimeStats.waterRecoveryCount;
          break;
        case "ship-it":
          current = runtimeStats.completedMainQuestsCount;
          break;
        case "locked-in":
          current = runtimeStats.hasLongFocusSession ? 1 : 0;
          break;
        case "tiny-but-deadly":
          current = runtimeStats.completedTinyStepsCount;
          break;
        case "unstuck":
          current = runtimeStats.unstuckCount;
          break;
        case "the-finisher":
          current = runtimeStats.completedQuestsCount;
          break;
        case "main-character-energy":
          current = runtimeStats.completedMainQuestsCount;
          break;
      }

      return {
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
        xpReward: def.xpReward,
        isUnlocked: isUnlocked || current >= def.targetCount,
        unlockedAt: unlockedAt || (current >= def.targetCount ? "Recently Unlocked" : undefined),
        progress: {
          current: Math.min(def.targetCount, current),
          target: def.targetCount,
        },
      };
    });
  }, [unlockedIds, runtimeStats]);

  // Dismiss helpers
  const dismissLevelUp = React.useCallback(() => setActiveLevelUp(null), []);
  const dismissAchievementToast = React.useCallback(() => setActiveAchievementToast(null), []);
  const dismissXpFeedback = React.useCallback(() => setActiveXpFeedback(null), []);

  // Unlock achievement action
  const unlockAchievement = React.useCallback((id: string): boolean => {
    const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id);
    if (!def) return false;

    if (unlockedIds[id]) return false; // Already unlocked

    const timestamp = new Date().toISOString();
    setUnlockedIds((prev) => ({ ...prev, [id]: timestamp }));

    if (settings.enabled && settings.achievementPopups) {
      setActiveAchievementToast({
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
        xpReward: def.xpReward,
        isUnlocked: true,
        unlockedAt: timestamp,
      });
      soundService.playAchievementSound(appSettings?.soundEffects);
    }

    return true;
  }, [unlockedIds, settings, appSettings]);

  // Evaluate achievements based on stats
  const evaluateAchievements = React.useCallback((patch?: Partial<AchievementRuntimeStats>) => {
    if (patch) {
      setRuntimeStats((prev) => {
        const next = { ...prev, ...patch };
        ACHIEVEMENT_DEFINITIONS.forEach((def) => {
          let count = 0;
          switch (def.id) {
            case "back-from-the-void":
              count = next.resumedCount;
              break;
            case "not-today-side-quest":
              count = next.parkedSideQuestsCount;
              break;
            case "touch-grass":
              count = next.movementRecoveryCount;
              break;
            case "hydrated-developer":
              count = next.waterRecoveryCount;
              break;
            case "ship-it":
              count = next.completedMainQuestsCount;
              break;
            case "locked-in":
              count = next.hasLongFocusSession ? 1 : 0;
              break;
            case "tiny-but-deadly":
              count = next.completedTinyStepsCount;
              break;
            case "unstuck":
              count = next.unstuckCount;
              break;
            case "the-finisher":
              count = next.completedQuestsCount;
              break;
            case "main-character-energy":
              count = next.completedMainQuestsCount;
              break;
          }

          if (count >= def.targetCount && !unlockedIds[def.id]) {
            unlockAchievement(def.id);
          }
        });
        return next;
      });
    }
  }, [unlockedIds, unlockAchievement]);

  // Primary XP reward function with idempotency / spam protection
  const awardXp = React.useCallback((input: AwardXpInput): boolean => {
    const { type, referenceId, label, customAmount } = input;

    // Check anti-farming rules
    if (referenceId && hasXpEventForReference(xpEvents, type, referenceId)) {
      return false; // Already rewarded!
    }

    // Determine amount from centralized config
    let amount = customAmount;
    if (amount === undefined) {
      switch (type) {
        case "step_completed":
          amount = XP_REWARDS.stepCompleted;
          break;
        case "quest_completed":
          amount = XP_REWARDS.questCompleted;
          break;
        case "main_quest_completed":
          amount = XP_REWARDS.mainQuestCompleted;
          break;
        case "focus_session_completed":
          amount = XP_REWARDS.focusSessionCompleted;
          break;
        case "resume_after_interruption":
          amount = XP_REWARDS.resumeAfterInterruption;
          break;
        case "side_quest_parked":
          amount = XP_REWARDS.sideQuestParked;
          break;
        case "recovery_completed":
          amount = XP_REWARDS.recoveryCompleted;
          break;
        case "unstuck_action":
          amount = XP_REWARDS.unstuckAction;
          break;
        default:
          amount = 5;
      }
    }

    const previousTotalXp = totalXp;
    const nextTotalXp = previousTotalXp + amount;
    const oldLevelInfo = getLevelFromXp(previousTotalXp);
    const newLevelInfo = getLevelFromXp(nextTotalXp);

    const newEvent: XpEvent = {
      id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      amount,
      createdAt: new Date().toISOString(),
      referenceId,
      label: label || type.replace(/_/g, " "),
      metadata: input.metadata,
    };

    setXpEvents((prev) => [newEvent, ...prev]);

    // Check for level up (supports multi-level jumps, e.g. LV. 1 -> LV. 3)
    if (newLevelInfo.level > oldLevelInfo.level) {
      if (settings.enabled) {
        setActiveLevelUp({
          id: `lvl-${Date.now()}`,
          oldLevel: oldLevelInfo.level,
          newLevel: newLevelInfo.level,
          oldTitle: oldLevelInfo.title,
          newTitle: newLevelInfo.title,
          timestamp: new Date().toISOString(),
        });
        soundService.playLevelUpSound(appSettings?.soundEffects);
      }
    } else {
      soundService.playXpChime(appSettings?.soundEffects);
    }

    // Show floating/toast XP feedback
    if (settings.enabled && settings.xpFeedback) {
      setActiveXpFeedback({
        id: newEvent.id,
        amount,
        label: newEvent.label || "XP Earned",
        type,
        timestamp: Date.now(),
      });
    }

    return true;
  }, [xpEvents, totalXp, settings]);

  // Combo handling
  const incrementCombo = React.useCallback((source?: string): number => {
    let nextVal = 0;
    setCurrentCombo((prev) => {
      nextVal = prev + 1;
      setBestCombo((currBest) => Math.max(currBest, nextVal));
      return nextVal;
    });

    if (settings.enabled && settings.comboDisplay) {
      setComboFeedback({ combo: nextVal });
    }

    return nextVal;
  }, [settings]);

  const protectCombo = React.useCallback((reason?: string) => {
    if (settings.enabled && settings.comboDisplay) {
      setComboFeedback((prev) => ({
        combo: prev?.combo || currentCombo,
        protected: true,
      }));
    }
  }, [settings, currentCombo]);

  const resetCombo = React.useCallback((reason?: string) => {
    setCurrentCombo(0);
    setComboFeedback(null);
  }, []);

  const updateSettings = React.useCallback((patch: Partial<GamificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  // WebMCP state inspection exports
  const getPlayerState = React.useCallback(() => {
    return {
      ...playerProfile,
      levelTitle: levelInfo.title,
      xpToNextLevel: levelInfo.remainingXp,
    };
  }, [playerProfile, levelInfo]);

  const getXpSummary = React.useCallback(() => {
    return {
      totalXp,
      todayXp,
      eventCount: xpEvents.length,
      events: xpEvents,
    };
  }, [totalXp, todayXp, xpEvents]);

  const getAchievementsExport = React.useCallback(() => {
    return achievements;
  }, [achievements]);

  const getCurrentComboExport = React.useCallback(() => {
    return { current: currentCombo, best: bestCombo };
  }, [currentCombo, bestCombo]);

  const value: GamificationContextValue = {
    playerProfile,
    xpEvents,
    achievements,
    settings,
    activeLevelUp,
    activeAchievementToast,
    activeXpFeedback,
    comboFeedback,
    todayXp,
    levelInfo,
    awardXp,
    incrementCombo,
    protectCombo,
    resetCombo,
    unlockAchievement,
    evaluateAchievements,
    updateSettings,
    dismissLevelUp,
    dismissAchievementToast,
    dismissXpFeedback,
    getPlayerState,
    getXpSummary,
    getAchievements: getAchievementsExport,
    getCurrentCombo: getCurrentComboExport,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamificationContext() {
  const context = React.useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamificationContext must be used within a GamificationProvider");
  }
  return context;
}
