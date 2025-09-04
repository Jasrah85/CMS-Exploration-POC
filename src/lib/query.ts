export type ArticleQuery = {
  search?: string;
  category?: string;
  tag?: string;
  sort?: "newest" | "oldest" | "featured";
  page?: number;
  pageSize?: number;
};

export const defaults: Required<Pick<ArticleQuery, "page" | "pageSize" | "sort">> = {
  page: 1,
  pageSize: 12,
  sort: "newest"
};
