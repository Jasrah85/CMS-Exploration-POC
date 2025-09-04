// src/app/api/preview/exit/route.ts
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const dm = await draftMode();  // <-- await
  dm.disable();
  const url = new URL(req.url);
  const to = url.searchParams.get("to") || "/blog";
  return NextResponse.redirect(new URL(to, req.url));
}
