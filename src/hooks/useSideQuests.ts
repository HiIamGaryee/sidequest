import * as React from "react";
import { useSideQuestContext } from "@/stores/SideQuestContext";
import { useQuests } from "@/hooks/useQuests";
import type {
  SideQuest,
  CaptureSideQuestInput,
  UpdateSideQuestInput,
} from "@/types/side-quest";
import type { Quest } from "@/types/quest";

export function useSideQuests() {
  const sideQuestContext = useSideQuestContext();
  const { createQuest } = useQuests();

  const promote = React.useCallback(
    (sideQuestId: string, projectId: string, priority?: "low" | "medium" | "high"): Quest => {
      return sideQuestContext.promoteSideQuest(
        { sideQuestId, projectId, priority },
        createQuest
      );
    },
    [sideQuestContext, createQuest]
  );

  return {
    ...sideQuestContext,
    promote,
    parkedSideQuests: sideQuestContext.getParkedSideQuests(),
    parkedCount: sideQuestContext.getParkedSideQuests().length,
  };
}
