import "server-only";

import { env } from "@/config/env";

import { ApiError } from "./errors";
import { getPortalSessionCookie } from "./portal-session";
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
  "Signed in, but the Java queue APIs still need a portal SAML session. Add PORTAL_SSO_PASSWORD to .env.local (same password as Keycloak) and restart.";

function looksLikeLoginPage(text: string): boolean {
  const sample = text.slice(0, 400).toLowerCase();
  return (
    sample.includes("<html") ||
    sample.includes("sign in") ||
    sample.includes("samlrequest") ||
    sample.includes("keycloak")
  );
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new ApiError("Response was not valid JSON", response.status);
    }
  }

  if (looksLikeLoginPage(text) || response.status === 401) {
    throw new ApiError(LOGIN_HINT, 401);
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError("Response was not valid JSON", response.status);
  }
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

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body,
    cache: "no-store",
    redirect: options.redirect ?? "follow",
  });

  if (isRedirectStatus(response.status)) {
    throw new ApiError(LOGIN_HINT, 401);
  }

  const parsed = await parseBody(response);

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

export async function portalApiGet(path: string): Promise<unknown> {
  return request("GET", path, {
    ajax: true,
    redirect: "manual",
    cookie: await getPortalSessionCookie(),
  });
}

export async function portalApiPost(
  path: string,
  payload?: unknown,
): Promise<unknown> {
  return request("POST", path, {
    payload,
    ajax: true,
    redirect: "manual",
    cookie: await getPortalSessionCookie(),
  });
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
