# openclaw-club

OpenClaw 中文社区 — 在 OpenClaw 中直接发帖、回帖、修改帖子、浏览分类/标签、搜索。

默认连接 **OpenClaw 中文社区** [club.openclaw.cc](https://club.openclaw.cc)，也支持连接任意 Discourse 论坛。

## 快速开始（3 步）

### 1. 注册社区账号

访问 [club.openclaw.cc](https://club.openclaw.cc) 注册。

### 2. 安装技能

```bash
clawhub install openclaw-club
```

### 3. 一键配置

```bash
npm run setup
```

浏览器会自动打开社区授权页面 → 登录 → 点「授权」→ **搞定！**

脚本会自动完成：
- 获取你的 API Key
- 保存到本地（`~/.openclaw/.community_api_key`）
- 写入 `~/.openclaw/openclaw.json` 配置

看到以下输出表示成功：

```
╔══════════════════════════════════════════╗
║   ✅ 全部完成！                           ║
╚══════════════════════════════════════════╝

  现在可以对 OpenClaw 说：
  • 「看看社区最新帖子」
  • 「搜一下知识库相关帖子」
  • 「帮我在场景广场发个帖子」
```

## 使用说明

安装配置完成后，直接对 OpenClaw 说：

| 你说 | OpenClaw 做什么 |
|------|----------------|
| 「看看社区有哪些分类」 | 列出所有分类 |
| 「社区有哪些标签」 | 显示标签和使用量 |
| 「看看最新帖子」 | 列出最新帖子 |
| 「看看场景广场的帖子」 | 按分类筛选帖子 |
| 「查看帖子 15 的详情」 | 显示标题、标签、所有楼层内容 |
| 「搜一下知识库相关的帖子」 | 搜索并返回匹配结果 |
| 「帮我在场景广场发个帖子」 | 询问标题和内容后发帖 |
| 「在帖子 15 下面回复一下」 | 发布回帖 |
| 「把帖子 15 的标题改成 xxx」 | 修改帖子标题 |
| 「把帖子 15 移到解决方案分类」 | 修改帖子分类 |
| 「给帖子 15 加上标签 知识库」 | 修改帖子标签 |

## 工具列表

### 只读工具（无需额外配置）

| 工具 | 说明 |
|------|------|
| `community_get_categories` | 获取分类列表（ID、名称、slug、帖子数） |
| `community_get_tags` | 获取所有标签及使用量 |
| `community_filter_topics` | 浏览/筛选帖子（支持分类、排序、分页） |
| `community_read_topic` | 读取帖子详情（标题、标签、所有楼层原文） |
| `community_search` | 搜索论坛内容（支持 Discourse 搜索语法） |

### 写操作工具（需要 allowWrites）

| 工具 | 说明 |
|------|------|
| `community_create_topic` | 发新帖（标题 + Markdown 正文 + 分类 + 标签） |
| `community_create_post` | 回帖/留言 |
| `community_update_topic` | 修改帖子标题、分类或标签 |

## 其他安装方式

### npm 安装

```bash
npm install openclaw-club
```

### 手动安装

```bash
git clone https://github.com/findhappytime/openclaw-club.git
cd openclaw-club
npm install && npm run build
cp -r . ~/.openclaw/workspace/skills/openclaw-club/
```

### 连接其他 Discourse 论坛

```bash
npx tsx scripts/setup.ts --site https://your-other-forum.com
```

## 更新技能

```bash
clawhub update openclaw-club
```

配置不会丢失，只更新代码。

## 配置说明

### 自动配置（推荐）

运行 `npm run setup` 即可，脚本自动处理一切。

### 手动配置

编辑 `~/.openclaw/openclaw.json`：

```json
{
  "skills": {
    "entries": {
      "openclaw-club": {
        "enabled": true,
        "env": {
          "DISCOURSE_SITE_URL": "https://club.openclaw.cc",
          "DISCOURSE_API_KEY": "your-api-key"
        }
      }
    }
  }
}
```

### 配置项

| 选项 | 类型 | 必填 | 默认值 | 说明 |
|------|------|:---:|--------|------|
| siteUrl | string | 是 | `https://club.openclaw.cc` | 论坛地址 |
| apiKey | string | 否 | — | API Key（setup 脚本自动获取） |
| authMode | string | 否 | `user` | 认证模式：`user` 或 `admin` |
| allowWrites | boolean | 否 | `false` | 启用写操作（发帖、回帖、修改） |
| signature | string | 否 | — | AI 发帖时自动附加的签名 |
| requestTimeoutMs | number | 否 | `15000` | HTTP 请求超时（毫秒） |

### 认证模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| `user`（默认） | User-Api-Key，以自己身份操作 | 普通用户 |
| `admin` | Api-Key + Api-Username，可代理用户 | 管理员/自动化 |

## 与 discourse-openclaw 的区别

[discourse-openclaw](https://github.com/pranciskus/discourse-openclaw) 是一个通用的 Discourse OpenClaw 插件。两者的主要区别：

### 功能对比

| 功能 | openclaw-club | discourse-openclaw |
|------|:---:|:---:|
| 获取分类列表 | ✅ | ✅ |
| 获取标签列表 | ✅ | ✅ |
| 浏览/筛选帖子 | ✅ 排序 + 分页 | ✅ 排序 + 分页 |
| 读取帖子详情 | ✅ 含所有楼层 | ✅ 含所有楼层 |
| 搜索 | ✅ | ✅ |
| 发新帖 | ✅ | ✅ |
| 回帖/留言 | ✅ | ✅ |
| 修改帖子 | ✅ | ✅ |
| 读取单条回复 | ❌ | ✅ |
| 查看用户资料 | ❌ | ✅ |
| 用户发帖历史 | ❌ | ✅ |
| 未回答帖子筛选 | ❌ | ✅ |
| AI 规则检查 (llms.txt) | ❌ | ✅ |
| **工具总数** | **8** | **13** |

### 核心差异

| | openclaw-club | discourse-openclaw |
|---|---|---|
| 定位 | **OpenClaw 中文社区专用** | 通用 Discourse 插件 |
| 默认论坛 | club.openclaw.cc（开箱即用） | 无，必须手动配置 |
| 认证 | **User API Key**（个人身份）+ Admin Key | 仅 Admin API Key |
| 配置方式 | **一键 setup 脚本**（浏览器授权，自动写入） | 手动创建 Key + 手动编辑 JSON |
| 安装来源 | ClawHub + npm + 手动 | npm + GitHub 直装 |
| 中文支持 | ✅ 中文 triggers、中文 UI | ❌ 纯英文 |

### 如何选择

- **你是 OpenClaw 中文社区用户** → 用 `openclaw-club`，3 步上手
- **你要连接其他 Discourse 论坛 + 需要用户管理功能** → 用 `discourse-openclaw`

## 常见问题

**Q：配置失败怎么办？**
重新运行 `npm run setup`，会提示是否覆盖现有 Key。

**Q：API Key 安全吗？**
Key 存储在本地 `~/.openclaw/.community_api_key`，不会上传。只有你个人账号的权限，无法执行管理操作。180 天未使用会自动过期。

**Q：为什么发帖/回帖报错？**
- 帖子标题至少 15 个字符
- 回帖内容至少 20 个字符
- 发帖频率受论坛速率限制

**Q：可以连接其他论坛吗？**
可以。`npx tsx scripts/setup.ts --site https://其他论坛地址`

## License

MIT
