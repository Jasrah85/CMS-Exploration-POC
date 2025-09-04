import ArticleCard from '@/components/ArticleCard';
import { getCMS } from "@/lib/cms";


export default async function PressroomPage() {
const cms = await getCMS();
const releases = await cms.getArticles({ tag: 'press-release', pageSize: 9 });


return (
<div className="space-y-6">
<h1 className="text-3xl font-bold">Pressroom</h1>
<p className="text-gray-600">Company announcements, media resources, executive bios, and contacts.</p>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
{releases.items.map(a => <ArticleCard key={a.id} a={a} />)}
</div>
</div>
);
}