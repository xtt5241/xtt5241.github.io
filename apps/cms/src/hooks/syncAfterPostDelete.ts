import type { CollectionAfterDeleteHook } from "payload";
import { syncAfterPublicContentDelete } from "@/hooks/syncAfterPublicContentChange";

export const syncAfterPostDelete: CollectionAfterDeleteHook = syncAfterPublicContentDelete;
