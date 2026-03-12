import type { DiscourseClient } from "../client.js";
import type { PluginApi, CommunityConfig } from "../config.js";
import { toolResult, toolError, errorMessage } from "../types.js";

export function registerGetCategories(
  api: PluginApi,
  client: DiscourseClient,
  _cfg: CommunityConfig,
) {
  api.registerTool({
    name: "community_get_categories",
    description:
      "获取 Discourse 论坛的分类列表。返回分类名称、slug、ID、帖子数和描述。",
    parameters: {
      type: "object" as const,
      properties: {},
    },
    async execute() {
      try {
        const data = await client.get<Record<string, unknown>>(
          "/categories.json",
        );
        const catList = data.category_list as
          | { categories?: Array<Record<string, unknown>> }
          | undefined;
        const categories = (catList?.categories ?? [])
          .filter((c) => !c.read_restricted)
          .map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            topic_count: c.topic_count,
            description: c.description_text
              ? String(c.description_text).slice(0, 100)
              : undefined,
          }));
        return toolResult(categories);
      } catch (err) {
        return toolError(errorMessage(err));
      }
    },
  });
}
