import type { CMSProvider } from "../types";
import type { Article, Paginated } from "@/lib/models";
import type { ArticleQuery } from "@/lib/query";
import { defaults } from "@/lib/query";

function mapStoryToArticle(story: any): Article {
  const c = story?.content ?? {};
  return {
    id: story?.uuid ?? story?.id ?? crypto.randomUUID(),
    slug: story?.slug ?? "",
    title: c.title ?? story?.name ?? "",
    excerpt: c.excerpt,
    hero: c.hero?.filename ? { url: c.hero.filename, alt: c.hero?.alt } : undefined,
    author: c.author && { id: c.author?.uuid ?? "author", name: c.author?.name ?? c.author },
    categories: (c.categories ?? []).map((s: string) => ({ id: s, slug: s, title: s })),
    tags: (story?.tag_list ?? []).map((t: string) => ({ id: t, slug: t, title: t })),
    publishedAt: story?.published_at,
    updatedAt: story?.first_published_at,
    featured: Boolean(c.featured),
  };
}

export async function storyblokProvider(): Promise<CMSProvider> {
  const token = process.env.STORYBLOK_TOKEN!;
  const draftToken = process.env.STORYBLOK_PREVIEW_TOKEN;
  const StoryblokClient = (await import("storyblok-js-client").catch(() => null)) as any;
  const client = StoryblokClient ? new StoryblokClient({ accessToken: token }) : null;

  return {
    async getArticles(query: ArticleQuery = {}): Promise<Paginated<Article>> {
      const q = { ...defaults, ...query };
      if (!client) return { items: [], total: 0, page: q.page, pageSize: q.pageSize };

      const params: any = {
        starts_with: "blog/", // folder convention
        per_page: q.pageSize,
        page: q.page,
        sort_by: q.sort === "oldest" ? "first_published_at:asc" : "first_published_at:desc",
        token,
      };
      if (q.search) params.search_term = q.search;
      if (q.tag) params.with_tag = q.tag;

      const res = await client.get("cdn/stories", params);
      const items = (res?.data?.stories ?? []).map(mapStoryToArticle);
      const total = Number(res?.total ?? items.length);
      return { items, total, page: q.page, pageSize: q.pageSize };
    },

    async getArticleBySlug(slug: string) {
      if (!client) return null;
      try {
        const res = await client.get(`cdn/stories/blog/${slug}`, { token });
        return mapStoryToArticle(res.data.story);
      } catch {
        return null;
      }
    },

    async getFeatured(limit = 6) {
      if (!client) return [];
      const res = await client.get("cdn/stories", {
        starts_with: "blog/",
        per_page: limit,
        page: 1,
        sort_by: "first_published_at:desc",
        filter_query: { featured: { in: true } },
        token,
      });
      return (res?.data?.stories ?? []).map(mapStoryToArticle);
    },

    async getCategories() {
      // You may model categories as a content type or use Storyblok "stories" under /categories
      return [];
    },

    async getTags() {
      if (!client) return [];
      const res = await client.get("cdn/tags", { token });
      return (res?.data?.tags ?? []).map((t: any) => ({ id: t.name, slug: t.name, title: t.name }));
    },

    getRevalidatePathsForWebhook(payload: any) {
      // Storyblok webhooks may include story.slug
      const slug = payload?.story?.slug;
      return slug ? [`/blog/${slug}`, "/blog"] : ["/", "/blog", "/pressroom"];
    },
  };
}
