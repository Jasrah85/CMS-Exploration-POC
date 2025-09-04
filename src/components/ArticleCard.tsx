import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/lib/models';


export default function ArticleCard({ a }: { a: Article }) {
return (
<article className="group rounded-2xl border p-4 hover:shadow-md transition">
{a.hero?.url && (
<Link href={`/blog/${a.slug}`} className="block overflow-hidden rounded-xl">
<Image src={a.hero.url} alt={a.hero.alt || ''} width={800} height={500} className="aspect-[16/9] object-cover group-hover:scale-105 transition" />
</Link>
)}
<div className="mt-3">
<div className="text-xs text-gray-500">{a.publishedAt && new Date(a.publishedAt).toLocaleDateString()}</div>
<h3 className="mt-1 text-lg font-semibold leading-snug">
<Link href={`/blog/${a.slug}`}>{a.title}</Link>
</h3>
{a.excerpt && <p className="mt-2 text-sm text-gray-700 line-clamp-3">{a.excerpt}</p>}
</div>
</article>
);
}