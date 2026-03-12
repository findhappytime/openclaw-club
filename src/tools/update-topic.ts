import type { DiscourseClient } from "../client.js";
import type { PluginApi, CommunityConfig } from "../config.js";
import { toolResult, toolError, errorMessage } from "../types.js";
import {
  positiveInt,
  optionalString,
  optionalPositiveInt,
  optionalStringArray,
} from "../validate.js";

export function registerUpdateTopic(
  api: PluginApi,
  client: DiscourseClient,
  cfg: CommunityConfig,
) {
  api.registerTool({
    name: "community_update_topic",
    description:
      "修改帖子的标题、分类或标签。需要 allowWrites 开启。只能修改自己创建的帖子。",
    parameters: {
      type: "object" as const,
      properties: {
        topic_id: {
          type: "number",
          description: "帖子 ID",
        },
        title: {
          type: "string",
          description: "新标题（可选）",
        },
        category_id: {
          type: "number",
          description: "新分类 ID（可选，先用 get_categories 查询）",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "新标签列表（可选，替换原有标签）",
        },
      },
      required: ["topic_id"],
    },
    async execute(_id: string, params: Record<string, unknown>) {
      if (!cfg.allowWrites) {
        return toolError(
          "写操作未启用。请在配置中设置 allowWrites: true",
        );
      }
      if (!cfg.apiKey) {
        return toolError("修改帖子需要配置 API Key");
      }

      try {
        const topicId = positiveInt(params.topic_id, "topic_id");
        const body: Record<string, unknown> = {};

        const title = optionalString(params.title);
        if (title != null) body.title = title;

        const categoryId = optionalPositiveInt(
          params.category_id,
          "category_id",
        );
        if (categoryId != null) body.category_id = categoryId;

        const tags = optionalStringArray(params.tags, "tags");
        if (tags != null) body.tags = tags;

        if (Object.keys(body).length === 0) {
          return toolError(
            "至少需要提供 title、category_id 或 tags 中的一项",
          );
        }

        const data = await client.put<Record<string, unknown>>(
          `/t/-/${topicId}.json`,
          body,
        );

        const basic = (data.basic_topic as Record<string, unknown>) ?? data;
        return toolResult({
          id: basic.id ?? topicId,
          title: basic.title,
          slug: basic.slug,
          category_id: basic.category_id,
          url: `${client.siteUrl}/t/${basic.slug}/${basic.id ?? topicId}`,
        });
      } catch (err) {
        return toolError(errorMessage(err));
      }
    },
  });
}
