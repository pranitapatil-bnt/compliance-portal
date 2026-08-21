import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/constants/auth";
import { isKeycloakLoginConfigured } from "@/config/env";
import { routes } from "@/constants/routes";
import { buildKeycloakLogoutUrl } from "@/lib/auth/keycloak";
import { clearAuthCookies, readSessionRecord } from "@/lib/auth/session";
import { clearPortalSessionCache } from "@/lib/api/portal-session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const record = readSessionRecord(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  clearPortalSessionCache();
  const loginUrl = new URL(routes.login, request.url);

  if (isKeycloakLoginConfigured()) {
    const response = NextResponse.redirect(
      buildKeycloakLogoutUrl(record?.idToken),
    );
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.redirect(loginUrl);
  clearAuthCookies(response);
  return response;
}
