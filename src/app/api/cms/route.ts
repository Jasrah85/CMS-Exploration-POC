// src/app/api/cms/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const value = url.searchParams.get("value") || "mock";
  const to = url.searchParams.get("to") || "/";
  const res = NextResponse.redirect(new URL(to, req.url));
  res.cookies.set("cms", value, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
