// src/lib/cms/providers/contentful.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CMSProvider } from "../cms";
import type { Article, Paginated } from "@/lib/models";
import type { ArticleQuery } from "@/lib/query";
import { defaults } from "@/lib/query";
import { draftMode } from "next/headers";
import { createClient, type EntryCollection } from "contentful";

const ARTICLE_TYPE = process.env.NEXT_PUBLIC_CONTENTFUL_ARTICLE_TYPE ?? "pageBlogPost";

/** Create CDA/CPA client depending on preview mode */
async function getClient() {
  const dm = await draftMode(); // Next 15: async
  const isPreview = dm.isEnabled;

  const space = process.env.CONTENTFUL_SPACE_ID!;
  const environment = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
  const deliveryToken = process.env.CONTENTFUL_DELIVERY_TOKEN!;
  const previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN;

  return createClient({
    space,
    environment,
    accessToken: isPreview && previewToken ? previewToken : deliveryToken,
    host: isPreview && previewToken ? "preview.contentful.com" : "cdn.contentful.com",
  });
}

/** Minimal Rich Text → plaintext (good enough for POC) */
function richToPlain(rich: any): string {
  if (!rich?.content) return "";
  const walk = (n: any): string =>
    n?.nodeType === "text"
      ? n.value
      : Array.isArray(n?.content)
      ? n.content.map(walk).join("")
      : "";
  return rich.content.map(walk).join("\n\n").trim();
}

function mapEntryToArticle(entry: any): Article {
  const f = entry?.fields ?? {};
  const heroFile = f.featuredImage?.fields?.file;

  return {
    id: entry?.sys?.id ?? crypto.randomUUID(),
    slug: f.slug ?? "",
    title: f.title ?? f.internalName ?? "",
    excerpt: f.shortDescription ?? "",
    body: f.content ?? richToPlain(f.content),
    hero: heroFile
      ? {
          url: `https:${heroFile.url}`,
          alt: f.featuredImage?.fields?.title,
          width: heroFile.details?.image?.width,
          height: heroFile.details?.image?.height,
        }
      : undefined,
    author: f.author && {
      id: f.author.sys?.id ?? "author",
      name: f.author.fields?.name ?? "Author",
      title: f.author.fields?.title,
      avatar: f.author.fields?.image?.fields?.file?.url
        ? { url: "https:" + f.author.fields.image.fields.file.url, alt: f.author.fields?.image?.fields?.title }
        : undefined,
    },
    categories: [],
    tags: (f.tags ?? []).map((t: string) => ({ id: t, slug: t, title: t })),
    publishedAt: f.publishedDate ?? entry?.sys?.createdAt,
    updatedAt: entry?.sys?.updatedAt,
    featured: Boolean(f.featured),
  };
}

export async function contentfulProvider(): Promise<CMSProvider> {
  return {
    async getArticles(query: ArticleQuery = {}): Promise<Paginated<Article>> {
      const q = { ...defaults, ...query };
      const client = await getClient();

      const order =
        q.sort === "oldest"
          ? (["fields.publishedDate", "sys.createdAt"] as const)
          : (["-fields.publishedDate", "-sys.createdAt"] as const);

      const params: Record<string, any> = {
        content_type: ARTICLE_TYPE,
        limit: q.pageSize,
        skip: (q.page - 1) * q.pageSize,
        order,
      };

      if (q.search) params.query = q.search;
      if (q.tag) params["fields.tags[in]"] = q.tag;

      const res: EntryCollection<any> = await client.getEntries(params);
      const items = res.items.map(mapEntryToArticle);
      return { items, total: res.total ?? items.length, page: q.page, pageSize: q.pageSize };
    },

    async getArticleBySlug(slug: string) {
      const client = await getClient();
      const res = await client.getEntries({
        content_type: ARTICLE_TYPE,
        "fields.slug": slug,
        limit: 1,
      });
      const entry = res.items?.[0];
      return entry ? mapEntryToArticle(entry) : null;
    },

    async getFeatured(limit = 6) {
      const client = await getClient();
      const res = await client.getEntries({
        content_type: ARTICLE_TYPE,
        "fields.featured": true,
        order: ["-fields.publishedDate", "-sys.createdAt"],
        limit,
      } as any);
      return res.items.map(mapEntryToArticle);
    },

    async getCategories() {
      return [];
    },

    async getTags() {
      const client = await getClient();
      const res: any = await client.getEntries({
        content_type: ARTICLE_TYPE,
        select: ["fields.tags"], // array form for SDK v10
        limit: 200,
      } as any);
      const set = new Set<string>();
      for (const it of res.items as any[]) {
        const raw = it?.fields?.tags;
        if (Array.isArray(raw)) for (const t of raw) set.add(String(t));
      }
      return Array.from(set).sort().map((t) => ({ id: t, slug: t, title: t }));
    },

    // --- Option B helper: return the RAW entry for useContentfulLiveUpdates ---
    async __getRawEntryBySlug(slug: string) {
      const client = await getClient();
      const res = await client.getEntries({
        content_type: ARTICLE_TYPE,
        "fields.slug": slug,
        include: 2, // pull linked fields (author, image, etc.)
        limit: 1,
      } as any);
      return res.items?.[0] ?? null;
    },

    getRevalidatePathsForWebhook(payload: any) {
      const slug =
        payload?.fields?.slug?.["en-US"] ||
        payload?.sys?.id ||
        payload?.entity?.sys?.id;
      return slug ? [`/blog/${slug}`, "/blog"] : ["/", "/blog", "/pressroom"];
    },
  };
}
