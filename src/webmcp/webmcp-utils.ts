import type { WebMcpToolDefinition } from "@/types/webmcp.d";
import type {
  ToolCategory,
  ActionType,
  StateSnapshot,
  DemoReadinessReport,
} from "@/types/webmcp";
import { agentActivityManager } from "./agent-activity-store";
import { toolError, formatToolOutput } from "./tool-results";
import type { StoresRef } from "./stores-bridge";

export const TOOL_METADATA_MAP: Record<string, { category: ToolCategory; actionType: ActionType }> = {
  get_current_work_state: { category: "WORK", actionType: "read" },
  list_projects: { category: "WORK", actionType: "read" },
  list_quests: { category: "WORK", actionType: "read" },
  get_quest: { category: "WORK", actionType: "read" },
  create_quest: { category: "WORK", actionType: "mutation" },
  set_main_quest: { category: "WORK", actionType: "mutation" },
  update_quest_progress: { category: "WORK", actionType: "mutation" },
  complete_quest_step: { category: "WORK", actionType: "mutation" },
  add_quest_step: { category: "WORK", actionType: "mutation" },
  make_next_action_smaller: { category: "WORK", actionType: "mutation" },
  set_quest_blocker: { category: "WORK", actionType: "mutation" },
  clear_quest_blocker: { category: "WORK", actionType: "mutation" },

  start_focus_session: { category: "FOCUS", actionType: "mutation" },
  get_focus_state: { category: "FOCUS", actionType: "read" },
  pause_focus_session: { category: "FOCUS", actionType: "mutation" },
  resume_focus_session: { category: "FOCUS", actionType: "mutation" },
  end_focus_session: { category: "FOCUS", actionType: "mutation" },

  save_work_context: { category: "CONTEXT", actionType: "mutation" },
  get_resumable_context: { category: "CONTEXT", actionType: "read" },
  resume_work_context: { category: "CONTEXT", actionType: "mutation" },

  park_side_quest: { category: "SIDE QUEST", actionType: "mutation" },
  list_side_quests: { category: "SIDE QUEST", actionType: "read" },
  promote_side_quest: { category: "SIDE QUEST", actionType: "mutation" },

  get_recovery_state: { category: "RECOVERY", actionType: "read" },
  suggest_recovery: { category: "RECOVERY", actionType: "read" },
  log_recovery: { category: "RECOVERY", actionType: "mutation" },

  get_player_state: { category: "PLAYER", actionType: "read" },
  get_session_summary: { category: "PLAYER", actionType: "read" },
};

/**
 * Feature detection for standard WebMCP API.
 * Uses document.modelContext (NOT deprecated navigator.modelContext).
 */
export function isWebMcpSupported(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(
    document.modelContext &&
    typeof document.modelContext.registerTool === "function"
  );
}

let activeStoresRef: (() => StoresRef) | null = null;

export function setActiveStoresRef(getStores: () => StoresRef) {
  activeStoresRef = getStores;
}

function captureSnapshot(): StateSnapshot | undefined {
  if (!activeStoresRef) return undefined;
  try {
    const stores = activeStoresRef();
    const mainQuest = stores.quests.getMainQuest();
    const nextAction = mainQuest ? stores.quests.getQuestNextAction(mainQuest) : undefined;
    const progress = mainQuest ? stores.quests.getQuestProgress(mainQuest) : 0;
    const focusStatus = stores.focus.status;
    const parkedSideQuestCount = stores.sideQuests.getParkedSideQuests().length;

    return {
      mainQuestTitle: mainQuest?.title,
      nextAction,
      progress,
      focusStatus,
      parkedSideQuestCount,
    };
  } catch {
    return undefined;
  }
}

/**
 * Safely wraps a tool's execute function to guarantee:
 * 1. Store actions run safely without crashing React
 * 2. Unhandled errors are caught and transformed into structured WebMCP errors
 * 3. Execution duration (ms) and before/after state diffs are captured
 * 4. Successful or failed actions are recorded in the runtime Agent Action Timeline
 * 5. Visual notifications and highlight pulses are dispatched
 */
export function createSafeExecute<TInput = Record<string, unknown>, TOutput = unknown>(
  toolName: string,
  summaryGenerator: (input: TInput, result?: any) => string,
  executeFn: (input: TInput) => Promise<TOutput> | TOutput,
  options?: {
    category?: ToolCategory;
    actionType?: ActionType;
  }
): (input: TInput) => Promise<string> {
  const meta = TOOL_METADATA_MAP[toolName] || { category: "WORK", actionType: "read" };
  const category = options?.category || meta.category;
  const actionType = options?.actionType || meta.actionType;

  return async (input: TInput): Promise<string> => {
    const startTime = performance.now();
    const beforeState = actionType === "mutation" ? captureSnapshot() : undefined;

    try {
      const result = await executeFn(input || ({} as TInput));
      const durationMs = Math.max(1, Math.round(performance.now() - startTime));
      const afterState = actionType === "mutation" ? captureSnapshot() : undefined;

      // If the execute function already returned a formatted ToolResult with success === false
      if (
        result &&
        typeof result === "object" &&
        "success" in result &&
        (result as Record<string, unknown>).success === false
      ) {
        const errorResult = result as unknown as { success: false; error: { code: string; message: string } };
        agentActivityManager.recordActivity({
          toolName,
          category,
          actionType,
          summary: errorResult.error?.message || `Failed to execute ${toolName}`,
          status: "error",
          durationMs,
          input: input as Record<string, unknown>,
          output: errorResult as unknown as Record<string, unknown>,
          beforeState,
          afterState,
          error: errorResult.error,
        });
        return formatToolOutput(errorResult as any);
      }

      // Generate a user-friendly activity summary
      let summary = "";
      try {
        summary = summaryGenerator(input, result);
      } catch {
        summary = `Executed ${toolName}`;
      }

      agentActivityManager.recordActivity({
        toolName,
        category,
        actionType,
        summary,
        status: "success",
        durationMs,
        input: input as Record<string, unknown>,
        output: typeof result === "object" ? (result as Record<string, unknown>) : { result },
        beforeState,
        afterState,
      });

      return formatToolOutput(result as any);
    } catch (err: unknown) {
      const durationMs = Math.max(1, Math.round(performance.now() - startTime));
      const errorMessage = err instanceof Error ? err.message : "An unexpected execution error occurred";
      const errorObj = toolError("TOOL_EXECUTION_ERROR", errorMessage);

      agentActivityManager.recordActivity({
        toolName,
        category,
        actionType,
        summary: `Error: ${errorMessage}`,
        status: "error",
        durationMs,
        input: input as Record<string, unknown>,
        beforeState,
        error: errorObj.error,
      });

      if (import.meta.env.DEV) {
        console.error(`[WebMCP] Error executing ${toolName}:`, err);
      }

      return formatToolOutput(errorObj);
    }
  };
}

/**
 * Inspect registered tools in the browser if supported.
 */
export async function getRegisteredWebMcpTools(): Promise<WebMcpToolDefinition<any, any>[]> {
  if (!isWebMcpSupported()) return [];
  try {
    if (typeof document.modelContext?.getTools === "function") {
      const tools = await document.modelContext.getTools();
      return Array.isArray(tools) ? tools : [];
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[WebMCP] Could not query getTools():", e);
    }
  }
  return [];
}

/**
 * Returns comprehensive readiness diagnosis for WebMCP Challenge Judge Demo.
 */
export function getDemoReadiness(stores: StoresRef, isJudgeModeActive: boolean): DemoReadinessReport {
  const isSupported = isWebMcpSupported();
  const mainQuest = stores.quests.getMainQuest();
  const resumable = stores.contextKeeper.getLatestContext(mainQuest?.id) || stores.contextKeeper.workContexts[0];

  return {
    isSupported,
    isRegistered: true,
    toolCount: 28,
    isDemoDataActive: isJudgeModeActive,
    hasMainQuest: Boolean(mainQuest),
    hasResumableContext: Boolean(resumable),
    isFullyReady: Boolean(mainQuest && isJudgeModeActive),
  };
}
