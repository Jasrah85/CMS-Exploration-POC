// src/components/ArticleHeader.client.tsx
"use client";
import Image from "next/image";
import AuthorChip from "@/components/AuthorChip";
import { formatDate } from "@/lib/utils";
import { useContentfulInspectorMode, useContentfulLiveUpdates } from "@contentful/live-preview/react";
import type { Article } from "@/lib/models";

// We accept both the mapped Article (for SSR) and the raw Contentful entry for live updates
export default function ArticleHeader({
  article,
  rawEntry,
}: {
  article: Article;
  rawEntry?: any;
}) {
  const updated = rawEntry ? useContentfulLiveUpdates(rawEntry) : null;
  const f = updated?.fields; // live-updated fields when typing

  const title = f?.title ?? article.title;
  const shortDescription = f?.shortDescription ?? article.excerpt;
  const publishedDate = f?.publishedDate ?? article.publishedAt;
  const heroUrl =
    f?.featuredImage?.fields?.file?.url
      ? "https:" + f.featuredImage.fields.file.url
      : article.hero?.url;

  const inspector = useContentfulInspectorMode({
    entryId: article.id,
    locale: "en-US",
  });

  return (
    <header className="space-y-3">
      <h1 className="text-3xl md:text-4xl font-bold" {...inspector({ fieldId: "title" })}>
        {title}
      </h1>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div {...inspector({ fieldId: "author" })}>
          <AuthorChip author={article.author} />
        </div>
        {publishedDate && (
          <time dateTime={String(publishedDate)} {...inspector({ fieldId: "publishedDate" })}>
            {formatDate(String(publishedDate))}
          </time>
        )}
      </div>

      {heroUrl && (
        <div className="overflow-hidden rounded-2xl" {...inspector({ fieldId: "featuredImage" })}>
          <Image
            src={heroUrl}
            alt={article.hero?.alt || ""}
            width={1200}
            height={675}
            className="aspect-[16/9] object-cover"
            priority
          />
        </div>
      )}

      {shortDescription && (
        <p className="text-gray-600" {...inspector({ fieldId: "shortDescription" })}>
          {shortDescription}
        </p>
      )}
    </header>
  );
}
