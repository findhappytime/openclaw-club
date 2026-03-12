# Changelog

## 0.0.1 (2026-03-12)

首个版本。

### 功能

- `community_get_categories` — 获取分类列表
- `community_get_tags` — 获取标签列表
- `community_filter_topics` — 浏览/筛选帖子（排序、分页）
- `community_read_topic` — 读取帖子详情（所有楼层）
- `community_search` — 搜索论坛内容
- `community_create_topic` — 发新帖
- `community_create_post` — 回帖/留言
- `community_update_topic` — 修改帖子标题/分类/标签

### 特性

- 默认连接 club.openclaw.cc
- 支持 User API Key / Admin API Key 双认证
- 一键 setup 脚本自动获取 Key 并写入配置
- 写操作安全开关 allowWrites
- AI 签名、中文 triggers
- 三种安装方式（clawhub / npm / 手动）
