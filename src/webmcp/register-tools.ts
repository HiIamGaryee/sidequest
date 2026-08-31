import type { WebMcpToolDefinition } from "@/types/webmcp.d";
import type { StoresRef } from "./stores-bridge";
import { createWebMcpTools } from "./tool-definitions";
import { getModelContext, TOOL_METADATA_MAP } from "./webmcp-utils";

let isRegisteredGlobal = false;
let registeredToolsGlobal: WebMcpToolDefinition<any, any>[] = [];

/**
 * Registers all application WebMCP tools with the browser's model context
 * (`document.modelContext`, falling back to the legacy `navigator.modelContext`).
 * Guaranteed to run idempotently without duplicate registrations in React Strict Mode.
 * Tool functions query getStores() dynamically so they always read the latest store state
 * without requiring re-registration when timers or counts update.
 */
export function registerWebMcpTools(getStores: () => StoresRef): {
  isSupported: boolean;
  isRegistered: boolean;
  registeredCount: number;
  tools: WebMcpToolDefinition<any, any>[];
} {
  const tools = createWebMcpTools(getStores);
  registeredToolsGlobal = tools;

  if (import.meta.env.DEV) {
    const uncategorized = tools.filter((t) => !TOOL_METADATA_MAP[t.name]).map((t) => t.name);
    if (uncategorized.length > 0) {
      console.warn(
        "[WebMCP] Tools missing from TOOL_METADATA_MAP (they will default to WORK/read):",
        uncategorized
      );
    }
  }

  const modelContext = getModelContext();

  if (!modelContext) {
    if (import.meta.env.DEV && !isRegisteredGlobal) {
      console.info(
        "[WebMCP] Neither document.modelContext nor navigator.modelContext is present in this browser. WebMCP agent tools will remain in fallback mode. The app continues working normally."
      );
    }
    return {
      isSupported: false,
      isRegistered: false,
      registeredCount: tools.length,
      tools,
    };
  }

  // If already registered in this document lifecycle, avoid duplicate registration errors
  if (isRegisteredGlobal) {
    return {
      isSupported: true,
      isRegistered: true,
      registeredCount: tools.length,
      tools,
    };
  }

  try {
    let count = 0;
    for (const tool of tools) {
      try {
        modelContext.registerTool(tool);
        count++;
      } catch (err: unknown) {
        if (import.meta.env.DEV) {
          console.warn(`[WebMCP] Failed to register tool "${tool.name}":`, err);
        }
      }
    }

    isRegisteredGlobal = true;

    if (import.meta.env.DEV) {
      console.log(`[WebMCP] Successfully registered ${count} tools:`, tools.map((t) => t.name));
    }

    return {
      isSupported: true,
      isRegistered: true,
      registeredCount: count,
      tools,
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("[WebMCP] Error during tool registration batch:", err);
    }
    return {
      isSupported: true,
      isRegistered: false,
      registeredCount: 0,
      tools,
    };
  }
}

export function getRegisteredTools(): WebMcpToolDefinition<any, any>[] {
  return registeredToolsGlobal;
}

export function isGlobalWebMcpRegistered(): boolean {
  return isRegisteredGlobal;
}

/**
 * The number of tools SIDEQUEST exposes. Derived from the registry itself so
 * every count shown in the UI and the docs stays in step with the code.
 */
export function getToolCount(): number {
  return registeredToolsGlobal.length;
}
