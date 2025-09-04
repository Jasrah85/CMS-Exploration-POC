// public/live-preview.js
import { ContentfulLivePreview } from "@contentful/live-preview";

ContentfulLivePreview.init({
  locale: "en-US",
  debugMode: false,
  enableLiveUpdates: true,
});

ContentfulLivePreview.subscribe("save", {
  callback: async () => {
    const pathname = window.location.pathname;
    await fetch(`/api/revalidate?pathname=${pathname}`);
    window.location.reload();
  },
});
