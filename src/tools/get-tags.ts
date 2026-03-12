import type { DiscourseClient } from "../client.js";
import type { PluginApi, CommunityConfig } from "../config.js";
import { toolResult, toolError, errorMessage } from "../types.js";

export function registerGetTags(
  api: PluginApi,
  client: DiscourseClient,
  _cfg: CommunityConfig,
) {
  api.registerTool({
    name: "community_get_tags",
    description: "获取论坛所有标签及使用量。",
    parameters: {
      type: "object" as const,
      properties: {},
    },
    async execute() {
      try {
        const data = await client.get<Record<string, unknown>>(
          "/tags.json",
        );
        const tags = (
          (data.tags as Array<Record<string, unknown>>) ?? []
        )
          .sort(
            (a, b) =>
              (Number(b.count) || 0) - (Number(a.count) || 0),
          )
          .map((t) => ({
            name: t.name,
            count: t.count,
          }));
        return toolResult(tags);
      } catch (err) {
        return toolError(errorMessage(err));
      }
    },
  });
}
