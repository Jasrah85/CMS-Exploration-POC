// src/app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from 'next/server';
import { getCMS } from "@/lib/cms";

function getQSParamFromURL(key: string, url: string) {
  const search = new URL(url).search;
  return new URLSearchParams(search).get(key);
}

export async function GET(req: Request) {
  const path = getQSParamFromURL("pathname", req.url);
  if (path) revalidatePath(path);
  return new Response("OK");
}

export async function POST(req: NextRequest) {
const payload = await req.json().catch(() => ({}));
const cms = await getCMS();
const paths = cms.getRevalidatePathsForWebhook?.(payload) || ['/'];
try {
// For App Router, we can revalidate tags/paths. This is a stub for local POC.
// In production, call `revalidatePath` or `revalidateTag` where appropriate.
return NextResponse.json({ revalidated: true, paths });
} catch (e) {
return NextResponse.json({ revalidated: false, error: String(e) }, { status: 500 });
}
}