import "server-only";

import { NextResponse } from "next/server";

import { readPortalApiBase } from "@/config/env";
import {
  PORTAL_SESSION_EXPIRED,
  portalApiGet,
  portalApiPost,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/session";

import { findComplianceEndpoint } from "./paths";
import type { BffErrorBody } from "./types";

function jsessionFromCookieHeader(header: string | null): string | undefined {
  if (!header) {
    return undefined;
  }
  const match = header.match(/(?:^|;\s*)JSESSIONID=([^;]+)/i);
  const value = match?.[1]?.trim();
  return value && value.length > 0 ? `JSESSIONID=${value}` : undefined;
}

function portalCookieOverride(request: Request): string | undefined {
  return jsessionFromCookieHeader(request.headers.get("cookie"));
}

function errorResponse(
  status: number,
  error: string,
  extra: Omit<BffErrorBody, "error"> = {},
) {
  return NextResponse.json({ error, ...extra } satisfies BffErrorBody, {
    status,
  });
}

async function parseJsonBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text.trim()) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError("Request body was not valid JSON", 400);
  }
}

export async function proxyCompliance(
  request: Request,
  slugParts: string[],
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return errorResponse(401, "Unauthorized", { unauthenticated: true });
  }

  const slug = slugParts.join("/");
  const endpoint = findComplianceEndpoint(slug);
  if (!endpoint) {
    return errorResponse(404, `Unknown compliance API: ${slug}`);
  }

  if (request.method !== endpoint.method) {
    return errorResponse(405, `${endpoint.method} required for ${slug}`);
  }

  const cookie = portalCookieOverride(request);
  const search = new URL(request.url).search;
  const path = `${endpoint.path}${search}`;
  const options = cookie ? { cookie } : undefined;

  try {
    const payload =
      endpoint.method === "POST" ? await parseJsonBody(request) : undefined;
    const data =
      endpoint.method === "GET"
        ? await portalApiGet(path, options)
        : await portalApiPost(path, payload, options);

    const upstream = `${readPortalApiBase()}${path}`;
    const response = NextResponse.json(data ?? null);
    response.headers.set("X-Upstream-Url", upstream);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const unauthenticated =
        error.status === 401 && error.message === PORTAL_SESSION_EXPIRED;
      return errorResponse(error.status, error.message, {
        unauthenticated: unauthenticated || undefined,
      });
    }
    return errorResponse(500, "Compliance portal request failed");
  }
}
