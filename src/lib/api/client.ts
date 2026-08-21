import "server-only";

import { env } from "@/config/env";

import { ApiError } from "./errors";

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

export async function apiGet(path: string): Promise<unknown> {
  if (!env.apiBaseUrl) {
    throw new ApiError("API_BASE_URL is not configured", 500);
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(`GET ${path} failed`, response.status);
  }

  return body;
}
