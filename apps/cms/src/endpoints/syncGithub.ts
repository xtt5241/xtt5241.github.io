import { existsSync, openSync } from "node:fs";
import path from "node:path";
import type { Endpoint } from "payload";

// 后台同步：导出内容 + git 提交推送 GitHub Pages。
// 通过分离子进程执行 scripts/sync-github.mjs，避免在请求/hook 内同步等待导致回环卡死。
// 2026-08-13 重构：原实现在请求内 await export+push，export 又回环请求 CMS 自己，dev server 频繁卡死。

function findRepositoryRoot() {
  const candidates = [
    process.env.BLOG_REPO_ROOT,
    process.cwd(),
    path.resolve(process.cwd(), "../.."),
  ].filter((value): value is string => Boolean(value));

  const root = candidates.find((candidate) => existsSync(path.join(candidate, "scripts/export-static-content.mjs")));
  if (!root) throw new Error("找不到博客仓库根目录。");
  return root;
}

async function getSpawn() {
  // 优先用 Node 内置 API（生产/ESM 可用）；Turbopack 无法把 process.getBuiltinModule 的参数当模块解析
  const childProcess = process.getBuiltinModule("node:child_process") as typeof import("node:child_process");
  if (childProcess) return childProcess.spawn;
  // dev 回退：eval 取 require（CJS）
  // eslint-disable-next-line no-eval
  return (0, eval)("require")("node:child_process").spawn;
}

export async function startBackgroundSync(): Promise<string> {
  const repositoryRoot = findRepositoryRoot();
  const script = path.join(repositoryRoot, "scripts/sync-github.mjs");
  const logPath = path.join(repositoryRoot, "sync-github.log");
  const logFd = openSync(logPath, "a");
  const spawnFn = await getSpawn();
  const cmd = "node";
  const args = [script];
  const opts = {
    cwd: repositoryRoot,
    detached: true,
    stdio: ["ignore", logFd, logFd],
    env: process.env,
  };
  const child = spawnFn(cmd, args, opts);
  child.unref();
  return logPath;
}

export const syncGithub: Endpoint = {
  path: "/sync-github",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: "需要登录后才能同步。" }, { status: 401 });
    }

    try {
      await startBackgroundSync();
      return Response.json({ ok: true, message: "同步已在后台开始，完成后 Pages 会自动部署。" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "同步启动失败。";
      return Response.json({ error: message }, { status: 500 });
    }
  },
};
