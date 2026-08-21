import "server-only";

import { env, isKeycloakApiConfigured } from "@/config/env";
import { logger } from "@/lib/logger";

type CachedToken = {
  token: string;
  expiresAt: number;
};

let cached: CachedToken | null = null;

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

export async function getServiceAccessToken(): Promise<string | null> {
  if (!isKeycloakApiConfigured() || !env.keycloak.tokenUrl) {
    return null;
  }

  const now = Date.now();
  if (cached && cached.expiresAt > now + 5_000) {
    return cached.token;
  }

  const body = new URLSearchParams({
    grant_type: "password",
    client_id: env.keycloak.apiClientId ?? "",
    client_secret: env.keycloak.apiClientSecret ?? "",
    username: env.keycloak.apiUsername ?? "",
    password: env.keycloak.apiPassword ?? "",
  });

  try {
    const response = await fetch(env.keycloak.tokenUrl, {
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
      logger.error(
        "Failed to fetch Keycloak service token",
        payload.error_description ?? payload.error ?? response.status,
      );
      cached = null;
      return null;
    }

    const expiresIn = payload.expires_in ?? 60;
    cached = {
      token: payload.access_token,
      expiresAt: now + expiresIn * 1000,
    };
    return cached.token;
  } catch (error) {
    logger.error("Keycloak service token request failed", error);
    cached = null;
    return null;
  }
}
