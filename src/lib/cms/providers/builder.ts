import type { CMSProvider } from "../types";
import type { Article, Paginated } from "@/lib/models";
import type { ArticleQuery } from "@/lib/query";
import { defaults } from "@/lib/query";

// Using REST so you don’t need the SDK immediately
const API = "https://cdn.builder.io/api/v3";

function mapBuilderItemToArticle(item: any): Article {
  const data = item?.data ?? {};
  const image = data?.heroImage ?? data?.image;
  return {
    id: item?.id ?? crypto.randomUUID(),
    slug: data?.slug ?? item?.name?.toLowerCase()?.replace(/\s+/g, "-") ?? "",
    title: data?.title ?? item?.name ?? "",
    excerpt: data?.excerpt,
    hero: image ? { url: image, alt: data?.imageAlt } : undefined,
    author: data?.author && { id: "author", name: data.author },
    categories: (data?.categories ?? []).map((s: string) => ({ id: s, slug: s, title: s })),
    tags: (data?.tags ?? []).map((s: string) => ({ id: s, slug: s, title: s })),
    publishedAt: item?.published ?? item?.createdDate,
    updatedAt: item?.lastUpdated,
    featured: Boolean(data?.featured),
  };
}

export async function builderProvider(): Promise<CMSProvider> {
  const apiKey = process.env.NEXT_PUBLIC_BUILDER_PUBLIC_KEY!;
  const model = "article"; // align with your Builder model name

  async function fetchBuilder(path: string, params: Record<string, any> = {}) {
    const url = new URL(`${API}/${path}`);
    url.searchParams.set("apiKey", apiKey);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Builder request failed: ${res.status}`);
    return res.json();
  }

  return {
    async getArticles(query: ArticleQuery = {}): Promise<Paginated<Article>> {
      const q = { ...defaults, ...query };
      const opts: any = { limit: q.pageSize, offset: (q.page - 1) * q.pageSize };
      // Builder supports query filters via `query` param (JSON)
      const filter: Record<string, any> = {};
      if (q.search) filter["$or"] = [{ "data.title": { $regex: q.search, $options: "i" } }, { "data.excerpt": { $regex: q.search, $options: "i" } }];
      if (q.tag) filter["data.tags.value"] = q.tag;
      const order = q.sort === "oldest" ? "createdDate asc" : "createdDate desc";

      const json = await fetchBuilder(`content/${model}`, { ...opts, query: JSON.stringify(filter), sort: order });
      const items = (json?.results ?? []).map(mapBuilderItemToArticle);
      const total = json?.count ?? items.length;
      return { items, total, page: q.page, pageSize: q.pageSize };
    },

    async getArticleBySlug(slug: string) {
      const json = await fetchBuilder(`content/${model}`, { query: JSON.stringify({ "data.slug": slug }), limit: 1 });
      const doc = json?.results?.[0];
      return doc ? mapBuilderItemToArticle(doc) : null;
    },

    async getFeatured(limit = 6) {
      const json = await fetchBuilder(`content/${model}`, { query: JSON.stringify({ "data.featured": true }), limit });
      return (json?.results ?? []).map(mapBuilderItemToArticle);
    },

    async getCategories() { return []; },
    async getTags() { return []; },

    getRevalidatePathsForWebhook(payload: any) {
      // Builder webhooks can include `model` and `data.slug`
      const slug = payload?.data?.data?.slug ?? payload?.data?.slug;
      return slug ? [`/blog/${slug}`, "/blog"] : ["/", "/blog", "/pressroom"];
    },
  };
}
