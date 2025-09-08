// src/lib/cms/types.ts
import type { Article, Paginated } from "@/lib/models";
import type { ArticleQuery } from "@/lib/query";

export type CMSProvider = {
  getArticles(query?: ArticleQuery): Promise<Paginated<Article>>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  getFeatured(limit?: number): Promise<Article[]>;
  getCategories(): Promise<{ id: string; slug: string; title: string }[]>;
  getTags(): Promise<{ id: string; slug: string; title: string }[]>;
  __getRawEntryBySlug?: (slug: string) => Promise<unknown>;
  getRevalidatePathsForWebhook?(payload: unknown): string[];
};
