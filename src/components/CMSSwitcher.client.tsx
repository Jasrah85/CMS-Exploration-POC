// src/components/CMSSwitcher.client.tsx
"use client";
import { usePathname, useSearchParams } from "next/navigation";

const options = ["contentful", "sanity", "storyblok", "builder", "prismic", "mock"] as const;
export default function CMSSwitcher({ current }: { current: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const to = pathname + (params.size ? `?${params.toString()}` : "");
  return (
    <select
      defaultValue={current}
      onChange={(e) => {
        const value = e.target.value;
        window.location.href = `/api/cms?value=${encodeURIComponent(value)}&to=${encodeURIComponent(to)}`;
      }}
      className="border rounded px-2 py-1 text-sm"
      aria-label="Choose CMS"
      title="Choose CMS provider"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
