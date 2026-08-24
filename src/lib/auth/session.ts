import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { env } from "@/config/env";
import {
  OIDC_COOKIE_NAME,
  OIDC_MAX_AGE_SECONDS,
  PORTAL_COOKIE_NAME,
  PORTAL_SESSION_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  TOKENS_COOKIE_NAME,
} from "@/constants/auth";
import { isRecord, readString } from "@/lib/utils/guards";

import { readStringList } from "./jwt";
import type { Session, SessionRecord } from "./types";

export type { Session, SessionRecord };

export type OidcCookie = {
  state: string;
  nonce: string;
  codeVerifier: string;
  from: string;
};

const sessionCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

const oidcCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: OIDC_MAX_AGE_SECONDS,
};

const portalCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: PORTAL_SESSION_MAX_AGE_SECONDS,
};

export type PortalCookie = {
  username: string;
  jsessionId: string;
};

function sign(value: string): string {
  return createHmac("sha256", env.sessionSecret)
    .update(value)
    .digest("base64url");
}

function isValidSignature(value: string, signature: string): boolean {
  const expected = Buffer.from(sign(value));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function encodeSigned(value: string): string {
  return `${value}.${sign(value)}`;
}

function decodeSigned(raw: string): string | null {
  const separator = raw.lastIndexOf(".");
  if (separator <= 0) {
    return null;
  }

  const value = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  return isValidSignature(value, signature) ? value : null;
}

function encodeJson(value: unknown): string {
  return encodeSigned(
    Buffer.from(JSON.stringify(value), "utf8").toString("base64url"),
  );
}

function decodeJson(raw: string): unknown {
  const value = decodeSigned(raw);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as unknown;
  } catch {
    return null;
  }
}

function toPublicSession(record: SessionRecord): Session {
  return {
    userId: record.userId,
    email: record.email,
    username: record.username,
    name: record.name,
    roles: record.roles,
  };
}

function parseSessionRecord(value: unknown): SessionRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const userId = readString(value.userId);
  const email = readString(value.email);
  const username = readString(value.username);
  const name = readString(value.name);
  const idToken = readString(value.idToken);
  const accessToken = readString(value.accessToken);
  const refreshToken = readString(value.refreshToken);
  const exp = typeof value.exp === "number" ? value.exp : 0;
  const accessTokenExpiresAt =
    typeof value.accessTokenExpiresAt === "number"
      ? value.accessTokenExpiresAt
      : undefined;

  if (!userId || !email || !username || !name || !idToken || exp < Date.now()) {
    return null;
  }

  return {
    userId,
    email,
    username,
    name,
    roles: readStringList(value.roles),
    idToken,
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
  };
}

function parseOidcCookie(value: unknown): OidcCookie | null {
  if (!isRecord(value)) {
    return null;
  }

  const state = readString(value.state);
  const nonce = readString(value.nonce);
  const codeVerifier = readString(value.codeVerifier);
  const from = readString(value.from);

  if (!state || !nonce || !codeVerifier || !from) {
    return null;
  }

  return { state, nonce, codeVerifier, from };
}

export function readOidcCookie(raw: string | undefined): OidcCookie | null {
  if (!raw) {
    return null;
  }

  return parseOidcCookie(decodeJson(raw));
}

function parsePortalCookie(value: unknown): PortalCookie | null {
  if (!isRecord(value)) {
    return null;
  }

  const username = readString(value.username);
  const jsessionId = readString(value.jsessionId);
  const exp = typeof value.exp === "number" ? value.exp : 0;

  if (!username || !jsessionId || exp < Date.now()) {
    return null;
  }

  return { username, jsessionId };
}

export function readPortalCookie(raw: string | undefined): PortalCookie | null {
  if (!raw) {
    return null;
  }

  return parsePortalCookie(decodeJson(raw));
}

export async function getPortalCookie(): Promise<PortalCookie | null> {
  const store = await cookies();
  return readPortalCookie(store.get(PORTAL_COOKIE_NAME)?.value);
}

export function readSessionRecord(
  raw: string | undefined,
): SessionRecord | null {
  if (!raw) {
    return null;
  }

  return parseSessionRecord(decodeJson(raw));
}

function parseTokenCookie(raw: string | undefined): {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
} | null {
  if (!raw) {
    return null;
  }

  const value = decodeJson(raw);
  if (!isRecord(value)) {
    return null;
  }

  return {
    accessToken: readString(value.accessToken),
    refreshToken: readString(value.refreshToken),
    accessTokenExpiresAt:
      typeof value.accessTokenExpiresAt === "number"
        ? value.accessTokenExpiresAt
        : undefined,
  };
}

export async function getSessionRecord(): Promise<SessionRecord | null> {
  const store = await cookies();
  const record = readSessionRecord(store.get(SESSION_COOKIE_NAME)?.value);
  if (!record) {
    return null;
  }

  const tokens = parseTokenCookie(store.get(TOKENS_COOKIE_NAME)?.value);
  return tokens ? { ...record, ...tokens } : record;
}

export async function getSession(): Promise<Session | null> {
  const record = await getSessionRecord();
  return record ? toPublicSession(record) : null;
}

export async function getOidcCookie(): Promise<OidcCookie | null> {
  const store = await cookies();
  return readOidcCookie(store.get(OIDC_COOKIE_NAME)?.value);
}

export function applySessionCookie(
  response: NextResponse,
  record: SessionRecord,
): void {
  response.cookies.set(
    SESSION_COOKIE_NAME,
    encodeJson({
      userId: record.userId,
      email: record.email,
      username: record.username,
      name: record.name,
      roles: record.roles,
      idToken: record.idToken,
      exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    }),
    sessionCookieOptions,
  );

  if (record.accessToken) {
    response.cookies.set(
      TOKENS_COOKIE_NAME,
      encodeJson({
        accessToken: record.accessToken,
        refreshToken: record.refreshToken,
        accessTokenExpiresAt: record.accessTokenExpiresAt,
      }),
      sessionCookieOptions,
    );
  }
}

export function applyOidcCookie(
  response: NextResponse,
  value: OidcCookie,
): void {
  response.cookies.set(OIDC_COOKIE_NAME, encodeJson(value), oidcCookieOptions);
}

export function clearOidcCookie(response: NextResponse): void {
  response.cookies.set(OIDC_COOKIE_NAME, "", {
    ...oidcCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
}

export function encodePortalCookieValue(
  username: string,
  jsessionId: string,
): string {
  return encodeJson({
    username,
    jsessionId,
    exp: Date.now() + PORTAL_SESSION_MAX_AGE_SECONDS * 1000,
  });
}

export function applyPortalCookie(
  response: NextResponse,
  username: string,
  jsessionId: string,
): void {
  response.cookies.set(
    PORTAL_COOKIE_NAME,
    encodePortalCookieValue(username, jsessionId),
    portalCookieOptions,
  );
}

export function clearPortalCookie(response: NextResponse): void {
  response.cookies.set(PORTAL_COOKIE_NAME, "", {
    ...portalCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  response.cookies.set(TOKENS_COOKIE_NAME, "", {
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  clearOidcCookie(response);
  clearPortalCookie(response);
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  store.set(TOKENS_COOKIE_NAME, "", {
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  store.set(OIDC_COOKIE_NAME, "", {
    ...oidcCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  store.set(PORTAL_COOKIE_NAME, "", {
    ...portalCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
}
