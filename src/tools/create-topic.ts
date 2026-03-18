import type { DiscourseClient } from "../client.js";
import type { PluginApi, CommunityConfig } from "../config.js";
import { toolResult, toolError, errorMessage } from "../types.js";
import { nonEmptyString, optionalString, optionalStringArray } from "../validate.js";

export function registerCreateTopic(
  api: PluginApi,
  client: DiscourseClient,
  cfg: CommunityConfig,
) {
  api.registerTool({
    name: "community_create_topic",
    description:
      "在论坛发新帖。需要 allowWrites 开启。" +
      "参数包括标题、正文（Markdown）、分类 slug 和可选标签。",
    parameters: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description: "帖子标题（至少 15 个字符）",
        },
        raw: {
          type: "string",
          description: "帖子正文（Markdown 格式）",
        },
        category_slug: {
          type: "string",
          description: "分类 slug 或名称",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "标签列表（可选）",
        },
      },
      required: ["title", "raw", "category_slug"],
    },
    async execute(_id: string, params: Record<string, unknown>) {
      if (!cfg.allowWrites) {
        return toolError(
          "写操作未启用。请在配置中设置 allowWrites: true",
        );
      }
      if (!cfg.apiKey) {
        return toolError("发帖需要配置 API Key");
      }

      try {
        const titleInput = nonEmptyString(params.title, "title");
        let raw = nonEmptyString(params.raw, "raw");
        const catSlug = nonEmptyString(params.category_slug, "category_slug");
        const tags = optionalStringArray(params.tags, "tags");

        // 自动补全标题长度（Discourse 通常要求至少 15 字符）
        const title = titleInput.length < 15 
          ? titleInput.padEnd(15, " ") 
          : titleInput;

        if (cfg.signature) {
          raw += `\n\n---\n${cfg.signature}`;
        }

        const cats = await client.get<Record<string, unknown>>(
          "/categories.json",
        );
        const catList = (
          cats.category_list as { categories?: Array<Record<string, unknown>> }
        )?.categories ?? [];
        const category = catList.find(
          (c) => c.slug === catSlug || c.name === catSlug,
        );

        if (!category) {
          const available = catList
            .filter((c) => !c.read_restricted)
            .map((c) => c.slug)
            .join(", ");
          return toolError(
            `未知分类 "${catSlug}"。可用分类：${available}`,
          );
        }

        const data = await client.createPost({
          title,
          content: raw,
          categoryId: category.id as number,
          tags: tags ?? undefined,
        });

        const topicSlug = data.topic_slug ?? "topic";
        const topicId = data.topic_id;
        return toolResult({
          topic_id: topicId,
          post_id: data.id,
          url: `${client.siteUrl}/t/${topicSlug}/${topicId}`,
        });
      } catch (err) {
        const msg = errorMessage(err);
        if (
          msg.includes("类别 不能为空") ||
          msg.includes("category") ||
          /category|分类|类别/i.test(msg)
        ) {
          return toolError(
            "该论坛不支持在发帖时指定分类，请尝试发到「综合」版块后手动移动",
          );
        }
        return toolError(msg);
      }
    },
  });
}
