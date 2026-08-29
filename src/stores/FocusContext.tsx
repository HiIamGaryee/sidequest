import * as React from "react";
import type { FocusSession, FocusSessionStatus } from "@/types/focus";
import { useQuestContext } from "./QuestContext";
import { useGamificationContext } from "./GamificationContext";
import { usePersistence } from "./PersistenceContext";
import { soundService } from "@/services/sound/sound-service";

export interface ActiveSessionRecoveryInfo {
  session: FocusSession;
  elapsedMinutes: number;
  questTitle: string;
}

export interface FocusContextValue {
  focusSessions: FocusSession[];
  currentSession: FocusSession | null;
  lastCompletedSession: FocusSession | null;
  status: FocusSessionStatus;
  plannedMinutes: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  overtimeSeconds: number;
  isOvertime: boolean;
  isTimesUpPromptVisible: boolean;
  activeSessionRecoveryInfo: ActiveSessionRecoveryInfo | null;
  // Core actions
  startFocusSession: (questId: string, plannedMinutes?: number) => FocusSession;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  endFocusSession: () => FocusSession | null;
  resetFocusSession: () => void;
  continueOvertime: () => void;
  dismissTimesUpPrompt: () => void;
  setPlannedMinutes: (minutes: number) => void;
  resolveActiveSessionRecovery: (action: "resume" | "end") => void;
}

const FocusContext = React.createContext<FocusContextValue | null>(null);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const {
    quests,
    projects,
    getQuestProgress,
    getQuestSteps,
  } = useQuestContext();
  const { awardXp, evaluateAchievements } = useGamificationContext();
  const { initialState, saveSnapshot, isHydrated, appSettings } = usePersistence();

  const [focusSessions, setFocusSessions] = React.useState<FocusSession[]>(
    () => initialState.focusSessions
  );
  const [currentSession, setCurrentSession] = React.useState<FocusSession | null>(
    () => initialState.activeFocusSession
  );
  const [lastCompletedSession, setLastCompletedSession] = React.useState<FocusSession | null>(null);

  const [status, setStatus] = React.useState<FocusSessionStatus>("idle");
  const [plannedMinutes, setPlannedMinutes] = React.useState<number>(
    () => initialState.focusPlannedMinutes || 25
  );
  const [elapsedSeconds, setElapsedSeconds] = React.useState<number>(0);
  const [isTimesUpPromptVisible, setIsTimesUpPromptVisible] = React.useState<boolean>(false);
  const [hasPromptedTimesUp, setHasPromptedTimesUp] = React.useState<boolean>(false);
  const [activeSessionRecoveryInfo, setActiveSessionRecoveryInfo] =
    React.useState<ActiveSessionRecoveryInfo | null>(null);

  // High precision timestamp refs to avoid timer drift
  const activeSegmentStartRef = React.useRef<number | null>(null);
  const accumulatedElapsedRef = React.useRef<number>(0);
  const pausedAtTimestampRef = React.useRef<number | null>(null);
  const totalPausedSecondsRef = React.useRef<number>(0);
  const plannedDurationSecondsRef = React.useRef<number>(25 * 60);

  // Hydration & Active Focus Session Recovery logic (Requirements 12, 13, 14)
  const hydrationHandledRef = React.useRef(false);
  React.useEffect(() => {
    if (!isHydrated || hydrationHandledRef.current) return;
    hydrationHandledRef.current = true;

    setFocusSessions(initialState.focusSessions);
    const restoredSession = initialState.activeFocusSession;

    if (restoredSession) {
      const planned = restoredSession.plannedMinutes || 25;
      setPlannedMinutes(planned);
      plannedDurationSecondsRef.current = planned * 60;

      if (restoredSession.status === "paused") {
        // Paused session: stay paused with exact saved elapsed
        const savedElapsed = restoredSession.elapsedSeconds || 0;
        accumulatedElapsedRef.current = savedElapsed;
        totalPausedSecondsRef.current = restoredSession.totalPausedSeconds || 0;
        setElapsedSeconds(savedElapsed);
        setStatus("paused");
        setCurrentSession(restoredSession);
      } else if (restoredSession.status === "running") {
        // Running session: recalculate based on timestamps
        const startTime = new Date(restoredSession.startedAt).getTime();
        const now = Date.now();
        const totalSinceStart = Math.max(0, Math.floor((now - startTime) / 1000));
        const pausedSec = restoredSession.totalPausedSeconds || 0;
        const actualElapsed = Math.max(0, totalSinceStart - pausedSec);

        // If elapsed is large (> 45 min or passed planned + 15m), show Welcome Back Recovery Dialog
        if (actualElapsed > planned * 60 + 900 || actualElapsed > 2700) {
          accumulatedElapsedRef.current = actualElapsed;
          setElapsedSeconds(actualElapsed);
          setStatus("paused");
          setCurrentSession({
            ...restoredSession,
            status: "paused",
            elapsedSeconds: actualElapsed,
          });
          setActiveSessionRecoveryInfo({
            session: restoredSession,
            elapsedMinutes: Math.floor(actualElapsed / 60),
            questTitle: restoredSession.questTitle || "Main Quest",
          });
        } else {
          // Short reload (e.g. quick refresh during 25m focus) -> safely resume timer calculation
          accumulatedElapsedRef.current = actualElapsed;
          activeSegmentStartRef.current = now;
          setElapsedSeconds(actualElapsed);
          setStatus("running");
          setCurrentSession(restoredSession);
        }
      }
    }
  }, [initialState, isHydrated]);

  // Persist session changes immediately on key actions (not on every second tick)
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isHydrated) {
      saveSnapshot(
        {
          focusSessions,
          activeFocusSession: currentSession,
          focusPlannedMinutes: plannedMinutes,
        },
        true
      );
    }
  }, [focusSessions, currentSession, plannedMinutes, isHydrated, saveSnapshot]);

  // Sync ref with state
  React.useEffect(() => {
    plannedDurationSecondsRef.current = plannedMinutes * 60;
  }, [plannedMinutes]);

  // Derived timer values
  const plannedSeconds = plannedMinutes * 60;
  const isOvertime = elapsedSeconds > plannedSeconds;
  const remainingSeconds = Math.max(0, plannedSeconds - elapsedSeconds);
  const overtimeSeconds = Math.max(0, elapsedSeconds - plannedSeconds);

  // Calculate live elapsed seconds using timestamps
  const recalculateElapsed = React.useCallback(() => {
    if (status === "running" && activeSegmentStartRef.current !== null) {
      const currentSegmentSeconds = Math.floor(
        (Date.now() - activeSegmentStartRef.current) / 1000
      );
      const totalElapsed = accumulatedElapsedRef.current + currentSegmentSeconds;
      setElapsedSeconds(totalElapsed);

      // Check for times up prompt trigger
      if (
        totalElapsed >= plannedDurationSecondsRef.current &&
        !hasPromptedTimesUp &&
        plannedDurationSecondsRef.current > 0
      ) {
        setIsTimesUpPromptVisible(true);
        setHasPromptedTimesUp(true);
        soundService.playFocusCompleteSound(appSettings?.soundEffects);
      }
    }
  }, [status, hasPromptedTimesUp, appSettings]);

  // 1-second interval loop when running
  React.useEffect(() => {
    if (status !== "running") return;

    const intervalId = window.setInterval(() => {
      recalculateElapsed();
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [status, recalculateElapsed]);

  // Sync timer on tab visibility change to avoid background throttling drift
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && status === "running") {
        recalculateElapsed();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status, recalculateElapsed]);

  // --- ACTIONS ---

  const startFocusSession = React.useCallback(
    (questId: string, durationMinutes = plannedMinutes): FocusSession => {
      const quest = quests.find((q) => q.id === questId);
      const project = quest ? projects.find((p) => p.id === quest.projectId) : undefined;
      const steps = getQuestSteps(questId);
      const startingCompletedStepIds = steps
        .filter((s) => s.status === "completed")
        .map((s) => s.id);
      const startingProgress = quest ? getQuestProgress(quest) : 0;

      const duration = durationMinutes > 0 ? durationMinutes : 25;
      setPlannedMinutes(duration);
      plannedDurationSecondsRef.current = duration * 60;

      const newSession: FocusSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        questId,
        questTitle: quest ? quest.title : "Main Quest",
        projectName: project ? project.name : undefined,
        startedAt: new Date().toISOString(),
        status: "running",
        plannedMinutes: duration,
        elapsedSeconds: 0,
        totalPausedSeconds: 0,
        startingProgress,
        startingCompletedStepIds,
      };

      // Reset timestamp tracking
      accumulatedElapsedRef.current = 0;
      activeSegmentStartRef.current = Date.now();
      pausedAtTimestampRef.current = null;
      totalPausedSecondsRef.current = 0;

      setElapsedSeconds(0);
      setIsTimesUpPromptVisible(false);
      setHasPromptedTimesUp(false);
      setLastCompletedSession(null);
      setCurrentSession(newSession);
      setStatus("running");

      return newSession;
    },
    [getQuestProgress, getQuestSteps, plannedMinutes, projects, quests]
  );

  const pauseFocusSession = React.useCallback(() => {
    if (status !== "running") return;

    if (activeSegmentStartRef.current !== null) {
      const segment = Math.floor((Date.now() - activeSegmentStartRef.current) / 1000);
      accumulatedElapsedRef.current += segment;
      setElapsedSeconds(accumulatedElapsedRef.current);
    }

    activeSegmentStartRef.current = null;
    const now = Date.now();
    pausedAtTimestampRef.current = now;

    setStatus("paused");
    setCurrentSession((prev) =>
      prev
        ? {
            ...prev,
            status: "paused",
            pausedAt: new Date(now).toISOString(),
            elapsedSeconds: accumulatedElapsedRef.current,
          }
        : null
    );
  }, [status]);

  const resumeFocusSession = React.useCallback(() => {
    if (status !== "paused") return;

    if (pausedAtTimestampRef.current !== null) {
      const pausedSegment = Math.floor((Date.now() - pausedAtTimestampRef.current) / 1000);
      totalPausedSecondsRef.current += pausedSegment;
      pausedAtTimestampRef.current = null;
    }

    activeSegmentStartRef.current = Date.now();
    setStatus("running");
    setCurrentSession((prev) =>
      prev
        ? {
            ...prev,
            status: "running",
            pausedAt: undefined,
            totalPausedSeconds: totalPausedSecondsRef.current,
          }
        : null
    );
  }, [status]);

  const endFocusSession = React.useCallback((): FocusSession | null => {
    if (!currentSession) return null;

    let finalElapsed = accumulatedElapsedRef.current;
    if (status === "running" && activeSegmentStartRef.current !== null) {
      finalElapsed += Math.floor((Date.now() - activeSegmentStartRef.current) / 1000);
    }

    const quest = quests.find((q) => q.id === currentSession.questId);
    const steps = getQuestSteps(currentSession.questId);
    const endingProgress = quest ? getQuestProgress(quest) : currentSession.startingProgress;
    const endingCompletedStepIds = steps
      .filter((s) => s.status === "completed")
      .map((s) => s.id);

    const startingSet = new Set(currentSession.startingCompletedStepIds || []);
    const newlyCompletedTitles = steps
      .filter((s) => endingCompletedStepIds.includes(s.id) && !startingSet.has(s.id))
      .map((s) => s.title);

    const completedSession: FocusSession = {
      ...currentSession,
      status: "completed",
      endedAt: new Date().toISOString(),
      elapsedSeconds: Math.max(0, finalElapsed),
      totalPausedSeconds: totalPausedSecondsRef.current,
      endingProgress,
      endingCompletedStepIds,
      completedStepTitles: newlyCompletedTitles,
    };

    // Store in history
    setFocusSessions((prev) => [completedSession, ...prev]);
    setLastCompletedSession(completedSession);
    setCurrentSession(null);
    setStatus("completed");
    setIsTimesUpPromptVisible(false);

    // Gamification rewards: focus session completed (min 5 min = 300s)
    if (completedSession.elapsedSeconds >= 300) {
      awardXp({
        type: "focus_session_completed",
        referenceId: completedSession.id,
        label: `Focus Session (${Math.floor(completedSession.elapsedSeconds / 60)}m)`,
      });
    }

    // Evaluate 25m focus achievement ("LOCKED IN")
    if (completedSession.elapsedSeconds >= 25 * 60) {
      evaluateAchievements({ hasLongFocusSession: true });
    }

    // Reset tracking refs
    activeSegmentStartRef.current = null;
    accumulatedElapsedRef.current = 0;
    pausedAtTimestampRef.current = null;
    totalPausedSecondsRef.current = 0;

    return completedSession;
  }, [currentSession, getQuestProgress, getQuestSteps, quests, status, awardXp, evaluateAchievements]);

  const resetFocusSession = React.useCallback(() => {
    setStatus("idle");
    setCurrentSession(null);
    setLastCompletedSession(null);
    setElapsedSeconds(0);
    setIsTimesUpPromptVisible(false);
    setHasPromptedTimesUp(false);
    activeSegmentStartRef.current = null;
    accumulatedElapsedRef.current = 0;
    pausedAtTimestampRef.current = null;
    totalPausedSecondsRef.current = 0;
  }, []);

  const continueOvertime = React.useCallback(() => {
    setIsTimesUpPromptVisible(false);
  }, []);

  const dismissTimesUpPrompt = React.useCallback(() => {
    setIsTimesUpPromptVisible(false);
  }, []);

  const resolveActiveSessionRecovery = React.useCallback(
    (action: "resume" | "end") => {
      if (!activeSessionRecoveryInfo) return;
      setActiveSessionRecoveryInfo(null);
      if (action === "resume") {
        resumeFocusSession();
      } else {
        endFocusSession();
      }
    },
    [activeSessionRecoveryInfo, resumeFocusSession, endFocusSession]
  );

  const contextValue = React.useMemo<FocusContextValue>(
    () => ({
      focusSessions,
      currentSession,
      lastCompletedSession,
      status,
      plannedMinutes,
      elapsedSeconds,
      remainingSeconds,
      overtimeSeconds,
      isOvertime,
      isTimesUpPromptVisible,
      activeSessionRecoveryInfo,
      startFocusSession,
      pauseFocusSession,
      resumeFocusSession,
      endFocusSession,
      resetFocusSession,
      continueOvertime,
      dismissTimesUpPrompt,
      setPlannedMinutes,
      resolveActiveSessionRecovery,
    }),
    [
      focusSessions,
      currentSession,
      lastCompletedSession,
      status,
      plannedMinutes,
      elapsedSeconds,
      remainingSeconds,
      overtimeSeconds,
      isOvertime,
      isTimesUpPromptVisible,
      activeSessionRecoveryInfo,
      startFocusSession,
      pauseFocusSession,
      resumeFocusSession,
      endFocusSession,
      resetFocusSession,
      continueOvertime,
      dismissTimesUpPrompt,
      resolveActiveSessionRecovery,
    ]
  );

  return <FocusContext.Provider value={contextValue}>{children}</FocusContext.Provider>;
}

export function useFocusContext(): FocusContextValue {
  const context = React.useContext(FocusContext);
  if (!context) {
    throw new Error("useFocusContext must be used within a FocusProvider");
  }
  return context;
}
