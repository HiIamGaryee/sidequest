import type { ToolResult, ToolResultSuccess, ToolResultError } from "@/types/webmcp";
import type { WebMcpToolResponse } from "@/types/webmcp.d";

export function toolSuccess<T>(data: T, message?: string): ToolResultSuccess<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
}

export function toolError(code: string, message: string, details?: unknown): ToolResultError {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
}

/**
 * Wraps a structured ToolResult in the WebMCP response envelope that
 * `execute` must resolve to: `{ content: [{ type: "text", text }] }`.
 */
export function formatToolOutput(result: ToolResult): WebMcpToolResponse {
  let text: string;
  try {
    text = JSON.stringify(result, null, 2);
  } catch {
    text = JSON.stringify(toolError("SERIALIZATION_ERROR", "Tool result could not be serialized."));
  }

  return {
    content: [{ type: "text", text }],
    ...(result.success === false ? { isError: true } : {}),
  };
}

/**
 * Reverses `formatToolOutput` for in-app inspectors and the Judge Mode test
 * runner. Accepts the WebMCP envelope, a bare JSON string, or an already
 * decoded ToolResult, so UI code never has to know which shape it received.
 */
export function readToolOutput(response: unknown): ToolResult {
  if (typeof response === "string") {
    try {
      return JSON.parse(response) as ToolResult;
    } catch {
      return toolError("MALFORMED_TOOL_OUTPUT", "Tool returned a non-JSON string.", response);
    }
  }

  if (response && typeof response === "object") {
    const envelope = response as Partial<WebMcpToolResponse>;
    const text = envelope.content?.[0]?.text;
    if (typeof text === "string") {
      return readToolOutput(text);
    }
    if ("success" in (response as Record<string, unknown>)) {
      return response as ToolResult;
    }
  }

  return toolError("MALFORMED_TOOL_OUTPUT", "Tool returned an unrecognized response shape.", response);
}
