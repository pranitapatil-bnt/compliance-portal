import type { Result } from "@/types/result";
import { isRecord, readString } from "@/lib/utils/guards";

import type { User } from "../types";

function parseUser(value: unknown): User | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const name = readString(value.name);
  const email = readString(value.email);
  const role = readString(value.role);

  if (!id || !name || !email) {
    return null;
  }

  if (role !== "admin" && role !== "member") {
    return null;
  }

  return { id, name, email, role };
}

export function parseUserList(value: unknown): Result<User[]> {
  if (!Array.isArray(value)) {
    return { ok: false, error: "User list was not an array." };
  }

  const users: User[] = [];
  for (const item of value) {
    const user = parseUser(item);
    if (!user) {
      return { ok: false, error: "User list contained an invalid record." };
    }
    users.push(user);
  }

  return { ok: true, data: users };
}
