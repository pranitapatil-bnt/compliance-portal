import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { env, isKeycloakLoginConfigured } from "@/config/env";
import { readString } from "@/lib/utils/guards";

import { decodeJwtPayload, readStringList } from "./jwt";
import type { SessionRecord } from "./types";

export type OidcStart = {
  authorizationUrl: string;
  state: string;
  nonce: string;
  codeVerifier: string;
};

type TokenResponse = {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

function requiredIssuer(): string {
  if (!env.keycloak.issuer) {
    throw new Error("KEYCLOAK_ISSUER is not configured.");
  }

  return env.keycloak.issuer.replace(/\/$/, "");
}

function endpoint(path: string): string {
  return `${requiredIssuer()}/protocol/openid-connect/${path}`;
}

export function keycloakAuthorizeUrl(): string {
  return endpoint("auth");
}

export function keycloakTokenUrl(): string {
  return env.keycloak.tokenUrl ?? endpoint("token");
}

export function keycloakLogoutUrl(): string {
  return endpoint("logout");
}

export function keycloakCallbackUrl(): string {
  return `${env.appUrl.replace(/\/$/, "")}/api/auth/callback`;
}

export function keycloakPostLogoutUrl(): string {
  return `${env.appUrl.replace(/\/$/, "")}/login`;
}

function base64Url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

function randomValue(bytes = 32): string {
  return base64Url(randomBytes(bytes));
}

function pkceChallenge(verifier: string): string {
  return base64Url(createHash("sha256").update(verifier).digest());
}

export function startKeycloakLogin(): OidcStart {
  if (!isKeycloakLoginConfigured()) {
    throw new Error("Keycloak login is not configured.");
  }

  const state = randomValue();
  const nonce = randomValue();
  const codeVerifier = randomValue();
  const url = new URL(keycloakAuthorizeUrl());

  url.searchParams.set("client_id", env.keycloak.portalClientId);
  url.searchParams.set("redirect_uri", keycloakCallbackUrl());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", pkceChallenge(codeVerifier));
  url.searchParams.set("code_challenge_method", "S256");

  return {
    authorizationUrl: url.toString(),
    state,
    nonce,
    codeVerifier,
  };
}

export async function exchangeKeycloakCode(
  code: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: keycloakCallbackUrl(),
    client_id: env.keycloak.portalClientId,
    code_verifier: codeVerifier,
  });

  if (env.keycloak.portalClientSecret) {
    body.set("client_secret", env.keycloak.portalClientSecret);
  }

  const response = await fetch(keycloakTokenUrl(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const text = await response.text();
  let payload: TokenResponse;
  try {
    payload = JSON.parse(text) as TokenResponse;
  } catch {
    throw new Error("Keycloak token response was not JSON.");
  }

  if (!response.ok || payload.error || !payload.access_token) {
    throw new Error(
      payload.error_description ?? payload.error ?? "Token exchange failed.",
    );
  }

  return payload;
}

function rolesFromPayload(payload: Record<string, unknown>): string[] {
  const realmAccess = payload.realm_access;
  const realmRoles = readStringList(
    realmAccess && typeof realmAccess === "object" && "roles" in realmAccess
      ? (realmAccess as { roles?: unknown }).roles
      : undefined,
  );

  return [...new Set([...realmRoles, ...readStringList(payload.roles)])];
}

export function sessionFromTokens(
  tokens: TokenResponse,
  expectedNonce: string,
): SessionRecord {
  const idToken = tokens.id_token;
  const accessToken = tokens.access_token;

  if (!idToken || !accessToken) {
    throw new Error("Keycloak did not return id and access tokens.");
  }

  const idPayload = decodeJwtPayload(idToken);
  const accessPayload = decodeJwtPayload(accessToken);

  if (!idPayload) {
    throw new Error("Could not read the Keycloak id token.");
  }

  const nonce = readString(idPayload.nonce);
  if (nonce !== expectedNonce) {
    throw new Error("Keycloak nonce did not match.");
  }

  const username =
    readString(idPayload.preferred_username) ??
    readString(idPayload.sub) ??
    "unknown";
  const given = readString(idPayload.given_name) ?? "";
  const family = readString(idPayload.family_name) ?? "";
  const fullName = [given, family].filter(Boolean).join(" ").trim();
  const email = readString(idPayload.email) ?? username;
  const roles = rolesFromPayload(accessPayload ?? idPayload);

  return {
    userId: readString(idPayload.sub) ?? username,
    email,
    username,
    name: (readString(idPayload.name) ?? fullName) || username,
    roles,
    idToken,
  };
}

export function buildKeycloakLogoutUrl(idToken: string | undefined): string {
  const url = new URL(keycloakLogoutUrl());
  const postLogout = keycloakPostLogoutUrl();

  url.searchParams.set("client_id", env.keycloak.portalClientId);
  url.searchParams.set("redirect_uri", postLogout);
  url.searchParams.set("post_logout_redirect_uri", postLogout);

  if (idToken) {
    url.searchParams.set("id_token_hint", idToken);
  }

  return url.toString();
}
