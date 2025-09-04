"use client";
import { useEffect } from "react";
import { ContentfulLivePreview } from "@contentful/live-preview";

export default function AutoRefreshOnSave() {
  useEffect(() => {
    ContentfulLivePreview.init({
      locale: "en-US",
      enableLiveUpdates: true,
      debugMode: false,
    });

    const unsubscribe = ContentfulLivePreview.subscribe("save", {
      callback: async () => {
        const pathname = window.location.pathname;
        await fetch(`/api/revalidate?pathname=${encodeURIComponent(pathname)}`, {
          cache: "no-store",
        });
        window.location.reload();
      },
    });

    return () => {
      try { unsubscribe?.(); } catch {}
    };
  }, []);

  return null;
}
