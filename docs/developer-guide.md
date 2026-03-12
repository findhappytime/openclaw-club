# 开发者指南

openclaw-club 开发、发版、发布的完整流程。

## 开发环境

```bash
git clone https://github.com/findhappytime/openclaw-club.git
cd openclaw-club
npm install
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run build` | 编译 TypeScript → dist/ |
| `npm run dev` | 监视模式，修改即编译 |
| `npm run setup` | 运行 API Key 配置脚本 |
| `npm run sync-version` | 手动同步版本号到 skill.yaml / SKILL.md |

### 项目结构

```
openclaw-club/
├── SKILL.md                 # LLM 指令文件（ClawHub 入口）
├── skill.yaml               # ClawHub skill manifest
├── openclaw.plugin.json     # OpenClaw plugin manifest
├── package.json
├── tsconfig.json
├── CHANGELOG.md
├── scripts/
│   ├── setup.ts             # 用户一键配置脚本
│   └── sync-version.ts      # 版本号同步脚本
├── src/
│   ├── index.ts             # 入口，注册所有 tools
│   ├── client.ts            # Discourse HTTP 客户端
│   ├── config.ts            # 配置 schema & 类型定义
│   ├── types.ts             # toolResult / toolError 工具函数
│   ├── validate.ts          # 输入参数校验
│   └── tools/
│       ├── get-categories.ts
│       ├── get-tags.ts
│       ├── filter-topics.ts
│       ├── read-topic.ts
│       ├── search.ts
│       ├── create-topic.ts
│       ├── create-post.ts
│       └── update-topic.ts
├── dist/                    # 编译产物（git 忽略）
└── docs/
    └── developer-guide.md   # 本文档
```

### 版本号同步机制

版本号存在三个地方：

| 文件 | 字段 |
|------|------|
| `package.json` | `"version": "0.0.1"` |
| `skill.yaml` | `version: 0.0.1` |
| `SKILL.md` | `version: 0.0.1`（YAML frontmatter） |

`npm version` 只会更新 `package.json`。通过 `version` 钩子（commit 之前执行）自动调用 `scripts/sync-version.ts` 同步到另外两个文件，三个文件保持一致。**不需要手动改版本号。**

钩子执行顺序：

```
preversion  → npm run build（编译）
            → package.json 版本号 +1
version     → sync-version.ts（同步 skill.yaml / SKILL.md）+ git add
            → git commit + git tag
```

---

## 发版流程

### 第 1 步：改代码

正常开发，改完代码后确保编译通过：

```bash
npm run build
```

### 第 2 步：更新 CHANGELOG

编辑 `CHANGELOG.md`，添加新版本的变更记录：

```markdown
## 0.0.2 (2026-xx-xx)

### 新增
- xxx

### 修复
- xxx
```

### 第 3 步：升版本号

根据变更类型选择：

```bash
npm version patch    # 0.0.1 → 0.0.2  （bug 修复、小改动）
npm version minor    # 0.0.1 → 0.1.0  （新功能）
npm version major    # 0.0.1 → 1.0.0  （不兼容的大改动）
```

这一条命令自动完成 4 件事（通过 `preversion` + `version` 钩子）：

1. **编译** TypeScript（`preversion` → `npm run build`）
2. **改版本号** — `package.json` version 字段 +1
3. **同步版本号** — `version` 钩子自动把新版本号写入 `skill.yaml` 和 `SKILL.md`
4. **git commit + tag** — 自动提交所有变更并打 tag（如 `v0.0.2`）

### 第 4 步：推送到 GitHub

```bash
git push && git push --tags
```

### 第 5 步：发布

#### 发布到 ClawHub

```bash
clawhub publish
```

用户就可以通过 `clawhub update openclaw-club` 更新。

#### 发布到 npm

首次发布需要先登录：

```bash
npm login
```

然后发布：

```bash
npm publish
```

用户就可以通过 `npm update openclaw-club` 更新。

#### 创建 GitHub Release（可选）

在 GitHub 仓库页面 → Releases → Draft a new release：
- Tag: 选择刚才推送的 tag（如 `v0.0.2`）
- Title: `v0.0.2`
- Description: 从 CHANGELOG.md 复制

---

## 发版速查表

```bash
# 完整流程（一套连招）
npm run build                     # 编译
# 编辑 CHANGELOG.md
npm version patch                 # 升版本（自动 commit + tag）
git push && git push --tags       # 推送到 GitHub
clawhub publish                   # 发布到 ClawHub
npm publish                       # 发布到 npm
```

---

## 用户更新流程

用户端非常简单：

### ClawHub 安装的用户

```bash
clawhub update openclaw-club        # 更新单个技能
clawhub update --all                 # 更新所有技能
```

### npm 安装的用户

```bash
npm update openclaw-club
```

### 手动安装的用户

```bash
cd ~/.openclaw/workspace/skills/openclaw-club
git pull
npm install && npm run build
```

### 更新后

- 配置文件 `~/.openclaw/openclaw.json` **不受影响**
- API Key `~/.openclaw/.community_api_key` **不受影响**
- 用户无需重新配置，直接使用新功能

---

## 添加新工具

如果要添加一个新的 tool（比如 `community_read_post`）：

### 1. 创建工具文件

```bash
touch src/tools/read-post.ts
```

参考现有工具（如 `src/tools/read-topic.ts`）的模式：
- 导出 `registerXxx(api, client, cfg)` 函数
- 用 `api.registerTool()` 注册
- 用 `toolResult()` / `toolError()` 返回结果

### 2. 在 index.ts 中注册

```typescript
import { registerReadPost } from "./tools/read-post.js";
// ...
registerReadPost(api, client, cfg);
```

### 3. 更新 SKILL.md

在工具列表中添加新工具的描述。

### 4. 发版

按上面的发版流程走。
