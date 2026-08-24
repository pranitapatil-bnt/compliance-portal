import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { OIDC_COOKIE_NAME } from "@/constants/auth";
import { routes } from "@/constants/routes";
import { openPortalSession } from "@/lib/api/portal-session";
import { exchangeKeycloakCode, sessionFromTokens } from "@/lib/auth/keycloak";
import {
  applyPortalCookie,
  applySessionCookie,
  clearAuthCookies,
  clearOidcCookie,
  readOidcCookie,
} from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function loginError(request: NextRequest, code: string) {
  const loginUrl = new URL(routes.login, request.url);
  loginUrl.searchParams.set("error", code);
  const response = NextResponse.redirect(loginUrl);
  clearAuthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const oidcError = params.get("error");
  if (oidcError) {
    logger.warn("Keycloak returned an error", oidcError);
    return loginError(
      request,
      oidcError === "access_denied" ? "access_denied" : "token_exchange",
    );
  }

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) {
    return loginError(request, "missing_code");
  }

  const oidc = readOidcCookie(request.cookies.get(OIDC_COOKIE_NAME)?.value);
  if (!oidc || oidc.state !== state) {
    return loginError(request, "invalid_state");
  }

  try {
    const tokens = await exchangeKeycloakCode(code, oidc.codeVerifier);
    const record = sessionFromTokens(tokens, oidc.nonce);
    const jsessionId = await openPortalSession(record);
    const response = NextResponse.redirect(new URL(oidc.from, request.url));
    applySessionCookie(response, record);
    clearOidcCookie(response);
    if (jsessionId) {
      applyPortalCookie(response, record.username, jsessionId);
    }
    logger.info("User signed in", {
      userId: record.userId,
      username: record.username,
      portalSession: Boolean(jsessionId),
    });
    return response;
  } catch (error) {
    logger.error("Keycloak token exchange failed", error);
    return loginError(request, "token_exchange");
  }
}
