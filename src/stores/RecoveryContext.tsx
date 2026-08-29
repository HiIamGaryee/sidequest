import * as React from "react";
import type {
  RecoveryType,
  RecoveryQuest,
  RecoveryLog,
  RecoveryPreferences,
} from "@/types/recovery";
import {
  DEFAULT_RECOVERY_PREFERENCES,
  RECOVERY_CONFIG,
  RECOVERY_DURATIONS,
} from "@/config/recovery";
import {
  evaluateRecoveryNeeds,
  getLatestRecoveryLog,
  getMinutesSinceRecovery,
} from "@/lib/recovery-utils";
import { useFocusContext } from "./FocusContext";
import { useQuestContext } from "./QuestContext";
import { useContextKeeperContext } from "./ContextKeeperContext";
import { useGamificationContext } from "./GamificationContext";
import { usePersistence } from "./PersistenceContext";

export interface RecoveryContextValue {
  preferences: RecoveryPreferences;
  recoveryQuests: RecoveryQuest[];
  recoveryLogs: RecoveryLog[];
  activeQuest: RecoveryQuest | null;
  activeTimerQuest: RecoveryQuest | null;
  timerSeconds: number;
  timerInitialSeconds: number;
  isTimerRunning: boolean;
  isRecoveryCenterOpen: boolean;
  completedRecoveryNotification: {
    quest: RecoveryQuest;
    mainQuestTitle?: string;
    nextAction?: string;
  } | null;
  // Core actions
  createRecoveryQuest: (type: RecoveryType, options?: { sourceSessionId?: string }) => RecoveryQuest;
  startRecoveryQuest: (id: string, pauseFocusSessionCallback?: () => void) => void;
  completeRecoveryQuest: (id: string) => void;
  snoozeRecoveryQuest: (id: string, minutes?: number) => void;
  skipRecoveryQuest: (id: string) => void;
  dismissRecoveryQuest: (id: string) => void;
  dismissCompletedNotification: () => void;
  cancelRecoveryTimer: () => void;
  finishRecoveryTimer: () => void;
  // Manual Logging
  logWater: (sessionId?: string) => void;
  logMovement: (durationSeconds?: number, sessionId?: string) => void;
  logStretch: (sessionId?: string) => void;
  logEyeBreak: (durationSeconds?: number, sessionId?: string) => void;
  logBioBreak: (sessionId?: string) => void;
  logGeneralBreak: (durationSeconds?: number, sessionId?: string) => void;
  // UI & Settings
  updatePreferences: (patch: Partial<RecoveryPreferences>) => void;
  setIsRecoveryCenterOpen: (open: boolean) => void;
  openRecoveryCenter: () => void;
  closeRecoveryCenter: () => void;
  triggerImmediateEvaluation: () => void;
  getLogsForSession: (sessionId: string) => RecoveryLog[];
  getTodayRecoveryCount: () => number;
}

const RecoveryContext = React.createContext<RecoveryContextValue | null>(null);

export function RecoveryProvider({ children }: { children: React.ReactNode }) {
  const {
    status: focusStatus,
    currentSession,
    elapsedSeconds: focusElapsedSeconds,
    pauseFocusSession,
  } = useFocusContext();

  const { getMainQuest, getQuestNextAction, getQuestProgress } = useQuestContext();
  const { saveWorkContext } = useContextKeeperContext();
  const { awardXp, incrementCombo, protectCombo, evaluateAchievements } = useGamificationContext();
  const { initialState, saveSnapshot, isHydrated } = usePersistence();

  const [preferences, setPreferences] = React.useState<RecoveryPreferences>(
    () => initialState.recoveryPreferences || DEFAULT_RECOVERY_PREFERENCES
  );
  const [recoveryQuests, setRecoveryQuests] = React.useState<RecoveryQuest[]>(
    () => initialState.recoveryQuests
  );
  const [recoveryLogs, setRecoveryLogs] = React.useState<RecoveryLog[]>(
    () => initialState.recoveryLogs
  );
  const [activeQuest, setActiveQuest] = React.useState<RecoveryQuest | null>(null);
  const [activeTimerQuest, setActiveTimerQuest] = React.useState<RecoveryQuest | null>(null);

  // Sync state if initialState changes
  React.useEffect(() => {
    if (isHydrated) {
      setPreferences(initialState.recoveryPreferences || DEFAULT_RECOVERY_PREFERENCES);
      setRecoveryQuests(initialState.recoveryQuests);
      setRecoveryLogs(initialState.recoveryLogs);
    }
  }, [initialState, isHydrated]);

  // Persist whenever recovery state changes
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isHydrated) {
      saveSnapshot({
        recoveryQuests,
        recoveryLogs,
        recoveryPreferences: preferences,
      });
    }
  }, [recoveryQuests, recoveryLogs, preferences, isHydrated, saveSnapshot]);

  // Sync recovery achievements
  React.useEffect(() => {
    const movementRecoveryCount = recoveryLogs.filter(
      (l) => l.type === "movement" || l.type === "stretch"
    ).length;
    const waterRecoveryCount = recoveryLogs.filter((l) => l.type === "water").length;

    evaluateAchievements({
      movementRecoveryCount,
      waterRecoveryCount,
    });
  }, [recoveryLogs, evaluateAchievements]);

  const [timerSeconds, setTimerSeconds] = React.useState<number>(0);
  const [timerInitialSeconds, setTimerInitialSeconds] = React.useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = React.useState<boolean>(false);
  const [isRecoveryCenterOpen, setIsRecoveryCenterOpen] = React.useState<boolean>(false);
  const [lastGlobalActionTimestamp, setLastGlobalActionTimestamp] = React.useState<number | null>(null);

  const [completedRecoveryNotification, setCompletedRecoveryNotification] = React.useState<{
    quest: RecoveryQuest;
    mainQuestTitle?: string;
    nextAction?: string;
  } | null>(null);

  // High precision timestamp timer for recovery countdown
  const timerStartRef = React.useRef<number | null>(null);
  const timerDurationRef = React.useRef<number>(0);

  // Sync active quest
  React.useEffect(() => {
    if (!preferences.enabled) {
      setActiveQuest(null);
      return;
    }
    const currentPending = recoveryQuests.find(
      (q) => q.status === "pending" || q.status === "active"
    );
    setActiveQuest(currentPending || null);
  }, [preferences.enabled, recoveryQuests]);

  // Recalculate live timer countdown
  const recalculateTimer = React.useCallback(() => {
    if (isTimerRunning && timerStartRef.current !== null) {
      const elapsed = Math.floor((Date.now() - timerStartRef.current) / 1000);
      const remaining = Math.max(0, timerDurationRef.current - elapsed);
      setTimerSeconds(remaining);

      if (remaining <= 0) {
        // Timer completed!
        if (activeTimerQuest) {
          finishRecoveryTimer();
        }
      }
    }
  }, [activeTimerQuest, isTimerRunning]);

  // Timer tick interval
  React.useEffect(() => {
    if (!isTimerRunning) return;
    const interval = window.setInterval(() => {
      recalculateTimer();
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isTimerRunning, recalculateTimer]);

  // Visibility change check for background timer recovery
  React.useEffect(() => {
    const handleVis = () => {
      if (document.visibilityState === "visible") {
        if (isTimerRunning) {
          recalculateTimer();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVis);
    return () => document.removeEventListener("visibilitychange", handleVis);
  }, [isTimerRunning, recalculateTimer]);

  // --- ACTIONS ---

  const createRecoveryQuest = React.useCallback(
    (type: RecoveryType, options?: { sourceSessionId?: string }): RecoveryQuest => {
      const config = RECOVERY_CONFIG[type];
      const newQuest: RecoveryQuest = {
        id: `rq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        title: config.title,
        description: config.description,
        status: "pending",
        createdAt: new Date().toISOString(),
        sourceSessionId: options?.sourceSessionId || currentSession?.id,
        durationSeconds: config.defaultDurationSeconds,
      };

      setRecoveryQuests((prev) => [newQuest, ...prev]);
      setActiveQuest(newQuest);
      return newQuest;
    },
    [currentSession?.id]
  );

  const startRecoveryQuest = React.useCallback(
    (id: string, pauseFocusSessionCallback?: () => void) => {
      const quest = recoveryQuests.find((q) => q.id === id);
      if (!quest) return;

      const duration = quest.durationSeconds ?? RECOVERY_DURATIONS[quest.type] ?? 0;

      // If user is currently focusing, pause focus session and save thread snapshot
      if (focusStatus === "running") {
        if (pauseFocusSessionCallback) {
          pauseFocusSessionCallback();
        } else {
          pauseFocusSession();
        }

        const mainQuest = getMainQuest();
        if (mainQuest) {
          saveWorkContext({
            questId: mainQuest.id,
            reason: "interruption",
            progress: getQuestProgress(mainQuest),
            nextAction: getQuestNextAction(mainQuest),
            blocker: mainQuest.blocker,
          });
        }
      }

      setRecoveryQuests((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "active" } : q))
      );

      if (duration > 0) {
        // Start countdown timer
        timerStartRef.current = Date.now();
        timerDurationRef.current = duration;
        setTimerInitialSeconds(duration);
        setTimerSeconds(duration);
        setIsTimerRunning(true);
        setActiveTimerQuest(quest);
      } else {
        // Instant quest (like Water / Stretch)
        completeRecoveryQuest(id);
      }
    },
    [
      focusStatus,
      getMainQuest,
      getQuestNextAction,
      getQuestProgress,
      pauseFocusSession,
      recoveryQuests,
      saveWorkContext,
    ]
  );

  const completeRecoveryQuest = React.useCallback(
    (id: string) => {
      const quest = recoveryQuests.find((q) => q.id === id);
      const now = new Date().toISOString();
      const nowMs = Date.now();

      if (quest) {
        // Create recovery log
        const newLog: RecoveryLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: quest.type,
          timestamp: now,
          sessionId: currentSession?.id || quest.sourceSessionId,
          durationSeconds: quest.durationSeconds,
          questId: quest.id,
        };

        setRecoveryLogs((prev) => [newLog, ...prev]);
        setLastGlobalActionTimestamp(nowMs);

        // Gamification XP + Combo protection
        awardXp({
          type: "recovery_completed",
          referenceId: newLog.id,
          label: `${RECOVERY_CONFIG[quest.type].label}`,
        });
        incrementCombo("recovery_completed");
        protectCombo("recovery");

        // Prepare post-recovery notification for seamless focus resumption
        const mainQuest = getMainQuest();
        setCompletedRecoveryNotification({
          quest,
          mainQuestTitle: mainQuest ? mainQuest.title : undefined,
          nextAction: mainQuest ? getQuestNextAction(mainQuest) : undefined,
        });
      }

      setRecoveryQuests((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, status: "completed", completedAt: now } : q
        )
      );

      // Stop any active timer
      setIsTimerRunning(false);
      timerStartRef.current = null;
      setActiveTimerQuest(null);
      setActiveQuest(null);
    },
    [
      currentSession?.id,
      getMainQuest,
      getQuestNextAction,
      recoveryQuests,
      awardXp,
      incrementCombo,
      protectCombo,
    ]
  );

  const snoozeRecoveryQuest = React.useCallback(
    (id: string, minutes = 10) => {
      const now = Date.now();
      const snoozeExpiry = new Date(now + minutes * 60 * 1000).toISOString();

      setRecoveryQuests((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, status: "snoozed", snoozedUntil: snoozeExpiry } : q
        )
      );

      setLastGlobalActionTimestamp(now);
      setIsTimerRunning(false);
      timerStartRef.current = null;
      setActiveTimerQuest(null);
      setActiveQuest(null);
    },
    []
  );

  const skipRecoveryQuest = React.useCallback((id: string) => {
    const now = Date.now();
    setRecoveryQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "skipped" } : q))
    );

    setLastGlobalActionTimestamp(now);
    setIsTimerRunning(false);
    timerStartRef.current = null;
    setActiveTimerQuest(null);
    setActiveQuest(null);
  }, []);

  const dismissRecoveryQuest = React.useCallback((id: string) => {
    setRecoveryQuests((prev) => prev.filter((q) => q.id !== id));
    setActiveQuest(null);
    setActiveTimerQuest(null);
    setIsTimerRunning(false);
    timerStartRef.current = null;
  }, []);

  const cancelRecoveryTimer = React.useCallback(() => {
    setIsTimerRunning(false);
    timerStartRef.current = null;
    if (activeTimerQuest) {
      skipRecoveryQuest(activeTimerQuest.id);
    }
  }, [activeTimerQuest, skipRecoveryQuest]);

  const finishRecoveryTimer = React.useCallback(() => {
    if (activeTimerQuest) {
      completeRecoveryQuest(activeTimerQuest.id);
    }
  }, [activeTimerQuest, completeRecoveryQuest]);

  const dismissCompletedNotification = React.useCallback(() => {
    setCompletedRecoveryNotification(null);
  }, []);

  // --- MANUAL LOGS ---

  const addManualLog = React.useCallback(
    (type: RecoveryType, durationSeconds = 0, sessionId?: string) => {
      const now = new Date().toISOString();
      const newLog: RecoveryLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        timestamp: now,
        sessionId: sessionId || currentSession?.id,
        durationSeconds,
      };

      setRecoveryLogs((prev) => [newLog, ...prev]);
      setLastGlobalActionTimestamp(Date.now());

      // Gamification XP + Combo protection
      awardXp({
        type: "recovery_completed",
        referenceId: newLog.id,
        label: `${RECOVERY_CONFIG[type].label}`,
      });
      incrementCombo("recovery_completed");
      protectCombo("recovery");

      // If there was a pending quest of this type, mark it completed
      setRecoveryQuests((prev) =>
        prev.map((q) =>
          q.type === type && (q.status === "pending" || q.status === "active")
            ? { ...q, status: "completed", completedAt: now }
            : q
        )
      );
    },
    [currentSession?.id, awardXp, incrementCombo, protectCombo]
  );

  const logWater = React.useCallback(
    (sessionId?: string) => addManualLog("water", 0, sessionId),
    [addManualLog]
  );
  const logMovement = React.useCallback(
    (durationSeconds = 120, sessionId?: string) =>
      addManualLog("movement", durationSeconds, sessionId),
    [addManualLog]
  );
  const logStretch = React.useCallback(
    (sessionId?: string) => addManualLog("stretch", 60, sessionId),
    [addManualLog]
  );
  const logEyeBreak = React.useCallback(
    (durationSeconds = 30, sessionId?: string) =>
      addManualLog("eyes", durationSeconds, sessionId),
    [addManualLog]
  );
  const logBioBreak = React.useCallback(
    (sessionId?: string) => addManualLog("bio", 300, sessionId),
    [addManualLog]
  );
  const logGeneralBreak = React.useCallback(
    (durationSeconds = 300, sessionId?: string) =>
      addManualLog("break", durationSeconds, sessionId),
    [addManualLog]
  );

  const updatePreferences = React.useCallback(
    (patch: Partial<RecoveryPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...patch };
        if (next.enabled === false) {
          setActiveQuest(null);
        }
        return next;
      });
    },
    []
  );

  const triggerImmediateEvaluation = React.useCallback(() => {
    const mainQuest = getMainQuest();
    const progress = mainQuest ? getQuestProgress(mainQuest) : 0;
    const sessionMins = Math.floor(focusElapsedSeconds / 60);

    const neededType = evaluateRecoveryNeeds({
      preferences,
      focusSessionElapsedMinutes: sessionMins,
      focusSessionStatus: focusStatus,
      questProgress: progress,
      quests: recoveryQuests,
      logs: recoveryLogs,
      lastGlobalActionTimestamp,
      isModalOpen: isRecoveryCenterOpen,
    });

    if (neededType) {
      createRecoveryQuest(neededType);
    }
  }, [
    createRecoveryQuest,
    focusElapsedSeconds,
    focusStatus,
    getMainQuest,
    getQuestProgress,
    isRecoveryCenterOpen,
    lastGlobalActionTimestamp,
    preferences,
    recoveryLogs,
    recoveryQuests,
  ]);

  // Periodic evaluation every 30 seconds
  React.useEffect(() => {
    if (!preferences.enabled) return;

    const interval = window.setInterval(() => {
      triggerImmediateEvaluation();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [preferences.enabled, triggerImmediateEvaluation]);

  // Evaluation on tab visibility return
  React.useEffect(() => {
    const handleVis = () => {
      if (document.visibilityState === "visible" && preferences.enabled) {
        triggerImmediateEvaluation();
      }
    };
    document.addEventListener("visibilitychange", handleVis);
    return () => document.removeEventListener("visibilitychange", handleVis);
  }, [preferences.enabled, triggerImmediateEvaluation]);

  const getLogsForSession = React.useCallback(
    (sessionId: string) => {
      return recoveryLogs.filter((log) => log.sessionId === sessionId);
    },
    [recoveryLogs]
  );

  const getTodayRecoveryCount = React.useCallback(() => {
    return recoveryLogs.length;
  }, [recoveryLogs]);

  const openRecoveryCenter = React.useCallback(() => {
    setIsRecoveryCenterOpen(true);
  }, []);

  const closeRecoveryCenter = React.useCallback(() => {
    setIsRecoveryCenterOpen(false);
  }, []);

  const contextValue = React.useMemo<RecoveryContextValue>(
    () => ({
      preferences,
      recoveryQuests,
      recoveryLogs,
      activeQuest,
      activeTimerQuest,
      timerSeconds,
      timerInitialSeconds,
      isTimerRunning,
      isRecoveryCenterOpen,
      completedRecoveryNotification,
      createRecoveryQuest,
      startRecoveryQuest,
      completeRecoveryQuest,
      snoozeRecoveryQuest,
      skipRecoveryQuest,
      dismissRecoveryQuest,
      dismissCompletedNotification,
      cancelRecoveryTimer,
      finishRecoveryTimer,
      logWater,
      logMovement,
      logStretch,
      logEyeBreak,
      logBioBreak,
      logGeneralBreak,
      updatePreferences,
      setIsRecoveryCenterOpen,
      openRecoveryCenter,
      closeRecoveryCenter,
      triggerImmediateEvaluation,
      getLogsForSession,
      getTodayRecoveryCount,
    }),
    [
      preferences,
      recoveryQuests,
      recoveryLogs,
      activeQuest,
      activeTimerQuest,
      timerSeconds,
      timerInitialSeconds,
      isTimerRunning,
      isRecoveryCenterOpen,
      completedRecoveryNotification,
      createRecoveryQuest,
      startRecoveryQuest,
      completeRecoveryQuest,
      snoozeRecoveryQuest,
      skipRecoveryQuest,
      dismissRecoveryQuest,
      dismissCompletedNotification,
      cancelRecoveryTimer,
      finishRecoveryTimer,
      logWater,
      logMovement,
      logStretch,
      logEyeBreak,
      logBioBreak,
      logGeneralBreak,
      updatePreferences,
      openRecoveryCenter,
      closeRecoveryCenter,
      triggerImmediateEvaluation,
      getLogsForSession,
      getTodayRecoveryCount,
    ]
  );

  return (
    <RecoveryContext.Provider value={contextValue}>
      {children}
    </RecoveryContext.Provider>
  );
}

export function useRecoveryContext(): RecoveryContextValue {
  const context = React.useContext(RecoveryContext);
  if (!context) {
    throw new Error("useRecoveryContext must be used within a RecoveryProvider");
  }
  return context;
}
