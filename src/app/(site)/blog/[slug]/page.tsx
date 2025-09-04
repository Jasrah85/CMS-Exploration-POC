// src/app/(site)/blog/[slug]/page.tsx  (SERVER)
import Script from "next/script";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getCMS } from "@/lib/cms/cms";
import ContentBlocks from "@/components/ContentBlocks";
import ArticleHeader from "@/components/ArticleHeader.client";
import AutoRefreshOnSave from "@/components/AutoRefreshOnSave.client";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const cms = await getCMS();
  const rawEntry = (cms as any).__getRawEntryBySlug ? await (cms as any).__getRawEntryBySlug(slug) : undefined;

  if (!rawEntry) return notFound();

  return (
    <article className="space-y-6">
      <ArticleHeader article={rawEntry} rawEntry={rawEntry} />
      <ContentBlocks body={rawEntry.body || rawEntry.excerpt} />
      {isEnabled && <Script src="/live-preview.js" strategy="afterInteractive" />}
      {isEnabled && <AutoRefreshOnSave />}
    </article>
  );
}
