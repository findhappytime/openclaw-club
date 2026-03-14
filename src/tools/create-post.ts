import type { DiscourseClient } from "../client.js";
import type { PluginApi, CommunityConfig } from "../config.js";
import { toolResult, toolError, errorMessage } from "../types.js";
import { nonEmptyString, positiveInt } from "../validate.js";

export function registerCreatePost(
  api: PluginApi,
  client: DiscourseClient,
  cfg: CommunityConfig,
) {
  api.registerTool({
    name: "community_create_post",
    description:
      "在已有帖子下回帖/留言。需要 allowWrites 开启。",
    parameters: {
      type: "object" as const,
      properties: {
        topic_id: {
          type: "number",
          description: "帖子 ID",
        },
        raw: {
          type: "string",
          description: "回复内容（Markdown 格式，至少 20 个字符）",
        },
      },
      required: ["topic_id", "raw"],
    },
    async execute(_id: string, params: Record<string, unknown>) {
      if (!cfg.allowWrites) {
        return toolError(
          "写操作未启用。请在配置中设置 allowWrites: true",
        );
      }
      if (!cfg.apiKey) {
        return toolError("回帖需要配置 API Key");
      }

      try {
        const topicId = positiveInt(params.topic_id, "topic_id");
        const rawInput = nonEmptyString(params.raw, "raw");

        // 自动补全回复内容长度（Discourse 通常要求至少 20 字符）
        let raw = rawInput.length < 20 
          ? rawInput.padEnd(20, " ") 
          : rawInput;

        if (cfg.signature) {
          raw += `\n\n---\n${cfg.signature}`;
        }

        const data = await client.post<Record<string, unknown>>(
          "/posts.json",
          { topic_id: topicId, raw },
        );

        return toolResult({
          post_id: data.id,
          post_number: data.post_number,
          topic_id: topicId,
          url: `${client.siteUrl}/t/-/${topicId}/${data.post_number}`,
        });
      } catch (err) {
        return toolError(errorMessage(err));
      }
    },
  });
}
