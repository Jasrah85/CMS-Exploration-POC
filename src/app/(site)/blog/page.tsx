// src/app/(site)/blog/page.tsx
import ArticleCard from "@/components/ArticleCard";
import FiltersBar from "@/components/FiltersBar";
import Pagination from "@/components/Pagination";
import { getCMS } from "@/lib/cms/cms";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;    // <— await once
  const cms = await getCMS();
  const [cats, tags] = await Promise.all([cms.getCategories(), cms.getTags()]);

  const page = Number(params.page ?? 1);
  const pageSize = 12;

  const data = await cms.getArticles({
    page,
    pageSize,
    category: typeof params.category === "string" ? params.category : undefined,
    tag: typeof params.tag === "string" ? params.tag : undefined,
    sort: "newest",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog</h1>
        <FiltersBar categories={cats} tags={tags} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((a) => <ArticleCard key={a.id} a={a} />)}
      </div>

      <Pagination total={data.total} page={data.page} pageSize={data.pageSize} />
    </div>
  );
}
