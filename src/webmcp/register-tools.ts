import type { WebMcpToolDefinition } from "@/types/webmcp.d";
import type { StoresRef } from "./stores-bridge";
import { createWebMcpTools } from "./tool-definitions";
import { isWebMcpSupported } from "./webmcp-utils";

let isRegisteredGlobal = false;
let registeredToolsGlobal: WebMcpToolDefinition<any, any>[] = [];

/**
 * Registers all application WebMCP tools with document.modelContext.
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

  if (!isWebMcpSupported()) {
    if (import.meta.env.DEV && !isRegisteredGlobal) {
      console.info(
        "[WebMCP] document.modelContext is not present in this browser. WebMCP agent tools will remain in fallback mode. The app continues working normally."
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
        document.modelContext?.registerTool(tool);
        count++;
      } catch (err: unknown) {
        if (import.meta.env.DEV) {
          console.warn(`[WebMCP] Failed to register tool "${tool.name}":`, err);
        }
      }
    }

    isRegisteredGlobal = true;

    if (import.meta.env.DEV) {
      console.log(`[WebMCP] Successfully registered ${count} tools with document.modelContext:`, tools.map((t) => t.name));
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
