import type { BffErrorBody } from "./types";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | BffErrorBody;
  if (!response.ok) {
    const error =
      data && typeof data === "object" && "error" in data
        ? String((data as BffErrorBody).error)
        : `Request failed (${response.status})`;
    throw new Error(error);
  }
  return data as T;
}

/**
 * Browser talks to this app's BFF only.
 * Next.js then calls http://172.31.2.23:8080/compliance-portal (no CORS).
 */
export async function complianceBff<T>(
  slug: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`/api/compliance/${slug}`, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
    headers,
  });
  return parseResponse<T>(response);
}

export function complianceBffGet<T>(slug: string): Promise<T> {
  return complianceBff<T>(slug, { method: "GET" });
}

export function complianceBffPost<T>(slug: string, body?: unknown): Promise<T> {
  return complianceBff<T>(slug, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
