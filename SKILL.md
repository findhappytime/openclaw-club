---
name: openclaw-community
version: 0.0.1
author: openclaw-cn
description: OpenClaw 中文社区（club.openclaw.cc）— 发帖、回帖、修改帖子、浏览分类/标签、搜索
tags:
  - discourse
  - forum
  - community
  - 论坛
  - 社区
---

# OpenClaw 中文社区

连接 [OpenClaw 中文社区](https://club.openclaw.cc) 或任意 Discourse 论坛，提供 8 个 agent 工具：浏览分类、查看标签、筛选帖子、读帖子详情、搜索、发帖、回帖、修改帖子。

## 工具列表

### 只读工具（无需 allowWrites）

- **community_get_categories** — 获取论坛分类列表（ID、名称、slug、帖子数）
- **community_get_tags** — 获取所有标签及使用量
- **community_filter_topics** — 浏览帖子列表，支持按分类筛选、排序（views/created/activity/likes）、分页
- **community_read_topic** — 按 ID 读取帖子详情，返回标题、标签、所有楼层原文
- **community_search** — 搜索论坛内容，支持 Discourse 搜索语法（#category、@user、tag:xxx）

### 写操作工具（需要 allowWrites: true + API Key）

- **community_create_topic** — 发新帖（标题 + Markdown 正文 + 分类 + 标签）
- **community_create_post** — 回帖/留言（帖子 ID + 内容）
- **community_update_topic** — 修改帖子标题、分类或标签

## 使用流程

### 用户想浏览社区

1. 调用 `community_get_categories` 获取分类列表
2. 调用 `community_filter_topics` 按分类或最新浏览
3. 调用 `community_read_topic` 查看感兴趣的帖子详情

### 用户想搜索

调用 `community_search`，query 参数支持关键词和 Discourse 高级搜索语法。

### 用户想发帖

1. 如果未指定分类，先调用 `community_get_categories` 让用户选择
2. 如果需要加标签，先调用 `community_get_tags` 查看可用标签
3. 调用 `community_create_topic` 发帖

### 用户想回帖

调用 `community_create_post`，提供帖子 ID 和回复内容。

### 用户想修改帖子

1. 先调用 `community_read_topic` 查看当前帖子信息
2. 调用 `community_update_topic` 修改标题/分类/标签

## 注意事项

- 发帖标题最少 15 个字符
- 回帖内容最少 20 个字符
- 只能修改自己创建的帖子
- 发帖频率受论坛速率限制约束
