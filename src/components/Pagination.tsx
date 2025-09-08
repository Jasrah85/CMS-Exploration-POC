// src/components/Pagination.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({
  total,
  page,
  pageSize,
}: {
  total: number;
  page: number;
  pageSize: number;
}) {
  // ✅ hooks must be called unconditionally
  const router = useRouter();
  const params = useSearchParams();

  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const nav = (p: number) => {
    const s = new URLSearchParams(params.toString());
    s.set("page", String(p));
    router.push(`?${s.toString()}`);
  };

  const max = Math.min(pages, 7);
  const start = Math.max(1, Math.min(page - 3, pages - max + 1));
  const arr = Array.from({ length: max }, (_, i) => start + i);

  return (
    <nav className="flex justify-center gap-2" aria-label="Pagination">
      <button onClick={() => nav(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-2 rounded-xl border disabled:opacity-50">Prev</button>
      {arr.map((p) => (
        <button key={p} onClick={() => nav(p)} className={`px-3 py-2 rounded-xl border ${p === page ? "bg-gray-900 text-white" : ""}`}>
          {p}
        </button>
      ))}
      <button onClick={() => nav(Math.min(pages, page + 1))} disabled={page === pages} className="px-3 py-2 rounded-xl border disabled:opacity-50">Next</button>
    </nav>
  );
}
