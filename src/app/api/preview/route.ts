// src/app/api/preview/route.ts
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const dm = await draftMode();  // <-- await
  dm.enable();
  const url = new URL(req.url);
  const to = url.searchParams.get("to") || "/blog";
  return NextResponse.redirect(new URL(to, req.url));
}
