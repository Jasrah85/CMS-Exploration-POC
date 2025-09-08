// src/components/ArticleHeader.client.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import AuthorChip from "@/components/AuthorChip";
import { formatDate } from "@/lib/utils";
import { useContentfulInspectorMode, useContentfulLiveUpdates } from "@contentful/live-preview/react";
import type { Article } from "@/lib/models";

export default function ArticleHeader({ article, rawEntry }: { article: Article; rawEntry?: unknown }) {
  // ✅ always call the hook; pass possibly-undefined
  const updated = useContentfulLiveUpdates(rawEntry as any);
  const f: any = (updated as any)?.fields;

  const title = f?.title ?? article.title;
  const shortDescription = f?.shortDescription ?? article.excerpt;
  const publishedDate = f?.publishedDate ?? article.publishedAt;
  const heroUrl = f?.featuredImage?.fields?.file?.url ? "https:" + f.featuredImage.fields.file.url : article.hero?.url;

  const entryId = (rawEntry as any)?.sys?.id ?? article.id;
  const inspector = useContentfulInspectorMode({ entryId, locale: "en-US" });

  return (
    <header className="space-y-3">
      <h1 className="text-3xl md:text-4xl font-bold" {...inspector({ fieldId: "title" })}>{title}</h1>
      {shortDescription && <p className="text-gray-600" {...inspector({ fieldId: "shortDescription" })}>{shortDescription}</p>}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div {...inspector({ fieldId: "author" })}><AuthorChip author={article.author} /></div>
        {publishedDate && <time dateTime={String(publishedDate)} {...inspector({ fieldId: "publishedDate" })}>{formatDate(String(publishedDate))}</time>}
      </div>
      {heroUrl && (
        <div className="overflow-hidden rounded-2xl" {...inspector({ fieldId: "featuredImage" })}>
          <Image src={heroUrl} alt={article.hero?.alt || ""} width={1200} height={675} className="aspect-[16/9] object-cover" priority />
        </div>
      )}
    </header>
  );
}
