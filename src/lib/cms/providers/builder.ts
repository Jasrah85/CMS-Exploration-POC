/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CMSProvider } from "../types";
import type { Article, Paginated } from "@/lib/models";
import type { ArticleQuery } from "@/lib/query";
import { defaults } from "@/lib/query";
import { draftMode } from "next/headers";
import { builder } from "@builder.io/sdk";

const MODEL = process.env.NEXT_PUBLIC_BUILDER_ARTICLE_MODEL ?? "article";

builder.init(process.env.BUILDER_API_KEY!);

function mapItemToArticle(item: any): Article {
  const d = item?.data ?? {};
  const hero = d.featuredImage?.url
    ? { url: d.featuredImage.url, alt: d.featuredImage.altText }
    : undefined;

  return {
    id: item?.id ?? crypto.randomUUID(),
    slug: d.slug ?? "",
    title: d.title ?? "",
    excerpt: d.shortDescription ?? "",
    body: d.content ?? "",
    hero,
    author: d.author && {
      id: d.author.id ?? "author",
      name: d.author.name ?? "Author",
      title: d.author.title,
      avatar: d.author.avatar?.url ? { url: d.author.avatar.url, alt: d.author.avatar?.altText } : undefined,
    },
    categories: [],
    tags: (Array.isArray(d.tags) ? d.tags : []).map((t: string) => ({ id: t, slug: t, title: t })),
    publishedAt: d.publishedDate ?? item?.published ?? item?.firstPublished,
    updatedAt: item?.lastUpdated,
    featured: Boolean(d.featured),
  };
}

async function getClientOptions() {
  const { isEnabled } = await draftMode();
  return {
    options: {
      includeRefs: true,
      includeUnpublished: isEnabled, // show drafts in preview
      cachebust: isEnabled,
    } as any,
  };
}

export async function builderProvider(): Promise<CMSProvider> {
  return {
    async getArticles(query: ArticleQuery = {}): Promise<Paginated<Article>> {
      const q = { ...defaults, ...query };
      const { options } = await getClientOptions();

      const sort =
        q.sort === "oldest" ? { "data.publishedDate": 1 } : { "data.publishedDate": -1 };

      const filter: any = {};
      if (q.tag) filter["data.tags.$in"] = [q.tag];
      if (q.search) filter.$or = [
        { "data.title.$regex": q.search, "data.title.$options": "i" },
        { "data.shortDescription.$regex": q.search, "data.shortDescription.$options": "i" },
      ];

      const items = await builder.getAll(MODEL, {
        ...options,
        query: filter,
        sort,
        options: {
          ...options.options,
          limit: q.pageSize,
          offset: (q.page - 1) * q.pageSize,
        },
      });

      // total: Builder CDN doesn’t return total; for POC, derive from a light “count” call or estimate
      // Here we do a simple extra fetch without limit for an approximate total (fine for small spaces).
      const allForCount =
        q.page === 1
          ? await builder.getAll(MODEL, { ...options, query: filter, options: { ...options.options, limit: 200 } })
          : [];

      return {
        items: items.map(mapItemToArticle),
        total: allForCount.length || items.length,
        page: q.page,
        pageSize: q.pageSize,
      };
    },

    async getArticleBySlug(slug: string) {
      const { options } = await getClientOptions();
      const res = await builder.get(MODEL, {
        ...options,
        query: { "data.slug": slug },
      });
      return res ? mapItemToArticle(res) : null;
    },

    async getFeatured(limit = 6) {
      const { options } = await getClientOptions();
      const items = await builder.getAll(MODEL, {
        ...options,
        query: { "data.featured": true },
        sort: { "data.publishedDate": -1 },
        options: { ...options.options, limit },
      });
      return items.map(mapItemToArticle);
    },

    async getCategories() {
      return [];
    },

    async getTags() {
      const { options } = await getClientOptions();
      const items = await builder.getAll(MODEL, {
        ...options,
        options: { ...options.options, limit: 200 },
        select: "data.tags",
      } as any);
      const set = new Set<string>();
      for (const it of items as any[]) (Array.isArray(it?.data?.tags) ? it.data.tags : []).forEach((t: string) => set.add(t));
      return Array.from(set).sort().map((t) => ({ id: t, slug: t, title: t }));
    },

    // not used by Builder in this POC
    getRevalidatePathsForWebhook() {
      return ["/blog"];
    },
  };
}
