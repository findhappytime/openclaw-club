export interface CommunityConfig {
  siteUrl: string;
  apiKey?: string;
  apiUsername?: string;
  authMode: "user" | "admin";
  defaultCategory?: string;
  allowWrites: boolean;
  signature: string;
  requestTimeoutMs: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  execute: (id: string, params: Record<string, unknown>) => Promise<ToolResult>;
}

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export interface PluginApi {
  registerTool(tool: ToolDefinition): void;
}

const DEFAULT_SITE_URL = "https://club.openclaw.cc";

export function resolveConfig(raw: Record<string, unknown>): CommunityConfig {
  const siteUrl = String(raw.siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");

  return {
    siteUrl,
    apiKey: raw.apiKey ? String(raw.apiKey) : undefined,
    apiUsername: raw.apiUsername ? String(raw.apiUsername) : "system",
    authMode: raw.authMode === "admin" ? "admin" : "user",
    defaultCategory: raw.defaultCategory ? String(raw.defaultCategory) : undefined,
    allowWrites: Boolean(raw.allowWrites ?? false),
    signature: raw.signature ? String(raw.signature) : "",
    requestTimeoutMs: Number(raw.requestTimeoutMs ?? 15000),
  };
}
