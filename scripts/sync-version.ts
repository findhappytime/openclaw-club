#!/usr/bin/env npx tsx
/**
 * 同步 package.json 的版本号到 skill.yaml 和 SKILL.md
 *
 * 用法: npx tsx scripts/sync-version.ts
 * 或由 npm version 钩子自动调用
 */

import * as fs from "node:fs";
import * as path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8"));
const version: string = pkg.version;

function syncFile(filePath: string) {
  const full = path.join(root, filePath);
  if (!fs.existsSync(full)) return;
  const content = fs.readFileSync(full, "utf-8");
  const updated = content.replace(/^version:\s*.+$/m, `version: ${version}`);
  if (updated !== content) {
    fs.writeFileSync(full, updated);
    console.log(`  ✓ ${filePath} → ${version}`);
  }
}

console.log(`同步版本号: ${version}`);
syncFile("skill.yaml");
syncFile("SKILL.md");
