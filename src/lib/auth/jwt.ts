import { isRecord, readString } from "@/lib/utils/guards";

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload: unknown = JSON.parse(json);
    return isRecord(payload) ? payload : null;
  } catch {
    return null;
  }
}

export function readStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  const single = readString(value);
  return single ? [single] : [];
}
