'use client';
import { useRouter, useSearchParams } from 'next/navigation';


export default function FiltersBar({ categories, tags }: { categories: {slug:string; title:string}[]; tags:{slug:string; title:string}[] }) {
const router = useRouter();
const params = useSearchParams();


const set = (k: string, v: string) => {
const p = new URLSearchParams(params.toString());
if (v) p.set(k, v); else p.delete(k);
router.push(`?${p.toString()}`);
};


return (
<div className="flex flex-wrap gap-2 items-center">
<select className="rounded-xl border px-3 py-2" defaultValue={params.get('category')||''} onChange={e=>set('category', e.target.value)}>
<option value="">All Categories</option>
{categories.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
</select>
<select className="rounded-xl border px-3 py-2" defaultValue={params.get('tag')||''} onChange={e=>set('tag', e.target.value)}>
<option value="">All Tags</option>
{tags.map(t => <option key={t.slug} value={t.slug}>{t.title}</option>)}
</select>
</div>
);
}