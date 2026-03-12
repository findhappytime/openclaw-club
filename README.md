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

### 开始使用

对 OpenClaw 说：

- 「看看社区最新帖子」
- 「搜一下知识库相关的帖子」
- 「查看帖子 15 的详情」
- 「帮我在场景广场发个帖子」
- 「在帖子 15 下面回复一下」
- 「把帖子 15 的标题改成 xxx」

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

## 工具列表

| 工具 | 说明 | 需要写权限 |
|------|------|:---:|
| `community_get_categories` | 获取分类列表 | |
| `community_get_tags` | 获取标签列表 | |
| `community_filter_topics` | 浏览/筛选帖子（排序、分页） | |
| `community_read_topic` | 读取帖子详情（所有楼层） | |
| `community_search` | 搜索论坛内容 | |
| `community_create_topic` | 发新帖 | ✅ |
| `community_create_post` | 回帖/留言 | ✅ |
| `community_update_topic` | 修改帖子标题/分类/标签 | ✅ |

## 认证模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| `user` (默认) | User-Api-Key，以自己身份操作 | 普通用户 |
| `admin` | Api-Key + Api-Username | 管理员/自动化 |

## 高级配置

如需手动编辑配置，修改 `~/.openclaw/openclaw.json`：

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

## 开发

```bash
npm install          # 安装依赖
npm run build        # 编译 TypeScript
npm run dev          # 监视模式编译
```

## License

MIT
