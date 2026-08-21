import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isKeycloakLoginConfigured } from "@/config/env";
import { routes } from "@/constants/routes";
import { startKeycloakLogin } from "@/lib/auth/keycloak";
import { safeReturnPath } from "@/lib/auth/return-path";
import { applyOidcCookie, getSession } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (session) {
    return NextResponse.redirect(new URL(routes.home, request.url));
  }

  if (!isKeycloakLoginConfigured()) {
    logger.error("Keycloak portal client is not configured");
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("error", "not_configured");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const oidc = startKeycloakLogin();
    const response = NextResponse.redirect(oidc.authorizationUrl);
    applyOidcCookie(response, {
      state: oidc.state,
      nonce: oidc.nonce,
      codeVerifier: oidc.codeVerifier,
      from: safeReturnPath(request.nextUrl.searchParams.get("from")),
    });
    return response;
  } catch (error) {
    logger.error("Failed to start Keycloak login", error);
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("error", "not_configured");
    return NextResponse.redirect(loginUrl);
  }
}
