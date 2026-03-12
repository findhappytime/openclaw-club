#!/usr/bin/env npx tsx
/**
 * 一键配置 OpenClaw 中文社区
 *
 * 用法:
 *   npx tsx scripts/setup.ts                          # 默认连接 club.openclaw.cc
 *   npx tsx scripts/setup.ts --site https://other.com # 自定义论坛
 *
 * 自动完成:
 * 1. 浏览器授权获取 User API Key
 * 2. 写入 openclaw.json 配置（siteUrl + apiKey + allowWrites）
 */

import * as crypto from "node:crypto";
import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import { execSync } from "node:child_process";

const DEFAULT_SITE = "https://club.openclaw.cc";
const APP_NAME = "OpenClaw 中文社区";
const SCOPES = "read,write";
const PORT = 4200;
const OPENCLAW_DIR = path.join(process.env.HOME ?? "~", ".openclaw");
const OPENCLAW_JSON = path.join(OPENCLAW_DIR, "openclaw.json");
const KEY_FILE = path.join(OPENCLAW_DIR, ".community_api_key");

function parseArgs(): { siteUrl: string } {
  const args = process.argv.slice(2);
  let siteUrl = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--site" && args[i + 1]) {
      siteUrl = args[i + 1].replace(/\/+$/, "");
      i++;
    }
  }

  return { siteUrl: siteUrl || DEFAULT_SITE };
}

function openBrowser(targetUrl: string) {
  try {
    const platform = process.platform;
    if (platform === "darwin") execSync(`open "${targetUrl}"`);
    else if (platform === "win32") execSync(`start "" "${targetUrl}"`);
    else execSync(`xdg-open "${targetUrl}"`);
  } catch {
    console.log(`\n请手动打开浏览器访问:\n${targetUrl}\n`);
  }
}

function readOpenclawJson(): Record<string, unknown> {
  try {
    if (fs.existsSync(OPENCLAW_JSON)) {
      const text = fs.readFileSync(OPENCLAW_JSON, "utf-8");
      const stripped = text.replace(/\/\/.*$/gm, "").replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(stripped);
    }
  } catch {
    // corrupted file, start fresh
  }
  return {};
}

function writeOpenclawJson(config: Record<string, unknown>) {
  fs.mkdirSync(OPENCLAW_DIR, { recursive: true });
  fs.writeFileSync(OPENCLAW_JSON, JSON.stringify(config, null, 2) + "\n");
}

function patchConfig(siteUrl: string, apiKey: string) {
  const config = readOpenclawJson();
  const skills = (config.skills ?? {}) as Record<string, unknown>;
  const entries = (skills.entries ?? {}) as Record<string, unknown>;

  entries["openclaw-club"] = {
    enabled: true,
    env: {
      DISCOURSE_SITE_URL: siteUrl,
      DISCOURSE_API_KEY: apiKey,
    },
  };

  skills.entries = entries;
  config.skills = skills;
  writeOpenclawJson(config);
}

async function main() {
  const { siteUrl } = parseArgs();

  console.log("");
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   OpenClaw 中文社区 — 一键配置              ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log("");
  console.log(`  论坛地址: ${siteUrl}`);
  console.log("");

  if (fs.existsSync(KEY_FILE)) {
    const readline = await import("node:readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const answer = await new Promise<string>((resolve) =>
      rl.question("  已有 API Key，是否重新获取？(y/N) ", resolve),
    );
    rl.close();
    if (answer.trim().toLowerCase() !== "y") {
      console.log("\n  取消操作。现有配置不变。");
      return;
    }
    console.log("");
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const nonce = crypto.randomBytes(16).toString("hex");
  const clientId = crypto.randomBytes(16).toString("hex");
  const callbackUrl = `http://localhost:${PORT}/callback`;

  const authUrl =
    `${siteUrl}/user-api-key/new` +
    `?scopes=${SCOPES}` +
    `&client_id=${clientId}` +
    `&nonce=${nonce}` +
    `&application_name=${encodeURIComponent(APP_NAME)}` +
    `&public_key=${encodeURIComponent(publicKey)}` +
    `&auth_redirect=${encodeURIComponent(callbackUrl)}`;

  let resolveKey: (key: string) => void;
  const keyPromise = new Promise<string>((resolve) => {
    resolveKey = resolve;
  });

  const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url ?? "", true);
    const payload = parsed.query.payload as string | undefined;

    if (!payload) {
      res.writeHead(400);
      res.end("Missing payload");
      return;
    }

    try {
      const encrypted = Buffer.from(payload, "base64");
      const decrypted = crypto.privateDecrypt(
        { key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
        encrypted,
      );
      const data = JSON.parse(decrypted.toString("utf-8"));

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>配置成功</title></head>
<body style="font-family:system-ui;text-align:center;padding:60px;background:#f9fafb">
  <div style="max-width:400px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,.1)">
    <div style="font-size:48px">✅</div>
    <h2 style="color:#16a34a;margin:12px 0">配置成功！</h2>
    <p style="color:#666">OpenClaw 中文社区技能已就绪</p>
    <p style="color:#999;font-size:14px;margin-top:20px">可以关闭此页面，回到 OpenClaw 说「看看社区最新帖子」试试</p>
  </div>
</body></html>`,
      );

      resolveKey!(data.key);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<h1>❌ 解密失败: ${err}</h1>`);
    }
  });

  server.listen(PORT, () => {
    console.log("  步骤 1/3: 正在打开浏览器...");
    console.log("  请在浏览器中登录社区并点击「授权」\n");
    openBrowser(authUrl);
  });

  const apiKey = await keyPromise;
  server.close();

  console.log("  步骤 2/3: 保存 API Key...");
  fs.mkdirSync(OPENCLAW_DIR, { recursive: true });
  fs.writeFileSync(KEY_FILE, apiKey, { mode: 0o600 });

  console.log("  步骤 3/3: 写入 openclaw.json 配置...\n");
  patchConfig(siteUrl, apiKey);

  console.log("╔══════════════════════════════════════════╗");
  console.log("║   ✅ 全部完成！                           ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log("");
  console.log("  现在可以对 OpenClaw 说：");
  console.log('  • 「看看社区最新帖子」');
  console.log('  • 「搜一下知识库相关帖子」');
  console.log('  • 「帮我在场景广场发个帖子」');
  console.log("");
  console.log(`  配置文件: ${OPENCLAW_JSON}`);
  console.log(`  API Key:  ${KEY_FILE}`);
  console.log("");
}

main().catch((err) => {
  console.error("❌ 配置失败:", err);
  process.exit(1);
});
