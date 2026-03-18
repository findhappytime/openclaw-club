import type { CommunityConfig } from "./config.js";

export class DiscourseClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeoutMs: number;

  constructor(cfg: CommunityConfig) {
    this.baseUrl = cfg.siteUrl;
    this.timeoutMs = cfg.requestTimeoutMs;
    this.headers = {
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
    if (body) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(body)) {
        if (v === undefined || v === null) continue;
        if (Array.isArray(v)) {
          for (const item of v) params.append(k, String(item));
        } else {
          params.append(k, String(v));
        }
      }
      // 使用 URLSearchParams 实例，fetch 会自动设置 application/x-www-form-urlencoded
      opts.body = params;
    }

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

  /**
   * 创建新主题（含首帖）：仅 POST /t.json，body 带 category_id。
   * 若接口只返回 topic_id、未带首帖 id，再 POST /posts.json，仅 { topic_id, raw }（绝不带 category）。
   */
  async createPost(input: {
    title: string;
    content: string;
    category?: number;
    categoryId?: number;
    tags?: string[];
  }): Promise<Record<string, unknown>> {
    const categoryId = input.category ?? input.categoryId;
    const raw = input.content;

    if (categoryId == null) {
      throw new Error("创建主题需要分类 ID（category）");
    }

    const topicPayload: Record<string, unknown> = {
      title: input.title,
      raw,
      category: categoryId,
      category_id: categoryId,
    };
    if (input.tags?.length) topicPayload.tags = input.tags;

    const topicResponse = await this.post<Record<string, unknown>>(
      "/t.json",
      topicPayload,
    );
    const tid = topicResponse.topic_id as number | undefined;
    const postId = topicResponse.id as number | undefined;

    if (tid != null && postId != null) {
      return topicResponse;
    }
    if (tid != null) {
      const postResponse = await this.post<Record<string, unknown>>(
        "/posts.json",
        { topic_id: tid, raw },
      );
      return {
        ...postResponse,
        topic_id: tid,
        topic_slug: topicResponse.topic_slug,
      };
    }

    throw new Error("POST /t.json 未返回有效的 topic_id");
  }
}
