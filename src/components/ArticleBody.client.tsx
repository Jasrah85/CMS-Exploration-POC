// src/components/ArticleBody.client.tsx
"use client";
import { useContentfulInspectorMode, useContentfulLiveUpdates } from "@contentful/live-preview/react";
import ContentBlocks from "@/components/ContentBlocks";

type Props = {
  entryId: string;
  body?: any;     // SSR body (Rich Text doc or string)
  rawEntry?: any; // raw Contentful entry for live updates (optional)
};

export default function ArticleBody({ entryId, body, rawEntry }: Props) {
  const live = rawEntry ? useContentfulLiveUpdates(rawEntry) : null;
  const inspector = useContentfulInspectorMode({ entryId, locale: "en-US" });

  // Prefer live-updating Rich Text from the raw entry; fallback to SSR body
  const renderedBody = live?.fields?.content ?? body;

  return (
    <div {...inspector({ fieldId: "content" })}>
      <ContentBlocks body={renderedBody} />
    </div>
  );
}