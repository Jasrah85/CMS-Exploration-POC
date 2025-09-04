import type { CMSProvider } from "../types";
import type { Article, Paginated } from "@/lib/models";
import type { ArticleQuery } from "@/lib/query";
import { defaults } from "@/lib/query";

function mapDocToArticle(doc: any): Article {
  // TODO: map GROQ fields from your schema to Article
  const hero = doc?.heroImage;
  return {
    id: doc?._id ?? crypto.randomUUID(),
    slug: doc?.slug?.current ?? "",
    title: doc?.title ?? "",
    excerpt: doc?.excerpt ?? "",
    hero: hero ? { url: hero.asset?.url ?? hero.url, alt: hero.alt } : undefined,
    author: doc?.author && { id: doc.author._id ?? "author", name: doc.author.name },
    categories: (doc?.categories ?? []).map((c: any) => ({ id: c._id, slug: c.slug?.current, title: c.title })),
    tags: (doc?.tags ?? []).map((t: any) => ({ id: t._id, slug: t.slug?.current, title: t.title })),
    publishedAt: doc?.publishedAt,
    updatedAt: doc?._updatedAt,
    featured: Boolean(doc?.featured),
  };
}

export async function sanityProvider(): Promise<CMSProvider> {
  const projectId = process.env.SANITY_PROJECT_ID!;
  const dataset = process.env.SANITY_DATASET ?? "production";
  const token = process.env.SANITY_API_TOKEN;

  const sanity = (await import("@sanity/client").catch(() => null)) as any;
  const client = sanity
    ? sanity.createClient({
        projectId,
        dataset,
        apiVersion: "2025-01-01",
        useCdn: true,
        token,
        perspective: token ? "previewDrafts" : "published",
      })
    : null;

  return {
    async getArticles(query: ArticleQuery = {}): Promise<Paginated<Article>> {
      const q = { ...defaults, ...query };
      if (!client) return { items: [], total: 0, page: q.page, pageSize: q.pageSize };

      const where: string[] = [`_type == "article"`];
      if (q.search) where.push(`title match "${q.search}*"`);
      if (q.category) where.push(`"${q.category}" in categories[]->slug.current`);
      if (q.tag) where.push(`"${q.tag}" in tags[]->slug.current`);

      const order =
        q.sort === "oldest" ? "| order(publishedAt asc)" :
        q.sort === "featured" ? `| order(featured desc, publishedAt desc)` :
        `| order(publishedAt desc)`;

      const start = (q.page - 1) * q.pageSize;
      const end = start + q.pageSize;

      const base = `*[${
        where.join(" && ")
      }]{
        _id, title, "slug": slug, excerpt, "heroImage": hero, publishedAt, _updatedAt,
        "author": author->{_id, name},
        "categories": categories[]->{_id, title, "slug": slug},
        "tags": tags[]->{_id, title, "slug": slug}
      } ${order}`;

      const [items, total] = await Promise.all([
        client.fetch(`${base}[${start}...${end}]`),
        client.fetch(`count(${base})`),
      ]);

      return { items: items.map(mapDocToArticle), total, page: q.page, pageSize: q.pageSize };
    },

    async getArticleBySlug(slug: string) {
      if (!client) return null;
      const doc = await client.fetch(
        `*[_type == "article" && slug.current == $slug][0]{..., author->, categories[]->, tags[]->, "heroImage": hero}`,
        { slug }
      );
      return doc ? mapDocToArticle(doc) : null;
    },

    async getFeatured(limit = 6) {
      if (!client) return [];
      const docs = await client.fetch(
        `*[_type == "article" && featured == true]|order(publishedAt desc)[0...$n]{..., author->, categories[]->, tags[]->, "heroImage": hero}`,
        { n: limit }
      );
      return docs.map(mapDocToArticle);
    },

    async getCategories() {
      if (!client) return [];
      const cats = await client.fetch(`*[_type == "category"]{_id, title, "slug": slug.current}`);
      return cats.map((c: any) => ({ id: c._id, slug: c.slug, title: c.title }));
    },

    async getTags() {
      if (!client) return [];
      const tags = await client.fetch(`*[_type == "tag"]{_id, title, "slug": slug.current}`);
      return tags.map((t: any) => ({ id: t._id, slug: t.slug, title: t.title }));
    },

    getRevalidatePathsForWebhook(payload: any) {
      // Sanity webhook often has ids in payload.ids
      const slug = payload?.slug ?? payload?.body?.slug ?? payload?.body?.ids?.[0];
      return slug ? [`/blog/${slug}`, "/blog"] : ["/", "/blog", "/pressroom"];
    },
  };
}
