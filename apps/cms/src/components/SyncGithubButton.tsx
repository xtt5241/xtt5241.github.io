"use client";

import { Button, toast, useDocumentInfo } from "@payloadcms/ui";
import { useState } from "react";

export default function SyncGithubButton() {
  const { hasPublishedDoc, id } = useDocumentInfo();
  const [syncing, setSyncing] = useState(false);

  if (!id || !hasPublishedDoc) return null;

  const sync = async () => {
    if (syncing) return;
    setSyncing(true);

    try {
      const response = await fetch("/api/sync-github", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "同步失败。");
      toast.success(data.message || "已同步到 GitHub Pages。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "同步失败，请稍后重试。");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button type="button" onClick={() => void sync()} aria-busy={syncing}>
      {syncing ? "正在同步..." : "同步到 GitHub Pages"}
    </Button>
  );
}
