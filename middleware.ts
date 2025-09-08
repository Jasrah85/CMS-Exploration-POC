// middleware.ts (project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const cms = url.searchParams.get("cms");
  if (!cms) return NextResponse.next();

  const next = NextResponse.redirect(new URL(url.pathname + url.search.replace(/(^|&)cms=[^&]*/,'').replace(/^&/,'').replace(/\?&/,'?'), req.url));
  next.cookies.set("cms", cms, { path: "/", maxAge: 60 * 60 * 24 * 30 }); // 30 days
  return next;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
