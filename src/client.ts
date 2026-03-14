import type { CommunityConfig } from "./config.js";

export class DiscourseClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeoutMs: number;

  constructor(cfg: CommunityConfig) {
    this.baseUrl = cfg.siteUrl;
    this.timeoutMs = cfg.requestTimeoutMs;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    };

    if (cfg.apiKey) {
      if (cfg.authMode === "admin") {
        this.headers["Api-Key"] = cfg.apiKey;
        this.headers["Api-Username"] = cfg.apiUsername ?? "system";
      } else {
        this.headers["User-Api-Key"] = cfg.apiKey;
      }
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const opts: RequestInit = {
      method,
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeoutMs),
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const hint =
        res.status === 403 && text.includes("CSRF")
          ? " — API Key 可能缺失或无效，请检查配置"
          : "";
      throw new Error(
        `${method} ${path} → ${res.status}${hint} ${text.slice(0, 200)}`,
      );
    }
    return res.json() as Promise<T>;
  }

  async get<T = Record<string, unknown>>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T = Record<string, unknown>>(
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async put<T = Record<string, unknown>>(
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  get siteUrl(): string {
    return this.baseUrl;
  }
}
