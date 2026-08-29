import type { AgentActivity, AgentActionNotification } from "@/types/webmcp";
import { agentHighlightStore, type HighlightTarget } from "./agent-highlight-store";
import { demoScenarioTracker } from "./scenario-tracker";

type ActivityListener = (activities: AgentActivity[]) => void;
type NotificationListener = (notification: AgentActionNotification | null) => void;

class AgentActivityManager {
  private activities: AgentActivity[] = [];
  private listeners: Set<ActivityListener> = new Set();
  private notificationListeners: Set<NotificationListener> = new Set();
  private currentNotification: AgentActionNotification | null = null;
  private notificationTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("sidequest:demo-reset", () => {
        this.clearActivities();
      });
    }
  }

  public recordActivity(activity: Omit<AgentActivity, "id" | "timestamp">): AgentActivity {
    const fullActivity: AgentActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...activity,
    };

    // Keep up to 20 recent activities in memory (runtime-only timeline)
    this.activities = [fullActivity, ...this.activities.slice(0, 19)];
    this.notifyListeners();

    // Trigger Demo Scenario Tracker
    demoScenarioTracker.recordToolExecution(fullActivity.toolName);

    // Trigger visual state change highlight for mutations
    if (activity.actionType === "mutation" && activity.status === "success") {
      let target: HighlightTarget | null = null;

      if (
        [
          "set_main_quest",
          "update_quest_progress",
          "complete_quest_step",
          "add_quest_step",
          "make_next_action_smaller",
          "set_quest_blocker",
          "clear_quest_blocker",
          "resume_work_context",
          "save_work_context",
        ].includes(activity.toolName)
      ) {
        target = "main-quest";
      } else if (["park_side_quest", "promote_side_quest"].includes(activity.toolName)) {
        target = "parking-lot";
      } else if (
        [
          "start_focus_session",
          "pause_focus_session",
          "resume_focus_session",
          "end_focus_session",
        ].includes(activity.toolName)
      ) {
        target = "focus-timer";
      } else if (["log_recovery"].includes(activity.toolName)) {
        target = "recovery-center";
      }

      if (target) {
        agentHighlightStore.triggerHighlight(target, activity.summary);
      }
    }

    // Trigger visual notification toast for agent actions
    this.triggerNotification({
      id: fullActivity.id,
      title:
        activity.status === "error"
          ? "AGENT ERROR"
          : activity.actionType === "mutation"
          ? "AGENT STATE CHANGE"
          : "AGENT TOOL EXECUTED",
      summary: activity.summary,
      toolName: activity.toolName,
      category: activity.category,
      actionType: activity.actionType,
      durationMs: activity.durationMs,
      timestamp: Date.now(),
      status: activity.status,
    });

    return fullActivity;
  }

  public getActivities(filter: "all" | "reads" | "changes" | "errors" = "all"): AgentActivity[] {
    switch (filter) {
      case "reads":
        return this.activities.filter((a) => a.actionType === "read" && a.status === "success");
      case "changes":
        return this.activities.filter((a) => a.actionType === "mutation" && a.status === "success");
      case "errors":
        return this.activities.filter((a) => a.status === "error");
      case "all":
      default:
        return [...this.activities];
    }
  }

  public getLatestActivity(): AgentActivity | undefined {
    return this.activities[0];
  }

  public clearActivities(): void {
    this.activities = [];
    this.notifyListeners();
  }

  public subscribe(listener: ActivityListener): () => void {
    this.listeners.add(listener);
    listener(this.getActivities());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeNotification(listener: NotificationListener): () => void {
    this.notificationListeners.add(listener);
    listener(this.currentNotification);
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  public dismissNotification(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }
    this.currentNotification = null;
    this.notifyNotificationListeners();
  }

  private triggerNotification(notification: AgentActionNotification): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.currentNotification = notification;
    this.notifyNotificationListeners();

    this.notificationTimeout = setTimeout(() => {
      this.currentNotification = null;
      this.notifyNotificationListeners();
      this.notificationTimeout = null;
    }, 4000);
  }

  private notifyListeners(): void {
    const list = this.getActivities();
    this.listeners.forEach((l) => l(list));
  }

  private notifyNotificationListeners(): void {
    this.notificationListeners.forEach((l) => l(this.currentNotification));
  }
}

export const agentActivityManager = new AgentActivityManager();
