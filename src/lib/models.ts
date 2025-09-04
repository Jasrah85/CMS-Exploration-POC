export type Image = { url: string; alt?: string; width?: number; height?: number };

export type Author = {
  id: string;
  name: string;
  title?: string;
  avatar?: Image;
};

export type Category = { id: string; slug: string; title: string };
export type Tag = { id: string; slug: string; title: string };

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  body?: unknown;        // CMS-specific rich content
  hero?: Image;
  categories?: Category[];
  tags?: Tag[];
  author?: Author;
  publishedAt?: string;
  updatedAt?: string;
  featured?: boolean;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
