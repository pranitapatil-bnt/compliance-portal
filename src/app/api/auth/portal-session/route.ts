import { NextResponse } from "next/server";

import { getPortalSessionCookie } from "@/lib/api/portal-session";
import { applyPortalCookie, getSessionRecord } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const record = await getSessionRecord();
  if (!record) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cookie = await getPortalSessionCookie();
  const jsessionId = cookie?.startsWith("JSESSIONID=")
    ? cookie.slice("JSESSIONID=".length)
    : undefined;
  const response = NextResponse.json({ ok: Boolean(jsessionId) });
  if (jsessionId) {
    applyPortalCookie(response, record.username, jsessionId);
  }
  return response;
}
