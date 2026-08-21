import "server-only";

import { env } from "@/config/env";
import {
  exchangeAccessTokenForSaml,
  refreshKeycloakTokens,
} from "@/lib/auth/keycloak";
import { getSessionRecord } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

type CookieJar = Map<string, string>;

type CachedPortalSession = {
  username: string;
  jsessionId: string;
  expiresAt: number;
};

const SESSION_TTL_MS = 25 * 60 * 1000;

let cached: CachedPortalSession | null = null;
let bootstrapPromise: Promise<string | null> | null = null;

function cookieHeader(jar: CookieJar): string {
  return [...jar.entries()]
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function storeSetCookies(jar: CookieJar, headers: Headers): void {
  const raw =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : [headers.get("set-cookie") ?? ""];

  for (const entry of raw) {
    const pair = entry.split(";")[0];
    if (!pair) {
      continue;
    }
    const separator = pair.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    jar.set(pair.slice(0, separator).trim(), pair.slice(separator + 1).trim());
  }
}

async function request(
  url: string,
  jar: CookieJar,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const cookie = cookieHeader(jar);
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const response = await fetch(url, {
    ...init,
    headers,
    redirect: "manual",
    cache: "no-store",
  });
  storeSetCookies(jar, response.headers);
  return response;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
}

function firstMatch(html: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    const value = match?.[1];
    if (value) {
      return decodeEntities(value);
    }
  }
  return undefined;
}

function resolveUrl(base: string, maybeRelative: string): string {
  return new URL(maybeRelative, base).toString();
}

function readJsessionId(jar: CookieJar): string | null {
  for (const [name, value] of jar.entries()) {
    if (name.toUpperCase() === "JSESSIONID" && value.length > 0) {
      return value;
    }
  }
  return null;
}

function portalRoot(): string {
  const base = env.apiBaseUrl?.replace(/\/$/, "");
  if (!base) {
    throw new Error("API_BASE_URL is not configured");
  }
  return base;
}

async function postSamlResponse(
  jar: CookieJar,
  acsUrl: string,
  samlResponse: string,
  relayState?: string,
): Promise<string | null> {
  const body = new URLSearchParams({ SAMLResponse: samlResponse });
  if (relayState) {
    body.set("RelayState", relayState);
  }

  const response = await request(acsUrl, jar, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "text/html,application/xhtml+xml",
    },
    body,
  });

  return readJsessionId(jar) ?? (response.ok ? readJsessionId(jar) : null);
}

async function bootstrapFromSamlAssertion(
  assertion: string,
): Promise<string | null> {
  const jar: CookieJar = new Map();
  const acsUrl = `${portalRoot()}/saml`;
  const posted = await postSamlResponse(jar, acsUrl, assertion);
  if (posted) {
    return posted;
  }
  return readJsessionId(jar);
}

async function completeKeycloakLogin(
  jar: CookieJar,
  loginUrl: string,
  html: string,
  username: string,
  password: string,
): Promise<string | null> {
  const action =
    firstMatch(html, [
      /<form[^>]*action=["']([^"']+)["'][^>]*>/i,
      /action=["']([^"']+)["']/i,
    ]) ?? loginUrl;
  const actionUrl = resolveUrl(loginUrl, action);

  const body = new URLSearchParams();
  const hidden = html.matchAll(/<input[^>]*type=["']hidden["'][^>]*>/gi);
  for (const input of hidden) {
    const tag = input[0];
    const name = /name=["']([^"']+)["']/i.exec(tag)?.[1];
    const value = /value=["']([^"']*)["']/i.exec(tag)?.[1] ?? "";
    if (name) {
      body.set(name, decodeEntities(value));
    }
  }
  body.set("username", username);
  body.set("password", password);
  body.set("credentialId", body.get("credentialId") ?? "");

  const response = await request(actionUrl, jar, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "text/html,application/xhtml+xml",
    },
    body,
  });

  const nextLocation = response.headers.get("location");
  const nextHtml = await response.text();
  return continueSaml(jar, nextLocation, nextHtml, response.url || actionUrl);
}

async function continueSaml(
  jar: CookieJar,
  location: string | null,
  html: string,
  currentUrl: string,
): Promise<string | null> {
  const samlResponse = firstMatch(html, [
    /name=["']SAMLResponse["'][^>]*value=["']([^"']+)["']/i,
    /value=["']([^"']+)["'][^>]*name=["']SAMLResponse["']/i,
  ]);
  if (samlResponse) {
    const acs =
      firstMatch(html, [/<form[^>]*action=["']([^"']+)["']/i]) ??
      `${portalRoot()}/saml`;
    const relayState = firstMatch(html, [
      /name=["']RelayState["'][^>]*value=["']([^"']*)["']/i,
      /value=["']([^"']*)["'][^>]*name=["']RelayState["']/i,
    ]);
    return postSamlResponse(
      jar,
      resolveUrl(currentUrl, acs),
      samlResponse,
      relayState,
    );
  }

  if (location) {
    const next = await request(resolveUrl(currentUrl, location), jar, {
      method: "GET",
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
    const nextHtml = await next.text();
    return continueSaml(
      jar,
      next.headers.get("location"),
      nextHtml,
      next.url || resolveUrl(currentUrl, location),
    );
  }

  return readJsessionId(jar);
}

async function bootstrapFromPassword(
  username: string,
  password: string,
): Promise<string | null> {
  const jar: CookieJar = new Map();
  const start = await request(portalRoot() + "/", jar, {
    method: "GET",
    headers: { Accept: "text/html,application/xhtml+xml" },
  });

  const existing = readJsessionId(jar);
  if (existing && start.status < 400 && !isRedirectStatus(start.status)) {
    return existing;
  }

  const location = start.headers.get("location");
  if (!location) {
    return readJsessionId(jar);
  }

  const loginPage = await request(
    resolveUrl(portalRoot() + "/", location),
    jar,
    {
      method: "GET",
      headers: { Accept: "text/html,application/xhtml+xml" },
    },
  );
  const html = await loginPage.text();

  if (/name=["']SAMLResponse["']/i.test(html)) {
    return continueSaml(jar, null, html, loginPage.url || location);
  }

  if (
    /name=["']username["']/i.test(html) ||
    /name=["']password["']/i.test(html)
  ) {
    return completeKeycloakLogin(
      jar,
      loginPage.url || location,
      html,
      username,
      password,
    );
  }

  return continueSaml(
    jar,
    loginPage.headers.get("location"),
    html,
    loginPage.url || location,
  );
}

function isRedirectStatus(status: number): boolean {
  return (
    status === 301 ||
    status === 302 ||
    status === 303 ||
    status === 307 ||
    status === 308
  );
}

async function currentAccessToken(): Promise<string | null> {
  const record = await getSessionRecord();
  if (!record?.accessToken) {
    return null;
  }

  if (
    record.accessTokenExpiresAt &&
    record.accessTokenExpiresAt > Date.now() + 15_000
  ) {
    return record.accessToken;
  }

  if (!record.refreshToken) {
    return record.accessToken;
  }

  try {
    const refreshed = await refreshKeycloakTokens(record.refreshToken);
    return refreshed.access_token ?? record.accessToken;
  } catch {
    return record.accessToken;
  }
}

async function bootstrapPortalSession(): Promise<string | null> {
  const record = await getSessionRecord();
  if (!record) {
    return null;
  }

  const accessToken = await currentAccessToken();
  if (accessToken) {
    const assertion = await exchangeAccessTokenForSaml(accessToken);
    if (assertion) {
      const fromSaml = await bootstrapFromSamlAssertion(assertion);
      if (fromSaml) {
        logger.info("Opened Java portal session via token exchange");
        return fromSaml;
      }
    }
  }

  const password = env.portalSsoPassword;
  if (password) {
    const fromPassword = await bootstrapFromPassword(record.username, password);
    if (fromPassword) {
      logger.info("Opened Java portal session via SSO password");
      return fromPassword;
    }
  }

  logger.warn(
    "Could not open a Java portal session. Sign-in succeeded, but queue APIs still need SAML. Set PORTAL_SSO_PASSWORD to the same password used at Keycloak.",
  );
  return null;
}

export async function getPortalSessionCookie(): Promise<string | undefined> {
  if (env.portalJsessionId) {
    return `JSESSIONID=${env.portalJsessionId}`;
  }

  const record = await getSessionRecord();
  if (
    cached &&
    cached.expiresAt > Date.now() &&
    cached.username === record?.username
  ) {
    return `JSESSIONID=${cached.jsessionId}`;
  }

  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapPortalSession().finally(() => {
      bootstrapPromise = null;
    });
  }

  const jsessionId = await bootstrapPromise;
  if (!jsessionId || !record) {
    return undefined;
  }

  cached = {
    username: record.username,
    jsessionId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  return `JSESSIONID=${jsessionId}`;
}

export function clearPortalSessionCache(): void {
  cached = null;
}
