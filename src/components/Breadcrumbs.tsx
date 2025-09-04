import Link from "next/link";

export type Crumb = { href?: string; label: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items?.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {c.href && !isLast ? (
                <Link href={c.href} className="hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "font-medium text-gray-900" : ""}>
                  {c.label}
                </span>
              )}
              {!isLast && <span className="px-1 text-gray-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
