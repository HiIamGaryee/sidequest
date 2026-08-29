import { useQuestContext } from "@/stores/QuestContext";

export function useQuests() {
  return useQuestContext();
}
