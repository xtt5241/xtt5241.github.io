import type { CollectionAfterDeleteHook } from "payload";
import { syncPublishedContentOnce } from "@/endpoints/syncGithub";

export const syncAfterPostDelete: CollectionAfterDeleteHook = async ({ req }) => {
  try {
    const result = await syncPublishedContentOnce();
    req.payload.logger.info({
      ...result,
      message: "Blog content sync completed after post deletion",
    });
  } catch (error) {
    req.payload.logger.error({
      err: error,
      message: "Blog content sync failed after post deletion",
    });
  }
};
