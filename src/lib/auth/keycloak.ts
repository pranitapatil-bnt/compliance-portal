import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { env, isKeycloakLoginConfigured } from "@/config/env";
import { logger } from "@/lib/logger";
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
  url.searchParams.set("prompt", "login");

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
  const expiresAt =
    typeof accessPayload?.exp === "number"
      ? accessPayload.exp * 1000
      : Date.now() + 60_000;

  return {
    userId: readString(idPayload.sub) ?? username,
    email,
    username,
    name: (readString(idPayload.name) ?? fullName) || username,
    roles,
    idToken,
    accessToken,
    refreshToken: tokens.refresh_token,
    accessTokenExpiresAt: expiresAt,
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

export async function refreshKeycloakTokens(
  refreshToken: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: env.keycloak.portalClientId,
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

  const payload = (await response.json()) as TokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description ?? payload.error ?? "Token refresh failed.",
    );
  }

  return payload;
}

type TokenExchangeClient = {
  id: string;
  secret?: string;
};

function exchangeClients(): TokenExchangeClient[] {
  const clients: TokenExchangeClient[] = [
    {
      id: env.keycloak.portalClientId,
      secret: env.keycloak.portalClientSecret,
    },
  ];

  if (
    env.keycloak.apiClientId &&
    env.keycloak.apiClientId !== env.keycloak.portalClientId
  ) {
    clients.push({
      id: env.keycloak.apiClientId,
      secret: env.keycloak.apiClientSecret,
    });
  }

  return clients;
}

function exchangeAudiences(): Array<string | undefined> {
  return [
    "compliance-portal",
    env.keycloak.portalClientId,
    env.keycloak.issuer?.replace(/\/$/, ""),
    undefined,
  ];
}

export async function exchangeAccessTokenForSaml(
  accessToken: string,
  options: { refreshToken?: string } = {},
): Promise<string | null> {
  const subjects: Array<{ token: string; type: string }> = [
    {
      token: accessToken,
      type: "urn:ietf:params:oauth:token-type:access_token",
    },
  ];
  if (options.refreshToken) {
    subjects.push({
      token: options.refreshToken,
      type: "urn:ietf:params:oauth:token-type:refresh_token",
    });
  }

  let lastError = "token exchange failed";

  for (const client of exchangeClients()) {
    for (const audience of exchangeAudiences()) {
      for (const subject of subjects) {
        const body = new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
          subject_token: subject.token,
          subject_token_type: subject.type,
          requested_token_type: "urn:ietf:params:oauth:token-type:saml2",
          client_id: client.id,
        });
        if (client.secret) {
          body.set("client_secret", client.secret);
        }
        if (audience) {
          body.set("audience", audience);
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

        const payload = (await response.json()) as TokenResponse;
        if (response.ok && payload.access_token) {
          return payload.access_token;
        }

        lastError = payload.error_description ?? payload.error ?? lastError;
        if (
          response.status === 501 ||
          payload.error === "Feature not enabled"
        ) {
          logger.warn("Keycloak SAML token exchange is not enabled");
          return null;
        }
      }
    }
  }

  logger.warn("Keycloak SAML token exchange failed", lastError);
  return null;
}
