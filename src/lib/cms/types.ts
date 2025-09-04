import type { Article, Paginated } from "@/lib/models";
import type { ArticleQuery } from "@/lib/query";

export type CMSProvider = {
  getArticles(query?: ArticleQuery): Promise<Paginated<Article>>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  getFeatured(limit?: number): Promise<Article[]>;
  getCategories(): Promise<{ id: string; slug: string; title: string }[]>;
  getTags(): Promise<{ id: string; slug: string; title: string }[]>;

  /** Optional helper used for Contentful live updates (others can ignore). */
  __getRawEntryBySlug?: (slug: string) => Promise<any>;

  /** Optional: used by some providers to compute ISR paths from webhooks. */
  getRevalidatePathsForWebhook?(payload: any): string[];
};
