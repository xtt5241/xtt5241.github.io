import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";
import { syncPublishedContentOnce } from "@/endpoints/syncGithub";

async function sync(req: { payload: { logger: { error: (data: Record<string, unknown>) => void; info: (data: Record<string, unknown>) => void } } }, source: string) {
  try {
    const result = await syncPublishedContentOnce();
    req.payload.logger.info({
      ...result,
      message: `Blog content sync completed after ${source}`,
    });
  } catch (error) {
    // The CMS change is already persisted. Keep it available for a manual retry.
    req.payload.logger.error({
      err: error,
      message: `Blog content sync failed after ${source}`,
    });
  }
}

export const syncAfterPublicContentChange: CollectionAfterChangeHook = async ({ collection, req }) => {
  await sync(req, `${collection.slug} change`);
};

export const syncAfterPublicContentDelete: CollectionAfterDeleteHook = async ({ collection, req }) => {
  await sync(req, `${collection.slug} deletion`);
};

export const syncAfterProfileChange: GlobalAfterChangeHook = async ({ req }) => {
  await sync(req, "profile change");
};
