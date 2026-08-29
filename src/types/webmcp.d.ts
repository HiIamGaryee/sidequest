/// <reference types="vite/client" />

// WebMCP TypeScript Global Declarations for document.modelContext

export interface WebMcpToolAnnotations {
  readOnlyHint?: boolean;
  [key: string]: unknown;
}

export interface WebMcpToolInputSchema {
  type: "object";
  properties?: Record<string, {
    type: string;
    description?: string;
    enum?: string[];
    minimum?: number;
    maximum?: number;
    default?: unknown;
    items?: Record<string, unknown>;
    [key: string]: unknown;
  }>;
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
}

export interface WebMcpToolDefinition<TInput = Record<string, unknown>, TOutput = unknown> {
  name: string;
  title?: string;
  description: string;
  inputSchema?: WebMcpToolInputSchema;
  annotations?: WebMcpToolAnnotations;
  execute: (input: TInput) => Promise<TOutput> | TOutput;
}

export interface ModelContext {
  registerTool: (tool: WebMcpToolDefinition<any, any>) => void | Promise<void>;
  unregisterTool?: (name: string) => void | Promise<void>;
  getTools?: () => WebMcpToolDefinition<any, any>[] | Promise<WebMcpToolDefinition<any, any>[]>;
  [key: string]: unknown;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

export {};
