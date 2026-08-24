import "server-only";

import { env } from "@/config/env";
import { logger } from "@/lib/logger";

import { ApiError } from "./errors";
import { requestRaw } from "./http";
import {
  getPortalSessionCookie,
  invalidatePortalSession,
} from "./portal-session";
import { getServiceAccessToken } from "./service-token";

type RequestOptions = {
  bearer?: boolean | "optional";
  baseUrl?: string;
  cookie?: string;
  payload?: unknown;
  ajax?: boolean;
  redirect?: RequestRedirect;
};

const LOGIN_HINT =
  "Could not open the Java portal session. Sign out and sign in again.";

function looksLikeLoginPage(text: string): boolean {
  const sample = text.slice(0, 800).toLowerCase();
  return (
    sample.includes("samlrequest") ||
    sample.includes("kc-form-login") ||
    sample.includes("sign in to") ||
    sample.includes("<html") ||
    sample.includes("forbidden") ||
    (sample.includes("keycloak") && sample.includes("password"))
  );
}

function parseJson(text: string): unknown {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  const lenient = trimmed
    .replace(/\bNaN\b/g, "null")
    .replace(/-Infinity/g, "null")
    .replace(/\bInfinity\b/g, "null");
  return JSON.parse(lenient) as unknown;
}

function parseBody(status: number, contentType: string, text: string): unknown {
  if (!text) {
    return null;
  }

  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return parseJson(trimmed);
    } catch {
      logger.warn("Portal JSON parse failed", {
        status,
        contentType,
        sample: trimmed.slice(0, 240),
      });
      throw new ApiError("Response was not valid JSON", status);
    }
  }

  if (looksLikeLoginPage(text) || status === 401 || status === 403) {
    throw new ApiError(LOGIN_HINT, 401);
  }

  if (contentType.includes("json")) {
    try {
      return parseJson(text);
    } catch {
      throw new ApiError(LOGIN_HINT, 401);
    }
  }

  logger.warn("Portal returned non-JSON", {
    status,
    contentType,
    sample: trimmed.slice(0, 240),
  });
  throw new ApiError(LOGIN_HINT, 401);
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

async function request(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<unknown> {
  const baseUrl = options.baseUrl ?? env.apiBaseUrl;
  if (!baseUrl) {
    throw new ApiError("API_BASE_URL is not configured", 500);
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.ajax) {
    headers["X-Requested-With"] = "XMLHttpRequest";
  }
  if (options.cookie) {
    headers.Cookie = options.cookie;
  }
  if (options.bearer) {
    const token = await getServiceAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (options.bearer !== "optional") {
      throw new ApiError("Could not get an API access token", 401);
    }
  }

  let body: string | undefined;
  if (options.payload !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.payload);
  }

  const response = await requestRaw(`${baseUrl}${path}`, {
    method,
    headers,
    body,
  });

  if (isRedirectStatus(response.status)) {
    throw new ApiError(LOGIN_HINT, 401);
  }

  const parsed = parseBody(
    response.status,
    response.headers["content-type"] ?? "",
    response.text,
  );

  if (!response.ok) {
    throw new ApiError(`${method} ${path} failed`, response.status);
  }

  return parsed;
}

export async function apiGet(path: string): Promise<unknown> {
  return request("GET", path);
}

export async function apiPost(
  path: string,
  payload?: unknown,
): Promise<unknown> {
  return request("POST", path, { payload });
}

function shouldRetryPortal(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 401 || error.message === "Response was not valid JSON")
  );
}

async function withPortalRetry<T>(
  run: (cookie?: string) => Promise<T>,
): Promise<T> {
  try {
    return await run(await getPortalSessionCookie());
  } catch (error) {
    if (!shouldRetryPortal(error)) {
      throw error;
    }
    await invalidatePortalSession();
    return run(await getPortalSessionCookie({ forceRefresh: true }));
  }
}

export async function portalApiGet(path: string): Promise<unknown> {
  return withPortalRetry((cookie) =>
    request("GET", path, {
      ajax: true,
      redirect: "manual",
      cookie,
    }),
  );
}

export async function portalApiPost(
  path: string,
  payload?: unknown,
): Promise<unknown> {
  return withPortalRetry((cookie) =>
    request("POST", path, {
      payload,
      ajax: true,
      redirect: "manual",
      cookie,
    }),
  );
}

export async function portalApiForm(
  path: string,
  fields: Record<string, string>,
): Promise<string> {
  const baseUrl = env.apiBaseUrl;
  if (!baseUrl) {
    throw new ApiError("API_BASE_URL is not configured", 500);
  }

  const post = async (cookie?: string): Promise<string> => {
    const headers: Record<string, string> = {
      Accept: "text/html,application/xhtml+xml",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    };
    if (cookie) {
      headers.Cookie = cookie;
    }

    const response = await requestRaw(`${baseUrl}${path}`, {
      method: "POST",
      headers,
      body: new URLSearchParams(fields).toString(),
    });

    if (isRedirectStatus(response.status)) {
      throw new ApiError(LOGIN_HINT, 401);
    }
    if (looksLikeLoginPage(response.text) || response.status === 401) {
      throw new ApiError(LOGIN_HINT, 401);
    }
    if (!response.ok) {
      throw new ApiError(`POST ${path} failed`, response.status);
    }
    return response.text;
  };

  return withPortalRetry(post);
}

export async function complianceApiGet(path: string): Promise<unknown> {
  if (!env.complianceApiBase) {
    throw new ApiError("COMPLIANCE_API_BASE is not configured", 500);
  }

  return request("GET", path, {
    baseUrl: env.complianceApiBase,
    bearer: true,
  });
}

export async function complianceApiPost(
  path: string,
  payload?: unknown,
): Promise<unknown> {
  if (!env.complianceApiBase) {
    throw new ApiError("COMPLIANCE_API_BASE is not configured", 500);
  }

  return request("POST", path, {
    baseUrl: env.complianceApiBase,
    bearer: true,
    payload,
  });
}
