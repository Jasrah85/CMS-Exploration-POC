import Hero from '@/components/Hero';
import ArticleCard from '@/components/ArticleCard';
import NewsletterCta from '@/components/NewsletterCta';
import { getCMS } from '@/lib/cms';


export default async function Home() {
const cms = await getCMS();
const featured = await cms.getFeatured(6);
return (
<>
<Hero title="Reimagine your stories with AI" subtitle="Explore product, company, and community news" cta={{ href: '/blog', label: 'Explore the Blog' }} />


<section className="space-y-6">
<h2 className="text-2xl font-semibold">Featured</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
{featured.map(a => <ArticleCard key={a.id} a={a} />)}
</div>
</section>


<NewsletterCta />
</>
);
}