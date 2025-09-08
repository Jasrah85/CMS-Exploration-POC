// src/app/(site)/blog/[slug]/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { getCMS } from "@/lib/cms/cms";
import ArticleHeader from "@/components/ArticleHeader.client";
import ArticleBody from "@/components/ArticleBody.client";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cms = await getCMS();

  const [article, rawEntry] = await Promise.all([
    cms.getArticleBySlug(slug),
    cms.__getRawEntryBySlug?.(slug),
  ]);

  if (!article && !rawEntry) return notFound();

  const entryId = (rawEntry as any)?.sys?.id ?? (article as any).id;

  return (
    <article className="space-y-6">
      <ArticleHeader article={(article as any)} rawEntry={rawEntry} />
      <ArticleBody entryId={entryId} body={article?.body ?? article?.excerpt} rawEntry={rawEntry} />
    </article>
  );
}
