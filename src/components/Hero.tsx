import Image from 'next/image';
import Link from 'next/link';


export default function Hero({
title,
subtitle,
cta,
image
}: { title: string; subtitle?: string; cta?: { href: string; label: string }; image?: { src: string; alt?: string } }) {
return (
<section className="relative overflow-hidden rounded-2xl bg-brand-light p-8 md:p-12">
<div className="max-w-3xl">
<h1 className="text-3xl md:text-5xl font-bold leading-tight">{title}</h1>
{subtitle && <p className="mt-4 text-lg text-gray-700">{subtitle}</p>}
{cta && (
<Link className="inline-block mt-6 rounded-2xl bg-brand px-5 py-3 text-white font-medium" href={cta.href}>
{cta.label}
</Link>
)}
</div>
{image && (
<div className="absolute right-4 bottom-0 hidden md:block opacity-80">
<Image src={image.src} alt={image.alt || ''} width={320} height={200} />
</div>
)}
</section>
);
}