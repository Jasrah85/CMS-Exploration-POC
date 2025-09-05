// src/app/(site)/blog/[slug]/page.tsx
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getCMS } from "@/lib/cms/cms";
import ArticleHeader from "@/components/ArticleHeader.client";
import ArticleBody from "@/components/ArticleBody.client";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cms = await getCMS();

  const [article, rawEntry] = await Promise.all([
    cms.getArticleBySlug(slug),          // mapped Article (SSR)
    cms.__getRawEntryBySlug?.(slug),     // raw Contentful entry (live)
  ]);

  if (!article && !rawEntry) return notFound();

  const entryId = rawEntry?.sys?.id ?? (article as any).id;

  return (
    <article className="space-y-6">
      {/* Header reads from SSR article, but prefers live fields if rawEntry present */}
      <ArticleHeader article={(article as any)} rawEntry={rawEntry} />

      {/* Body is annotated + live (if rawEntry) */}
      <ArticleBody
        entryId={entryId}
        body={(article?.body ?? article?.excerpt) as any}
        rawEntry={rawEntry}
      />
    </article>
  );
}
