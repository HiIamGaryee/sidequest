import * as React from "react";
import type {
  SideQuest,
  CaptureSideQuestInput,
  UpdateSideQuestInput,
  PromoteSideQuestInput,
} from "@/types/side-quest";
import type { Quest, CreateQuestInput } from "@/types/quest";
import { getParkedSideQuests as filterParkedSideQuests } from "@/lib/side-quest-utils";
import { useGamificationContext } from "./GamificationContext";
import { usePersistence } from "./PersistenceContext";

export interface SideQuestContextValue {
  sideQuests: SideQuest[];
  captureSideQuest: (input: CaptureSideQuestInput) => SideQuest;
  updateSideQuest: (id: string, updates: UpdateSideQuestInput) => void;
  dismissSideQuest: (id: string) => void;
  deleteSideQuest: (id: string) => void;
  promoteSideQuest: (
    input: PromoteSideQuestInput,
    createQuestFn: (input: CreateQuestInput) => Quest
  ) => Quest;
  restoreSideQuest: (id: string) => void;
  getParkedSideQuests: () => SideQuest[];
  getSideQuestsBySource: (questId: string) => SideQuest[];
}

const SideQuestContext = React.createContext<SideQuestContextValue | null>(null);

export function SideQuestProvider({ children }: { children: React.ReactNode }) {
  const { awardXp, incrementCombo, evaluateAchievements } = useGamificationContext();
  const { initialState, saveSnapshot, isHydrated } = usePersistence();

  const [sideQuests, setSideQuests] = React.useState<SideQuest[]>(() => initialState.sideQuests);

  // Sync state if initialState changes
  React.useEffect(() => {
    if (isHydrated) {
      setSideQuests(initialState.sideQuests);
    }
  }, [initialState, isHydrated]);

  // Persist whenever side quests change
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isHydrated) {
      saveSnapshot({ sideQuests });
    }
  }, [sideQuests, isHydrated, saveSnapshot]);

  React.useEffect(() => {
    evaluateAchievements({
      parkedSideQuestsCount: sideQuests.length,
    });
  }, [sideQuests, evaluateAchievements]);

  const captureSideQuest = React.useCallback(
    (input: CaptureSideQuestInput): SideQuest => {
      const newSideQuest: SideQuest = {
        id: `sq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: input.title.trim(),
        status: "parked",
        createdAt: new Date().toISOString(),
        sourceQuestId: input.sourceQuestId,
      };

      setSideQuests((prev) => [newSideQuest, ...prev]);

      awardXp({
        type: "side_quest_parked",
        referenceId: newSideQuest.id,
        label: `Parked: ${newSideQuest.title.length > 25 ? newSideQuest.title.slice(0, 25) + '...' : newSideQuest.title}`,
      });
      incrementCombo("side_quest_parked");

      return newSideQuest;
    },
    [awardXp, incrementCombo]
  );

  const updateSideQuest = React.useCallback(
    (id: string, updates: UpdateSideQuestInput) => {
      setSideQuests((prev) =>
        prev.map((sq) => {
          if (sq.id !== id) return sq;
          return {
            ...sq,
            title: updates.title !== undefined ? updates.title.trim() : sq.title,
            status: updates.status !== undefined ? updates.status : sq.status,
            sourceQuestId:
              updates.sourceQuestId !== undefined ? updates.sourceQuestId : sq.sourceQuestId,
            promotedQuestId:
              updates.promotedQuestId !== undefined
                ? updates.promotedQuestId
                : sq.promotedQuestId,
          };
        })
      );
    },
    []
  );

  const dismissSideQuest = React.useCallback((id: string) => {
    setSideQuests((prev) =>
      prev.map((sq) => {
        if (sq.id !== id) return sq;
        return {
          ...sq,
          status: "dismissed",
          dismissedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const deleteSideQuest = React.useCallback((id: string) => {
    setSideQuests((prev) => prev.filter((sq) => sq.id !== id));
  }, []);

  const restoreSideQuest = React.useCallback((id: string) => {
    setSideQuests((prev) =>
      prev.map((sq) => {
        if (sq.id !== id) return sq;
        return {
          ...sq,
          status: "parked",
          dismissedAt: undefined,
        };
      })
    );
  }, []);

  const promoteSideQuest = React.useCallback(
    (
      input: PromoteSideQuestInput,
      createQuestFn: (input: CreateQuestInput) => Quest
    ): Quest => {
      const targetSideQuest = sideQuests.find((sq) => sq.id === input.sideQuestId);
      if (!targetSideQuest) {
        throw new Error(`Side quest ${input.sideQuestId} not found for promotion.`);
      }

      // Create full quest in target project
      const createdQuest = createQuestFn({
        projectId: input.projectId,
        title: targetSideQuest.title,
        priority: input.priority || "medium",
        description: `Promoted from parked side quest captured on ${new Date(
          targetSideQuest.createdAt
        ).toLocaleDateString()}`,
      });

      // Update side quest status to promoted
      setSideQuests((prev) =>
        prev.map((sq) => {
          if (sq.id !== input.sideQuestId) return sq;
          return {
            ...sq,
            status: "promoted",
            promotedQuestId: createdQuest.id,
          };
        })
      );

      // Award promotion XP
      awardXp({
        type: "side_quest_parked",
        referenceId: createdQuest.id,
        label: `Promoted: ${createdQuest.title}`,
      });

      return createdQuest;
    },
    [sideQuests, awardXp]
  );

  const getParkedSideQuests = React.useCallback((): SideQuest[] => {
    return filterParkedSideQuests(sideQuests);
  }, [sideQuests]);

  const getSideQuestsBySource = React.useCallback(
    (questId: string): SideQuest[] => {
      return sideQuests.filter((sq) => sq.sourceQuestId === questId);
    },
    [sideQuests]
  );

  const value = React.useMemo<SideQuestContextValue>(
    () => ({
      sideQuests,
      captureSideQuest,
      updateSideQuest,
      dismissSideQuest,
      deleteSideQuest,
      promoteSideQuest,
      restoreSideQuest,
      getParkedSideQuests,
      getSideQuestsBySource,
    }),
    [
      sideQuests,
      captureSideQuest,
      updateSideQuest,
      dismissSideQuest,
      deleteSideQuest,
      promoteSideQuest,
      restoreSideQuest,
      getParkedSideQuests,
      getSideQuestsBySource,
    ]
  );

  return <SideQuestContext.Provider value={value}>{children}</SideQuestContext.Provider>;
}

export function useSideQuestContext(): SideQuestContextValue {
  const context = React.useContext(SideQuestContext);
  if (!context) {
    throw new Error("useSideQuestContext must be used within a SideQuestProvider");
  }
  return context;
}
