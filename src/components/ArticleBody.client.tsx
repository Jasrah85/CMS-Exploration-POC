// src/components/ArticleBody.client.tsx
"use client";
import { useContentfulInspectorMode, useContentfulLiveUpdates } from "@contentful/live-preview/react";
import ContentBlocks from "@/components/ContentBlocks";

type Props = { entryId: string; body?: unknown; rawEntry?: unknown };

export default function ArticleBody({ entryId, body, rawEntry }: Props) {
  // ✅ always call the hook
  const live = useContentfulLiveUpdates(rawEntry as any);
  const inspector = useContentfulInspectorMode({ entryId, locale: "en-US" });

  const renderedBody = (live as any)?.fields?.content ?? body;

  return (
    <div {...inspector({ fieldId: "content" })}>
      <ContentBlocks body={renderedBody} />
    </div>
  );
}
