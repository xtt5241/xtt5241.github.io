"use client";

import { useEffect, type ReactNode } from "react";

export default function QuickUploadProvider({ children }: { children?: ReactNode }) {
  useEffect(() => {
    const submittedManagers = new WeakSet<Element>();
    const fallbackTimers = new Set<ReturnType<typeof setTimeout>>();

    const submitReadyUploads = () => {
      document.querySelectorAll(".bulk-upload--file-manager").forEach((manager) => {
        if (submittedManagers.has(manager)) return;

        const saveButton = manager.querySelector<HTMLButtonElement>(
          ".bulk-upload--actions-bar__saveButtons button:not(:disabled)",
        );
        if (!saveButton) return;

        submittedManagers.add(manager);
        manager.classList.add("quick-upload--submitting");
        saveButton.click();

        const timer = setTimeout(() => {
          fallbackTimers.delete(timer);
          if (manager.isConnected) manager.classList.remove("quick-upload--submitting");
        }, 5000);
        fallbackTimers.add(timer);
      });
    };

    const observer = new MutationObserver(submitReadyUploads);
    observer.observe(document.body, { childList: true, subtree: true });
    submitReadyUploads();

    return () => {
      observer.disconnect();
      fallbackTimers.forEach(clearTimeout);
    };
  }, []);

  return children;
}
