import type { PluginApi } from "./config.js";
import { resolveConfig } from "./config.js";
import { DiscourseClient } from "./client.js";
import { registerGetCategories } from "./tools/get-categories.js";
import { registerGetTags } from "./tools/get-tags.js";
import { registerFilterTopics } from "./tools/filter-topics.js";
import { registerReadTopic } from "./tools/read-topic.js";
import { registerSearch } from "./tools/search.js";
import { registerCreateTopic } from "./tools/create-topic.js";
import { registerCreatePost } from "./tools/create-post.js";
import { registerUpdateTopic } from "./tools/update-topic.js";

export default function register(
  api: PluginApi,
  rawConfig: Record<string, unknown>,
) {
  const cfg = resolveConfig(rawConfig);
  const client = new DiscourseClient(cfg);

  registerGetCategories(api, client, cfg);
  registerGetTags(api, client, cfg);
  registerFilterTopics(api, client, cfg);
  registerReadTopic(api, client, cfg);
  registerSearch(api, client, cfg);

  if (cfg.allowWrites && cfg.apiKey) {
    registerCreateTopic(api, client, cfg);
    registerCreatePost(api, client, cfg);
    registerUpdateTopic(api, client, cfg);
  }
}

export { resolveConfig } from "./config.js";
export { DiscourseClient } from "./client.js";
