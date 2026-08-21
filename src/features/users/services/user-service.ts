import "server-only";

import { env } from "@/config/env";
import { apiGet } from "@/lib/api/client";
import { logger } from "@/lib/logger";

import { parseUserList } from "../schemas/user";
import type { User } from "../types";

const localUsers: User[] = [
  {
    id: "user_1",
    name: "Ada Lovelace",
    email: "ada@atlas.dev",
    role: "admin",
  },
  {
    id: "user_2",
    name: "Alan Turing",
    email: "alan@atlas.dev",
    role: "member",
  },
];

export async function listUsers(): Promise<User[]> {
  if (!env.apiBaseUrl) {
    return localUsers;
  }

  const body = await apiGet("/users");
  const parsed = parseUserList(body);

  if (!parsed.ok) {
    logger.error("Failed to parse users payload", parsed.error);
    throw new Error(parsed.error);
  }

  return parsed.data;
}
