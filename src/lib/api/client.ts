import "server-only";

import { env, readPortalApiBase } from "@/config/env";
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
  json?: boolean;
  redirect?: RequestRedirect;
};

const LOGIN_HINT =
  "Could not open the Java portal session. Sign out and sign in again.";

export const PORTAL_SESSION_EXPIRED = LOGIN_HINT;

function looksLikeAuthChallenge(text: string): boolean {
  const sample = text.slice(0, 2000).toLowerCase();
  return (
    sample.includes("samlrequest") ||
    sample.includes("kc-form-login") ||
    sample.includes("sign in to ethos") ||
    sample.includes("sign in to") ||
    (sample.includes("keycloak") && sample.includes("password"))
  );
}

function looksLikeLoginPage(text: string): boolean {
  return looksLikeAuthChallenge(text);
}

function isJsonLiteral(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed === "true" ||
    trimmed === "false" ||
    trimmed === "null" ||
    /^-?\d+(\.\d+)?$/.test(trimmed)
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
  if (isJsonLiteral(trimmed)) {
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

  if (looksLikeLoginPage(text)) {
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
  if (options.json || options.payload !== undefined) {
    headers["Content-Type"] = "application/json";
    if (options.payload !== undefined) {
      body = JSON.stringify(options.payload);
    }
  }

  const url = `${baseUrl}${path}`;
  logger.info(`Portal ${method} ${url}`);

  const response = await requestRaw(url, {
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
    if (response.status === 401) {
      throw new ApiError("You do not have permission to do that.", 401);
    }
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
    (error.message === LOGIN_HINT ||
      error.message === "Response was not valid JSON")
  );
}

export type PortalCallOptions = {
  cookie?: string;
};

function requirePortalBase(): string {
  return readPortalApiBase();
}

async function withPortalRetry<T>(
  run: (cookie: string) => Promise<T>,
  cookieOverride?: string,
): Promise<T> {
  if (cookieOverride) {
    return run(cookieOverride);
  }

  const cookie = await getPortalSessionCookie();
  if (!cookie) {
    throw new ApiError(LOGIN_HINT, 401);
  }

  try {
    return await run(cookie);
  } catch (error) {
    if (!shouldRetryPortal(error)) {
      throw error;
    }
    await invalidatePortalSession();
    const refreshed = await getPortalSessionCookie({ forceRefresh: true });
    if (!refreshed) {
      throw new ApiError(LOGIN_HINT, 401);
    }
    return run(refreshed);
  }
}

function portalRequest(
  method: string,
  path: string,
  options: RequestOptions & PortalCallOptions = {},
): Promise<unknown> {
  const { cookie: cookieOverride, ...requestOptions } = options;
  const isPost = method === "POST";
  return withPortalRetry(
    (cookie) =>
      request(method, path, {
        ...requestOptions,
        ajax: true,
        json: isPost,
        redirect: "manual",
        cookie,
        baseUrl: requirePortalBase(),
      }),
    cookieOverride,
  );
}

export async function portalApiGet(
  path: string,
  options: PortalCallOptions = {},
): Promise<unknown> {
  return portalRequest("GET", path, options);
}

export async function portalApiPost(
  path: string,
  payload?: unknown,
  options: PortalCallOptions = {},
): Promise<unknown> {
  return portalRequest("POST", path, { ...options, payload });
}

export async function portalApiHtml(
  path: string,
  options: PortalCallOptions = {},
): Promise<string> {
  const baseUrl = requirePortalBase();

  const get = async (cookie: string): Promise<string> => {
    const headers: Record<string, string> = {
      Accept: "text/html,application/xhtml+xml",
    };
    if (cookie) {
      headers.Cookie = cookie;
    }

    const response = await requestRaw(`${baseUrl}${path}`, {
      method: "GET",
      headers,
    });

    if (isRedirectStatus(response.status)) {
      throw new ApiError(LOGIN_HINT, 401);
    }
    if (looksLikeAuthChallenge(response.text) || response.status === 401) {
      throw new ApiError(LOGIN_HINT, 401);
    }
    if (!response.ok) {
      throw new ApiError(`GET ${path} failed`, response.status);
    }
    return response.text;
  };

  return withPortalRetry(get, options.cookie);
}

export async function portalApiForm(
  path: string,
  fields: Record<string, string>,
): Promise<string> {
  const baseUrl = requirePortalBase();

  const post = async (cookie: string): Promise<string> => {
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
    if (looksLikeAuthChallenge(response.text) || response.status === 401) {
      throw new ApiError(LOGIN_HINT, 401);
    }
    if (!response.ok) {
      throw new ApiError(`POST ${path} failed`, response.status);
    }
    return response.text;
  };

  return withPortalRetry(post);
}

export async function portalApiPostHtml(
  path: string,
  options: PortalCallOptions = {},
): Promise<string> {
  const baseUrl = requirePortalBase();

  const post = async (cookie: string): Promise<string> => {
    const headers: Record<string, string> = {
      Accept: "text/html,application/xhtml+xml",
      "X-Requested-With": "XMLHttpRequest",
    };
    if (cookie) {
      headers.Cookie = cookie;
    }

    const response = await requestRaw(`${baseUrl}${path}`, {
      method: "POST",
      headers,
    });

    if (isRedirectStatus(response.status)) {
      throw new ApiError(LOGIN_HINT, 401);
    }
    if (looksLikeAuthChallenge(response.text) || response.status === 401) {
      throw new ApiError(LOGIN_HINT, 401);
    }
    if (!response.ok) {
      throw new ApiError(`POST ${path} failed`, response.status);
    }
    return response.text;
  };

  return withPortalRetry(post, options.cookie);
}

export async function complianceApiGet(
  path: string,
  options: PortalCallOptions = {},
): Promise<unknown> {
  return portalApiGet(path, options);
}

export async function complianceApiPost(
  path: string,
  payload?: unknown,
  options: PortalCallOptions = {},
): Promise<unknown> {
  return portalApiPost(path, payload, options);
}
