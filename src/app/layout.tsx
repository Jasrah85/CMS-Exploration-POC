import './globals.css';
import { ReactNode } from 'react';
import CFPreviewProvider from '@/components/CFPreviewProvider';
import Link from 'next/link';


export default function RootLayout({ children }: { children: ReactNode }) {
return (
<html lang="en">
<body className="min-h-dvh bg-white text-gray-900">
<header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
<div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
<Link className="font-bold" href="/">Global</Link>
<nav className="text-sm flex gap-4">
<Link href="/blog">Blog</Link>
<Link href="/pressroom">Pressroom</Link>
<Link href="/preview">Preview</Link>
</nav>
</div>
</header>
<CFPreviewProvider>
<main className="mx-auto max-w-7xl p-4 md:p-6 space-y-12">{children}</main>
</CFPreviewProvider>
<footer className="mt-20 border-t">
<div className="mx-auto max-w-7xl p-6 text-sm text-gray-500">© {new Date().getFullYear()} Global</div>
</footer>
</body>
</html>
);
}