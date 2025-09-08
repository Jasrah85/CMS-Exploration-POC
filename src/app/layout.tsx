// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
import CFPreviewProvider from "@/components/CFPreviewProvider";
import CMSSwitcher from "@/components/CMSSwitcher.client";


export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const bag = await cookies();
    const cms = bag.get("cms")?.value ?? process.env.NEXT_PUBLIC_CMS ?? "mock";
    return (
        <html lang="en">
            <body className="min-h-dvh bg-white text-gray-900">
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
                    <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
                        <Link className="font-bold" href="/">Global</Link>
                        <nav className="text-sm flex gap-4">
                            <Link href="/blog">Blog</Link>
                        </nav>
                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-sm text-gray-500">CMS:</span>
                            <CMSSwitcher current={cms} />
                        </div>
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