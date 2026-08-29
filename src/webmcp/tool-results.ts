import type { ToolResult, ToolResultSuccess, ToolResultError } from "@/types/webmcp";

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

export function formatToolOutput(result: ToolResult): string {
  try {
    return JSON.stringify(result, null, 2);
  } catch {
    return JSON.stringify(result);
  }
}
