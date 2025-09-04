import type { CMSProvider } from "../types";
import type { Article, Paginated } from "@/lib/models";
import type { ArticleQuery } from "@/lib/query";
import { defaults } from "@/lib/query";

function mapDocToArticle(doc: any): Article {
  const data = doc?.data ?? {};
  const hero = data?.hero_image ?? data?.image;
  const slug = doc?.uid ?? data?.slug ?? "";
  return {
    id: doc?.id ?? crypto.randomUUID(),
    slug,
    title: data?.title?.[0]?.text ?? data?.title ?? doc?.slugs?.[0] ?? "",
    excerpt: data?.excerpt?.[0]?.text ?? data?.excerpt,
    hero: hero?.url ? { url: hero.url, alt: hero?.alt } : undefined,
    author: data?.author && { id: "author", name: data.author },
    categories: (data?.categories ?? []).map((s: any) => ({ id: s?.slug ?? s, slug: s?.slug ?? s, title: s?.title ?? s })),
    tags: (doc?.tags ?? []).map((t: string) => ({ id: t, slug: t, title: t })),
    publishedAt: doc?.first_publication_date,
    updatedAt: doc?.last_publication_date,
    featured: Boolean(data?.featured),
  };
}

export async function prismicProvider(): Promise<CMSProvider> {
  const repo = process.env.PRISMIC_REPOSITORY_NAME!;
  const accessToken = process.env.PRISMIC_ACCESS_TOKEN;

  // Prefer official client if installed; otherwise use REST
  const prismicClientMod = await import("@prismicio/client").catch(() => null) as any;
  const useSDK = Boolean(prismicClientMod);

  async function sdkClient() {
    if (!prismicClientMod) return null;
    return prismicClientMod.createClient(repo, { accessToken });
  }

  async function rest(path: string, params: Record<string, any> = {}) {
    const url = new URL(`https://${repo}.cdn.prismic.io/api/v2${path}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Prismic request failed: ${res.status}`);
    return res.json();
  }

  return {
    async getArticles(query: ArticleQuery = {}): Promise<Paginated<Article>> {
      const q = { ...defaults, ...query };

      if (useSDK) {
        const client = await sdkClient();
        const predicate = prismicClientMod.predicate;
        const predicates = [predicate.at("document.type", "article")];
        if (q.search) predicates.push(predicate.fulltext("document", q.search));
        if (q.tag) predicates.push(predicate.at("document.tags", [q.tag]));
        const orderings = q.sort === "oldest" ? { field: "document.first_publication_date", direction: "asc" } : { field: "document.first_publication_date", direction: "desc" };
        const res = await client.get({
          predicates,
          pageSize: q.pageSize,
          page: q.page,
          orderings: [orderings],
        });
        const items = res.results.map(mapDocToArticle);
        return { items, total: res.total_results_size ?? items.length, page: q.page, pageSize: q.pageSize };
      }

      // REST fallback (simplified)
      const res = await rest("/documents/search", {
        q: `[[at(document.type, "article")]]`,
        pageSize: q.pageSize,
        page: q.page,
      });
      const items = (res?.results ?? []).map(mapDocToArticle);
      return { items, total: res?.total_results_size ?? items.length, page: q.page, pageSize: q.pageSize };
    },

    async getArticleBySlug(slug: string) {
      if (useSDK) {
        const client = await sdkClient();
        const doc = await client.getByUID("article", slug).catch(() => null);
        return doc ? mapDocToArticle(doc) : null;
      }
      // REST fallback
      const res = await rest("/documents/search", { q: `[[at(my.article.uid,"${slug}")]]`, pageSize: 1 });
      const doc = res?.results?.[0];
      return doc ? mapDocToArticle(doc) : null;
    },

    async getFeatured(limit = 6) {
      if (useSDK) {
        const client = await sdkClient();
        const res = await client.get({ predicates: [prismicClientMod.predicate.at("document.type", "article")], pageSize: limit });
        return res.results.map(mapDocToArticle);
      }
      const res = await rest("/documents/search", { q: `[[at(document.type,"article")]]`, pageSize: limit });
      return (res?.results ?? []).map(mapDocToArticle);
    },

    async getCategories() { return []; },
    async getTags() { return []; },

    getRevalidatePathsForWebhook(payload: any) {
      // Prismic webhook may include documents with `type` and `uid`
      const slug = payload?.documents?.[0]?.uid;
      return slug ? [`/blog/${slug}`, "/blog"] : ["/", "/blog", "/pressroom"];
    },
  };
}
