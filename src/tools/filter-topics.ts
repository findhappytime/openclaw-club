import type { DiscourseClient } from "../client.js";
import type { PluginApi, CommunityConfig } from "../config.js";
import { toolResult, toolError, errorMessage } from "../types.js";
import {
  optionalString,
  optionalOrder,
  optionalNonNegativeInt,
  optionalPositiveInt,
} from "../validate.js";

export function registerFilterTopics(
  api: PluginApi,
  client: DiscourseClient,
  _cfg: CommunityConfig,
) {
  api.registerTool({
    name: "community_filter_topics",
    description:
      "浏览帖子列表，可按分类筛选、排序和分页。",
    parameters: {
      type: "object" as const,
      properties: {
        category_slug: {
          type: "string",
          description: "分类 slug 或名称（可选，不填则查看全部最新帖子）",
        },
        order: {
          type: "string",
          description:
            "排序方式：latest, created, activity, views, posts, likes（默认 latest）",
        },
        max_results: {
          type: "number",
          description: "返回最大条数（默认 20）",
        },
        page: {
          type: "number",
          description: "分页页码（默认 0）",
        },
      },
    },
    async execute(_id: string, params: Record<string, unknown>) {
      try {
        const cat = optionalString(params.category_slug);
        const order = optionalOrder(params.order);
        const page = optionalNonNegativeInt(params.page, "page") ?? 0;
        const maxResults =
          optionalPositiveInt(params.max_results, "max_results") ?? 20;

        const path = cat
          ? `/c/${encodeURIComponent(cat)}.json?order=${order}&page=${page}`
          : `/latest.json?order=${order}&page=${page}`;

        const data = await client.get<Record<string, unknown>>(path);
        const topicList = data.topic_list as
          | { topics?: Array<Record<string, unknown>> }
          | undefined;

        const topics = (topicList?.topics ?? [])
          .slice(0, maxResults)
          .map((t) => ({
            id: t.id,
            title: t.title,
            slug: t.slug,
            category_id: t.category_id,
            tags: t.tags,
            created_at: t.created_at,
            posts_count: t.posts_count,
            views: t.views,
            url: `${client.siteUrl}/t/${t.slug}/${t.id}`,
          }));

        return toolResult(topics);
      } catch (err) {
        return toolError(errorMessage(err));
      }
    },
  });
}
