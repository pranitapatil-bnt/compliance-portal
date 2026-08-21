import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/constants/auth";

import type { Session } from "./types";

export type { Session };

const sessionCookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function encodeSession(session: Session): string {
  const raw = `${session.userId}|${session.email}|${Date.now()}`;
  return Buffer.from(raw, "utf8").toString("base64url");
}

function decodeSession(value: string): Session | null {
  try {
    const raw = Buffer.from(value, "base64url").toString("utf8");
    const [userId, email] = raw.split("|");
    if (!userId || !email) {
      return null;
    }
    return { userId, email };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE_NAME)?.value;
  return value ? decodeSession(value) : null;
}

export async function createSession(session: Session): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, encodeSession(session), sessionCookieOptions);
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
}
