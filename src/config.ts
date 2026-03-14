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

function pick(
  raw: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = raw[k];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return undefined;
}

function envStr(...names: string[]): string | undefined {
  for (const n of names) {
    const v = typeof process !== "undefined" ? process.env[n] : undefined;
    if (v) return v;
  }
  return undefined;
}

export function resolveConfig(
  raw?: Record<string, unknown> | null,
): CommunityConfig {
  const r: Record<string, unknown> = raw && typeof raw === "object" ? raw : {};

  const siteUrl = (
    pick(r, "siteUrl", "site_url", "siteurl") ??
    envStr("DISCOURSE_SITE_URL", "SITE_URL") ??
    DEFAULT_SITE_URL
  ).replace(/\/+$/, "");

  const apiKey =
    pick(r, "apiKey", "api_key", "apikey") ??
    envStr("DISCOURSE_API_KEY", "API_KEY");

  const apiUsername =
    pick(r, "apiUsername", "api_username") ??
    envStr("DISCOURSE_API_USERNAME") ??
    "system";

  const authModeRaw =
    pick(r, "authMode", "auth_mode") ?? envStr("DISCOURSE_AUTH_MODE");
  const authMode: "user" | "admin" = authModeRaw === "admin" ? "admin" : "user";

  const defaultCategory =
    pick(r, "defaultCategory", "default_category") ?? undefined;

  const allowWritesRaw = pick(r, "allowWrites", "allow_writes");
  const allowWrites =
    allowWritesRaw !== undefined
      ? allowWritesRaw === "true" || allowWritesRaw === "1"
      : !!apiKey;

  const signature = pick(r, "signature") ?? "";

  const timeoutRaw = pick(r, "requestTimeoutMs", "request_timeout_ms");
  const requestTimeoutMs = timeoutRaw ? Number(timeoutRaw) : 15000;

  return {
    siteUrl,
    apiKey,
    apiUsername,
    authMode,
    defaultCategory,
    allowWrites,
    signature,
    requestTimeoutMs,
  };
}
