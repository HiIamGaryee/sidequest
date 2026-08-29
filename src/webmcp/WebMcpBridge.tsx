import * as React from "react";
import { useQuestContext } from "@/stores/QuestContext";
import { useFocusContext } from "@/stores/FocusContext";
import { useSideQuestContext } from "@/stores/SideQuestContext";
import { useContextKeeperContext } from "@/stores/ContextKeeperContext";
import { useRecoveryContext } from "@/stores/RecoveryContext";
import { useGamificationContext } from "@/stores/GamificationContext";
import { useDailyContext } from "@/stores/DailyContext";
import { useBossContext } from "@/stores/BossContext";
import { useChallengeContext } from "@/stores/ChallengeContext";
import { useSkillContext } from "@/stores/SkillContext";
import type { StoresRef } from "./stores-bridge";
import { registerWebMcpTools } from "./register-tools";
import { setActiveStoresRef } from "./webmcp-utils";
import { AgentActionToast } from "@/components/webmcp/AgentActionToast";

interface WebMcpBridgeProps {
  children: React.ReactNode;
}

export function WebMcpBridge({ children }: WebMcpBridgeProps) {
  const quests = useQuestContext();
  const focus = useFocusContext();
  const sideQuests = useSideQuestContext();
  const contextKeeper = useContextKeeperContext();
  const recovery = useRecoveryContext();
  const gamification = useGamificationContext();
  const daily = useDailyContext();
  const boss = useBossContext();
  const challenge = useChallengeContext();
  const skills = useSkillContext();

  // Keep a stable ref of all active stores so WebMCP tool execution closures
  // always query the live store state without needing re-registration on every timer tick.
  const storesRef = React.useRef<StoresRef>({
    quests,
    focus,
    sideQuests,
    contextKeeper,
    recovery,
    gamification,
    daily,
    boss,
    challenge,
    skills,
  });

  // Always update ref on render
  storesRef.current = {
    quests,
    focus,
    sideQuests,
    contextKeeper,
    recovery,
    gamification,
    daily,
    boss,
    challenge,
    skills,
  };

  React.useEffect(() => {
    setActiveStoresRef(() => storesRef.current);
  });

  // Perform one-time registration of WebMCP tools on mount
  React.useEffect(() => {
    registerWebMcpTools(() => storesRef.current);
  }, []);

  return (
    <>
      {children}
      <AgentActionToast />
    </>
  );
}

