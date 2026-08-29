import * as React from "react";
import type { WorkContext, SaveWorkContextInput } from "@/types/work-context";
import type { Quest } from "@/types/quest";
import {
  getLatestQuestContext as findLatestQuestContext,
  getLatestResumableContext as findLatestResumable,
  isDuplicateContext,
} from "@/lib/context-utils";
import { usePersistence } from "./PersistenceContext";

export interface ContextKeeperContextValue {
  workContexts: WorkContext[];
  saveWorkContext: (input: SaveWorkContextInput) => WorkContext | null;
  getLatestContext: (questId?: string) => WorkContext | undefined;
  getLatestResumable: (
    activeQuests: Quest[],
    activeMainQuestId: string | null
  ) => WorkContext | undefined;
  getQuestContexts: (questId: string) => WorkContext[];
  deleteWorkContext: (id: string) => void;
  cleanContextsForQuest: (questId: string) => void;
  cleanContextsForQuests: (questIds: string[]) => void;
}

const ContextKeeperContext = React.createContext<ContextKeeperContextValue | null>(null);

export function ContextKeeperProvider({ children }: { children: React.ReactNode }) {
  const { initialState, saveSnapshot, isHydrated } = usePersistence();
  const [workContexts, setWorkContexts] = React.useState<WorkContext[]>(
    () => initialState.workContexts
  );

  // Sync state if initialState changes
  React.useEffect(() => {
    if (isHydrated) {
      setWorkContexts(initialState.workContexts);
    }
  }, [initialState, isHydrated]);

  // Persist whenever work contexts change
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isHydrated) {
      saveSnapshot({ workContexts });
    }
  }, [workContexts, isHydrated, saveSnapshot]);

  const saveWorkContext = React.useCallback(
    (input: SaveWorkContextInput): WorkContext | null => {
      if (!input.questId) return null;

      // Find the last context for this quest to check for duplicates
      const lastContext = workContexts.find((c) => c.questId === input.questId);
      if (isDuplicateContext(lastContext, input) && lastContext) {
        return lastContext;
      }

      const newContext: WorkContext = {
        id: `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        questId: input.questId,
        savedAt: new Date().toISOString(),
        reason: input.reason || "manual",
        note: input.note?.trim() || undefined,
        currentStepId: input.currentStepId,
        nextAction: input.nextAction?.trim() || undefined,
        blocker: input.blocker?.trim() || undefined,
        progress:
          input.progress !== undefined
            ? Math.max(0, Math.min(100, Math.round(input.progress)))
            : 0,
      };

      setWorkContexts((prev) => [newContext, ...prev]);
      return newContext;
    },
    [workContexts]
  );

  const getLatestContext = React.useCallback(
    (questId?: string): WorkContext | undefined => {
      if (questId) {
        return findLatestQuestContext(workContexts, questId);
      }
      if (workContexts.length === 0) return undefined;
      return [...workContexts].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      )[0];
    },
    [workContexts]
  );

  const getLatestResumable = React.useCallback(
    (
      activeQuests: Quest[],
      activeMainQuestId: string | null
    ): WorkContext | undefined => {
      return findLatestResumable(workContexts, activeQuests, activeMainQuestId);
    },
    [workContexts]
  );

  const getQuestContexts = React.useCallback(
    (questId: string): WorkContext[] => {
      return workContexts
        .filter((c) => c.questId === questId)
        .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    },
    [workContexts]
  );

  const deleteWorkContext = React.useCallback((id: string) => {
    setWorkContexts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const cleanContextsForQuest = React.useCallback((questId: string) => {
    setWorkContexts((prev) => prev.filter((c) => c.questId !== questId));
  }, []);

  const cleanContextsForQuests = React.useCallback((questIds: string[]) => {
    const idSet = new Set(questIds);
    setWorkContexts((prev) => prev.filter((c) => !idSet.has(c.questId)));
  }, []);

  const value = React.useMemo<ContextKeeperContextValue>(
    () => ({
      workContexts,
      saveWorkContext,
      getLatestContext,
      getLatestResumable,
      getQuestContexts,
      deleteWorkContext,
      cleanContextsForQuest,
      cleanContextsForQuests,
    }),
    [
      workContexts,
      saveWorkContext,
      getLatestContext,
      getLatestResumable,
      getQuestContexts,
      deleteWorkContext,
      cleanContextsForQuest,
      cleanContextsForQuests,
    ]
  );

  return (
    <ContextKeeperContext.Provider value={value}>
      {children}
    </ContextKeeperContext.Provider>
  );
}

export function useContextKeeperContext(): ContextKeeperContextValue {
  const context = React.useContext(ContextKeeperContext);
  if (!context) {
    throw new Error("useContextKeeperContext must be used within a ContextKeeperProvider");
  }
  return context;
}
