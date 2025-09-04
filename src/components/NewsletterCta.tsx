export default function NewsletterCta() {
return (
<section className="rounded-2xl bg-gray-100 p-8 text-center">
<h3 className="text-2xl font-semibold">Get the latest articles in your inbox.</h3>
<form className="mt-4 flex gap-2 justify-center">
<input type="email" placeholder="you@example.com" className="rounded-xl border px-3 py-2 w-72" />
<button className="rounded-2xl bg-brand text-white px-4 py-2">Subscribe</button>
</form>
</section>
);
}