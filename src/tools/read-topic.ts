import type { DiscourseClient } from "../client.js";
import type { PluginApi, CommunityConfig } from "../config.js";
import { toolResult, toolError, errorMessage } from "../types.js";
import { positiveInt, optionalPositiveInt } from "../validate.js";

export function registerReadTopic(
  api: PluginApi,
  client: DiscourseClient,
  _cfg: CommunityConfig,
) {
  api.registerTool({
    name: "community_read_topic",
    description:
      "按 ID 读取帖子详情，返回标题、分类、标签、所有楼层内容。",
    parameters: {
      type: "object" as const,
      properties: {
        topic_id: { type: "number", description: "帖子 ID" },
        post_limit: {
          type: "number",
          description: "返回最多几个楼层（默认 20）",
        },
      },
      required: ["topic_id"],
    },
    async execute(_id: string, params: Record<string, unknown>) {
      try {
        const topicId = positiveInt(params.topic_id, "topic_id");
        const limit =
          optionalPositiveInt(params.post_limit, "post_limit") ?? 20;

        const data = await client.get<Record<string, unknown>>(
          `/t/${topicId}.json`,
        );

        const postStream = data.post_stream as
          | { posts?: Array<Record<string, unknown>> }
          | undefined;
        const posts = (postStream?.posts ?? []).slice(0, limit);

        return toolResult({
          id: data.id,
          title: data.title,
          category_id: data.category_id,
          tags: data.tags,
          created_at: data.created_at,
          views: data.views,
          posts_count: data.posts_count,
          url: `${client.siteUrl}/t/${data.slug}/${data.id}`,
          posts: posts.map((p) => ({
            id: p.id,
            username: p.username,
            created_at: p.created_at,
            raw: p.raw,
            post_number: p.post_number,
          })),
        });
      } catch (err) {
        return toolError(errorMessage(err));
      }
    },
  });
}
