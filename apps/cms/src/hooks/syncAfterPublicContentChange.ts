import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";
import { startBackgroundSync } from "@/endpoints/syncGithub";

// 内容变更（保存/删除文章、修改 profile）后触发后台同步，不阻塞请求。
// 2026-08-13 重构：原实现 await 同步，export 回环请求 CMS 导致 dev server 卡死。

async function sync(source: string) {
  try {
    startBackgroundSync();
    console.log(`[sync] background sync started after ${source}`);
  } catch (error) {
    console.error(`[sync] failed to start sync after ${source}`, error);
  }
}

export const syncAfterPublicContentChange: CollectionAfterChangeHook = async ({ collection }) => {
  await sync(`${collection.slug} change`);
};

export const syncAfterPublicContentDelete: CollectionAfterDeleteHook = async ({ collection }) => {
  await sync(`${collection.slug} deletion`);
};

export const syncAfterProfileChange: GlobalAfterChangeHook = async () => {
  await sync("profile change");
};
