import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import type { Endpoint } from "payload";

const execFileAsync = promisify(execFile);
const publicPaths = ["apps/web/src/content/snapshot.json", "apps/web/public/media"];
let activeSync: Promise<SyncResult> | undefined;

type SyncResult = {
  changed: boolean;
  message: string;
};

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

async function run(command: string, args: string[], cwd: string) {
  return execFileAsync(command, args, {
    cwd,
    env: process.env,
    maxBuffer: 2 * 1024 * 1024,
  });
}

function errorMessage(error: unknown) {
  const detail = error as { stderr?: string; stdout?: string; message?: string };
  return (detail.stderr || detail.stdout || detail.message || "同步失败").trim().slice(-1600);
}

export async function syncPublishedContent(): Promise<SyncResult> {
  const repositoryRoot = findRepositoryRoot();
  await run("pnpm", ["export:content"], repositoryRoot);

  const status = await run("git", ["status", "--short", "--", ...publicPaths], repositoryRoot);
  if (!status.stdout.trim()) {
    return { changed: false, message: "公开内容没有变化。" };
  }

  await run("git", ["add", "-A", "--", ...publicPaths], repositoryRoot);
  await run("git", ["commit", "-m", "Update published blog content"], repositoryRoot);
  await run("git", ["push", "origin", "main"], repositoryRoot);

  return { changed: true, message: "已推送到 GitHub，Pages 正在部署。" };
}

export function syncPublishedContentOnce() {
  const sync = activeSync ?? (activeSync = syncPublishedContent().finally(() => {
    activeSync = undefined;
  }));
  return sync;
}

export const syncGithub: Endpoint = {
  path: "/sync-github",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: "需要登录后才能同步。" }, { status: 401 });
    }

    try {
      const result = await syncPublishedContentOnce();
      return Response.json({ ok: true, ...result });
    } catch (error) {
      console.error("GitHub Pages sync failed", error);
      return Response.json({ error: errorMessage(error) }, { status: 500 });
    }
  },
};
