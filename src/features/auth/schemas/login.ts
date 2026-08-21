import type { Result } from "@/types/result";
import { isRecord, readString } from "@/lib/utils/guards";

import type { LoginInput } from "../types";

export function parseLoginInput(value: unknown): Result<LoginInput> {
  if (!isRecord(value)) {
    return { ok: false, error: "Invalid login payload." };
  }

  const username = readString(value.username)?.trim() ?? "";
  const password = readString(value.password) ?? "";

  if (!username) {
    return { ok: false, error: "Enter your username." };
  }

  if (!password) {
    return { ok: false, error: "Enter your password." };
  }

  return { ok: true, data: { username, password } };
}
