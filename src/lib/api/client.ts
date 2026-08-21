import "server-only";

import { env } from "@/config/env";

import { ApiError } from "./errors";
import { getServiceAccessToken } from "./service-token";

type RequestOptions = {
  bearer?: boolean;
  baseUrl?: string;
};

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError("Response was not valid JSON", response.status);
  }
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
  if (options.bearer) {
    const token = await getServiceAccessToken();
    if (!token) {
      throw new ApiError("Could not get an API access token", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    cache: "no-store",
  });

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(`${method} ${path} failed`, response.status);
  }

  return body;
}

export async function apiGet(path: string): Promise<unknown> {
  return request("GET", path);
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

  const baseUrl = env.complianceApiBase;
  const token = await getServiceAccessToken();
  if (!token) {
    throw new ApiError("Could not get an API access token", 401);
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  let body: string | undefined;
  if (payload !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(payload);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  const parsed = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(`POST ${path} failed`, response.status);
  }

  return parsed;
}
