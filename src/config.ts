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

export function resolveConfig(raw: Record<string, unknown> | undefined): CommunityConfig {
  const data = raw || {};
  const siteUrl = String(data.siteUrl || data.site_url || DEFAULT_SITE_URL).replace(/\/+$/, "");

  return {
    siteUrl,
    apiKey: data.apiKey ? String(data.apiKey) : (data.api_key ? String(data.api_key) : undefined),
    apiUsername: data.apiUsername ? String(data.apiUsername) : (data.api_username ? String(data.api_username) : "system"),
    authMode: (data.authMode === "admin" || data.auth_mode === "admin") ? "admin" : "user",
    defaultCategory: data.defaultCategory ? String(data.defaultCategory) : (data.default_category ? String(data.default_category) : undefined),
    allowWrites: Boolean(data.allowWrites ?? data.allow_writes ?? false),
    signature: data.signature ? String(data.signature) : "",
    requestTimeoutMs: Number(data.requestTimeoutMs ?? data.request_timeout_ms ?? 15000),
  };
}
