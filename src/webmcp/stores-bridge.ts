import type { QuestContextValue } from "@/stores/QuestContext";
import type { FocusContextValue } from "@/stores/FocusContext";
import type { SideQuestContextValue } from "@/stores/SideQuestContext";
import type { ContextKeeperContextValue } from "@/stores/ContextKeeperContext";
import type { RecoveryContextValue } from "@/stores/RecoveryContext";
import type { GamificationContextValue } from "@/stores/GamificationContext";
import type { DailyContextValue } from "@/stores/DailyContext";
import type { BossContextValue } from "@/stores/BossContext";
import type { ChallengeContextValue } from "@/stores/ChallengeContext";
import type { SkillContextValue } from "@/stores/SkillContext";

export interface StoresRef {
  quests: QuestContextValue;
  focus: FocusContextValue;
  sideQuests: SideQuestContextValue;
  contextKeeper: ContextKeeperContextValue;
  recovery: RecoveryContextValue;
  gamification: GamificationContextValue;
  daily: DailyContextValue;
  boss: BossContextValue;
  challenge: ChallengeContextValue;
  skills: SkillContextValue;
}

