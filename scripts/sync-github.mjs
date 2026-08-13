#!/usr/bin/env node
// 后台同步脚本：导出内容 + git 提交推送 GitHub Pages。
// 由 CMS 的 /api/sync-github 和保存 hook 以分离子进程方式调用，避免阻塞/回环卡死。
import { execFile } from "node:child_process";
import { openSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.env.BLOG_REPO_ROOT || process.cwd();
const publicPaths = ["apps/web/src/content/snapshot.json", "apps/web/public/media"];

async function run(cmd, args, opts = {}) {
  return exec(cmd, args, {
    cwd: root,
    timeout: opts.timeout || 120000,
    maxBuffer: 4 * 1024 * 1024,
    env: opts.env ? { ...process.env, ...opts.env } : process.env,
  });
}

async function main() {
  console.log(new Date().toISOString(), "start export");
  await run("node", ["scripts/export-static-content.mjs"], { timeout: 60000 });
  console.log(new Date().toISOString(), "export done");

  const status = await run("git", ["status", "--short", "--", ...publicPaths]);
  if (!status.stdout.trim()) {
    console.log(new Date().toISOString(), "NO_CHANGE");
    return;
  }

  await run("git", ["add", "-A", "--", ...publicPaths]);
  await run("git", ["commit", "-m", "Update published blog content"], { timeout: 30000 });

  const deployKey = path.join(os.homedir(), ".ssh/id_ed25519_xtt_blog");
  await run("git", ["push", "origin", "main"], {
    timeout: 120000,
    env: {
      GIT_SSH_COMMAND: `ssh -i ${deployKey} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`,
    },
  });
  console.log(new Date().toISOString(), "SYNC_OK");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(new Date().toISOString(), "SYNC_FAIL", error.stderr || error.message);
    process.exit(1);
  });
