import "server-only";

import { cookies } from "next/headers";

import { env, readPortalApiBase } from "@/config/env";
import {
  PORTAL_COOKIE_NAME,
  PORTAL_SESSION_MAX_AGE_SECONDS,
} from "@/constants/auth";
import {
  exchangeAccessTokenForSaml,
  refreshKeycloakTokens,
} from "@/lib/auth/keycloak";
import {
  encodePortalCookieValue,
  getPortalCookie,
  getSessionRecord,
} from "@/lib/auth/session";
import type { SessionRecord } from "@/lib/auth/types";
import { logger } from "@/lib/logger";

type HostCookieJar = Map<string, Map<string, string>>;

type CachedPortalSession = {
  username: string;
  jsessionId: string;
  expiresAt: number;
};

const SESSION_TTL_MS = PORTAL_SESSION_MAX_AGE_SECONDS * 1000;
const MAX_SAML_HOPS = 12;

let cached: CachedPortalSession | null = null;
let bootstrapPromise: Promise<string | null> | null = null;

function hostOf(url: string): string {
  return new URL(url).host;
}

function cookiesFor(jar: HostCookieJar, url: string): Map<string, string> {
  const host = hostOf(url);
  const existing = jar.get(host);
  if (existing) {
    return existing;
  }
  const created = new Map<string, string>();
  jar.set(host, created);
  return created;
}

function cookieHeader(jar: HostCookieJar, url: string): string {
  return [...cookiesFor(jar, url).entries()]
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function storeSetCookies(
  jar: HostCookieJar,
  url: string,
  headers: Headers,
): void {
  const raw =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : [headers.get("set-cookie") ?? ""];
  const cookiesForHost = cookiesFor(jar, url);

  for (const entry of raw) {
    const pair = entry.split(";")[0];
    if (!pair) {
      continue;
    }
    const separator = pair.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    cookiesForHost.set(
      pair.slice(0, separator).trim(),
      pair.slice(separator + 1).trim(),
    );
  }
}

async function request(
  url: string,
  jar: HostCookieJar,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const cookie = cookieHeader(jar, url);
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const response = await fetch(url, {
    ...init,
    headers,
    redirect: "manual",
    cache: "no-store",
  });
  storeSetCookies(jar, url, response.headers);
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

function isRedirectStatus(status: number): boolean {
  return (
    status === 301 ||
    status === 302 ||
    status === 303 ||
    status === 307 ||
    status === 308
  );
}

function looksLikeLoginPage(text: string): boolean {
  const sample = text.slice(0, 800).toLowerCase();
  return (
    sample.includes("samlrequest") ||
    sample.includes("kc-form-login") ||
    sample.includes('name="password"') ||
    sample.includes("sign in to") ||
    (sample.includes("<html") && sample.includes("keycloak"))
  );
}

function portalRoot(): string {
  return readPortalApiBase();
}

function readJsessionId(jar: HostCookieJar): string | null {
  const portalHost = hostOf(portalRoot() + "/");
  const hosts = [portalHost, ...jar.keys()];
  for (const host of hosts) {
    const cookiesForHost = jar.get(host);
    if (!cookiesForHost) {
      continue;
    }
    for (const [name, value] of cookiesForHost.entries()) {
      if (name.toUpperCase() === "JSESSIONID" && value.length > 0) {
        return value;
      }
    }
  }
  return null;
}

function asSamlResponse(token: string): string {
  const trimmed = token.trim();
  if (trimmed.startsWith("<")) {
    return Buffer.from(trimmed, "utf8").toString("base64");
  }
  if (trimmed.includes("-") || trimmed.includes("_")) {
    return trimmed.replace(/-/g, "+").replace(/_/g, "/");
  }
  return trimmed;
}

async function followRedirects(
  jar: HostCookieJar,
  startUrl: string,
  start: Response,
): Promise<{ url: string; response: Response; html: string }> {
  let url = startUrl;
  let response = start;
  let hops = 0;

  while (isRedirectStatus(response.status) && hops < MAX_SAML_HOPS) {
    const location = response.headers.get("location");
    if (!location) {
      break;
    }
    url = resolveUrl(url, location);
    response = await request(url, jar, {
      method: "GET",
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
    hops += 1;
  }

  return { url, response, html: await response.text() };
}

async function verifyPortalSession(jsessionId: string): Promise<boolean> {
  const response = await fetch(`${portalRoot()}/regQueue`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      Cookie: `JSESSIONID=${jsessionId}`,
    },
    body: JSON.stringify({
      filter: {
        keyword: null,
        status: null,
        custType: null,
        organization: null,
        legalEntity: null,
        dateFrom: null,
        dateTo: null,
      },
      page: {
        currentPage: 1,
        minRecord: 1,
        maxRecord: 1,
        totalRecords: 0,
        totalPages: 0,
      },
      isFilterApply: false,
      isRequestFromReportPage: false,
      custType: null,
    }),
    redirect: "manual",
    cache: "no-store",
  });

  if (
    isRedirectStatus(response.status) ||
    response.status === 401 ||
    response.status === 403
  ) {
    return false;
  }

  const text = await response.text();
  if (looksLikeLoginPage(text)) {
    return false;
  }

  try {
    JSON.parse(text);
    return response.ok;
  } catch {
    return false;
  }
}

async function postSamlResponse(
  jar: HostCookieJar,
  acsUrl: string,
  samlResponse: string,
  relayState?: string,
): Promise<string | null> {
  const body = new URLSearchParams({
    SAMLResponse: asSamlResponse(samlResponse),
  });
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

  const followed = await followRedirects(jar, acsUrl, response);
  const jsessionId = readJsessionId(jar);
  if (!jsessionId || looksLikeLoginPage(followed.html)) {
    return null;
  }
  return jsessionId;
}

async function bootstrapFromSamlAssertion(
  assertion: string,
): Promise<string | null> {
  const jar: HostCookieJar = new Map();
  return postSamlResponse(jar, `${portalRoot()}/saml`, assertion);
}

async function completeKeycloakLogin(
  jar: HostCookieJar,
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
  const nextHtml = isRedirectStatus(response.status)
    ? ""
    : await response.text();

  if (
    !isRedirectStatus(response.status) &&
    /name=["']password["']/i.test(nextHtml)
  ) {
    logger.warn("Java portal Keycloak login was rejected");
    return null;
  }

  return continueSaml(
    jar,
    nextLocation,
    nextHtml,
    response.url || actionUrl,
    0,
  );
}

async function continueSaml(
  jar: HostCookieJar,
  location: string | null,
  html: string,
  currentUrl: string,
  hops: number,
): Promise<string | null> {
  if (hops > MAX_SAML_HOPS) {
    return null;
  }

  const formSaml = firstMatch(html, [
    /name=["']SAMLResponse["'][^>]*value=["']([^"']+)["']/i,
    /value=["']([^"']+)["'][^>]*name=["']SAMLResponse["']/i,
  ]);
  if (formSaml) {
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
      formSaml,
      relayState,
    );
  }

  if (location) {
    const nextUrl = resolveUrl(currentUrl, location);
    const next = await request(nextUrl, jar, {
      method: "GET",
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
    const nextHtml = isRedirectStatus(next.status) ? "" : await next.text();
    return continueSaml(
      jar,
      next.headers.get("location"),
      nextHtml,
      next.url || nextUrl,
      hops + 1,
    );
  }

  if (
    /name=["']username["']/i.test(html) ||
    /name=["']password["']/i.test(html) ||
    looksLikeLoginPage(html)
  ) {
    return null;
  }

  return readJsessionId(jar);
}

async function bootstrapFromPassword(
  username: string,
  password: string,
): Promise<string | null> {
  const jar: HostCookieJar = new Map();
  const startUrl = `${portalRoot()}/`;
  const start = await request(startUrl, jar, {
    method: "GET",
    headers: { Accept: "text/html,application/xhtml+xml" },
  });
  const followed = await followRedirects(jar, startUrl, start);
  const html = followed.html;

  if (/name=["']SAMLResponse["']/i.test(html)) {
    return continueSaml(jar, null, html, followed.url, 0);
  }

  if (
    /name=["']username["']/i.test(html) ||
    /name=["']password["']/i.test(html)
  ) {
    return completeKeycloakLogin(jar, followed.url, html, username, password);
  }

  return continueSaml(
    jar,
    followed.response.headers.get("location"),
    html,
    followed.url,
    0,
  );
}

async function accessTokenFor(record: SessionRecord): Promise<string | null> {
  if (
    record.accessToken &&
    record.accessTokenExpiresAt &&
    record.accessTokenExpiresAt > Date.now() + 15_000
  ) {
    return record.accessToken;
  }

  if (!record.refreshToken) {
    return record.accessToken ?? null;
  }

  try {
    const refreshed = await refreshKeycloakTokens(record.refreshToken);
    return refreshed.access_token ?? record.accessToken ?? null;
  } catch {
    return record.accessToken ?? null;
  }
}

function uniqueNames(record: SessionRecord, extra?: string): string[] {
  return [
    ...new Set(
      [
        env.portalSsoUsername,
        extra,
        record.username,
        record.email,
        env.keycloak.apiUsername,
      ].filter((value): value is string => Boolean(value)),
    ),
  ];
}

function remember(username: string, jsessionId: string): void {
  cached = {
    username,
    jsessionId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
}

async function tryPersistPortalCookie(
  username: string,
  jsessionId: string,
): Promise<void> {
  try {
    const store = await cookies();
    store.set(
      PORTAL_COOKIE_NAME,
      encodePortalCookieValue(username, jsessionId),
      {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: PORTAL_SESSION_MAX_AGE_SECONDS,
      },
    );
  } catch {
    // Server Components cannot always set cookies.
  }
}

export async function openPortalSession(
  record: SessionRecord,
  password?: string,
  typedUsername?: string,
): Promise<string | null> {
  const passwords = [
    ...new Set(
      [password, env.portalSsoPassword, env.keycloak.apiPassword].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  ];
  if (passwords.length > 0) {
    for (const secret of passwords) {
      for (const username of uniqueNames(record, typedUsername)) {
        const fromPassword = await bootstrapFromPassword(username, secret);
        if (fromPassword && (await verifyPortalSession(fromPassword))) {
          logger.info("Opened Java portal session via password", username);
          remember(record.username, fromPassword);
          return fromPassword;
        }
      }
    }
    logger.warn("Password login did not open a usable Java portal session");
  }

  const accessToken = await accessTokenFor(record);
  if (accessToken) {
    const assertion = await exchangeAccessTokenForSaml(accessToken, {
      refreshToken: record.refreshToken,
    });
    if (assertion) {
      const fromSaml = await bootstrapFromSamlAssertion(assertion);
      if (fromSaml && (await verifyPortalSession(fromSaml))) {
        logger.info("Opened Java portal session via token exchange");
        remember(record.username, fromSaml);
        return fromSaml;
      }
      logger.warn("SAML assertion did not open a usable Java session");
    }
  }

  logger.warn("Could not open a Java portal session after Keycloak sign-in");
  return null;
}

export async function getPortalSessionCookie(
  options: { forceRefresh?: boolean } = {},
): Promise<string | undefined> {
  if (env.portalJsessionId && !options.forceRefresh) {
    return `JSESSIONID=${env.portalJsessionId}`;
  }

  const record = await getSessionRecord();
  if (!record) {
    return undefined;
  }

  if (!options.forceRefresh) {
    const stored = await getPortalCookie();
    if (stored && stored.username === record.username) {
      remember(record.username, stored.jsessionId);
      return `JSESSIONID=${stored.jsessionId}`;
    }

    if (
      cached &&
      cached.expiresAt > Date.now() &&
      cached.username === record.username
    ) {
      return `JSESSIONID=${cached.jsessionId}`;
    }
  }

  if (!bootstrapPromise) {
    bootstrapPromise = openPortalSession(record).finally(() => {
      bootstrapPromise = null;
    });
  }

  const jsessionId = await bootstrapPromise;
  if (!jsessionId) {
    return undefined;
  }

  remember(record.username, jsessionId);
  await tryPersistPortalCookie(record.username, jsessionId);
  return `JSESSIONID=${jsessionId}`;
}

export function clearPortalSessionCache(): void {
  cached = null;
  bootstrapPromise = null;
}

export async function invalidatePortalSession(): Promise<void> {
  clearPortalSessionCache();
  try {
    const store = await cookies();
    store.set(PORTAL_COOKIE_NAME, "", {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  } catch {
    // Server Components cannot always clear cookies.
  }
}
