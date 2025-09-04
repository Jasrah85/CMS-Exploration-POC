import type { CMSProvider } from "../types";
import type { Article, Paginated } from "@/lib/models";
import type { ArticleQuery } from "@/lib/query";
import { defaults } from "@/lib/query";

const now = new Date().toISOString();

const demo = (i: number): Article => ({
  id: String(i),
  slug: `demo-post-${i}`,
  title: `How To Get Cited: ${i}`,
  excerpt: "Short summary that teases the content and keywords.",
  hero: { url: "/placeholder.webp", alt: "placeholder" },
  categories: [{ id: "sales", slug: "sales", title: "Sales" }],
  tags: [{ id: "ai", slug: "ai", title: "AI" }],
  author: { id: "1", name: "Alex Writer" },
  publishedAt: now,
  featured: i % 4 === 0
});

const ALL: Article[] = Array.from({ length: 45 }, (_, i) => demo(i + 1));

function paginate(items: Article[], page = 1, pageSize = 12): Paginated<Article> {
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize };
}

export async function mockProvider(): Promise<CMSProvider> {
  return {
    async getArticles(query: ArticleQuery = {}) {
      const q = { ...defaults, ...query };
      let items = [...ALL];
      if (q.sort === "featured") items = items.sort((a, b) => Number(b.featured) - Number(a.featured));
      if (q.search) items = items.filter(a => a.title.toLowerCase().includes(q.search!.toLowerCase()));
      if (q.category) items = items.filter(a => a.categories?.some(c => c.slug === q.category));
      if (q.tag) items = items.filter(a => a.tags?.some(t => t.slug === q.tag));
      return paginate(items, q.page, q.pageSize);
    },
    async getArticleBySlug(slug) {
      return ALL.find(a => a.slug === slug) ?? null;
    },
    async getFeatured(limit = 6) {
      return ALL.filter(a => a.featured).slice(0, limit);
    },
    async getCategories() {
      return [
        { id: "sales", slug: "sales", title: "Sales" },
        { id: "small-business", slug: "small-business", title: "Small Business" },
        { id: "ai", slug: "ai", title: "AI" }
      ];
    },
    async getTags() {
      return [
        { id: "ai", slug: "ai", title: "AI" },
        { id: "productivity", slug: "productivity", title: "Productivity" }
      ];
    },
    getRevalidatePathsForWebhook() {
      return ["/", "/blog", "/pressroom"];
    }
  };
}
