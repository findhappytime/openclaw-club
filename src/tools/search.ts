import type { DiscourseClient } from "../client.js";
import type { PluginApi, CommunityConfig } from "../config.js";
import { toolResult, toolError, errorMessage } from "../types.js";
import { nonEmptyString } from "../validate.js";

export function registerSearch(
  api: PluginApi,
  client: DiscourseClient,
  _cfg: CommunityConfig,
) {
  api.registerTool({
    name: "community_search",
    description:
      "搜索论坛内容，返回匹配的帖子和回复。支持 Discourse 搜索语法（如 #category、@user、tag:xxx）。",
    parameters: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "搜索关键词或 Discourse 搜索表达式",
        },
      },
      required: ["query"],
    },
    async execute(_id: string, params: Record<string, unknown>) {
      try {
        const query = nonEmptyString(params.query, "query");
        const data = await client.get<Record<string, unknown>>(
          `/search.json?q=${encodeURIComponent(query)}`,
        );

        const topics = (
          (data.topics as Array<Record<string, unknown>>) ?? []
        )
          .slice(0, 10)
          .map((t) => ({
            id: t.id,
            title: t.title,
            slug: t.slug,
            url: `${client.siteUrl}/t/${t.slug}/${t.id}`,
          }));

        const posts = (
          (data.posts as Array<Record<string, unknown>>) ?? []
        )
          .slice(0, 5)
          .map((p) => ({
            topic_id: p.topic_id,
            post_number: p.post_number,
            username: p.username,
            blurb: p.blurb ? String(p.blurb).slice(0, 150) : undefined,
          }));

        return toolResult({ query, topics, posts });
      } catch (err) {
        return toolError(errorMessage(err));
      }
    },
  });
}
