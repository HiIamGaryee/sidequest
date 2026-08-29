import * as React from "react";
import type { AgentActivity, WebMcpStatus } from "@/types/webmcp";
import { isWebMcpSupported } from "@/webmcp/webmcp-utils";
import { agentActivityManager } from "@/webmcp/agent-activity-store";
import { getRegisteredTools, isGlobalWebMcpRegistered } from "@/webmcp/register-tools";

export function useWebMcp() {
  const [isSupported] = React.useState<boolean>(() => isWebMcpSupported());
  const [isRegistered, setIsRegistered] = React.useState<boolean>(() => isGlobalWebMcpRegistered());
  const [activities, setActivities] = React.useState<AgentActivity[]>(() =>
    agentActivityManager.getActivities()
  );

  React.useEffect(() => {
    const unsub = agentActivityManager.subscribe((newActivities) => {
      setActivities(newActivities);
    });
    setIsRegistered(isGlobalWebMcpRegistered());
    return unsub;
  }, []);

  const registeredTools = getRegisteredTools();

  const status: WebMcpStatus = {
    isSupported,
    isRegistered,
    registeredCount: registeredTools.length,
    lastAction: activities[0],
  };

  const clearActivities = React.useCallback(() => {
    agentActivityManager.clearActivities();
  }, []);

  return {
    isSupported,
    isRegistered,
    status,
    registeredTools,
    registeredCount: registeredTools.length,
    agentActivities: activities,
    lastActivity: activities[0],
    clearActivities,
  };
}
