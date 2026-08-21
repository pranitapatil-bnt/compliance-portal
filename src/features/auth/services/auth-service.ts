import "server-only";

import { demoCredentials } from "@/constants/auth";
import type { Result } from "@/types/result";

import type { AuthUser, LoginInput } from "../types";

export async function authenticate(
  input: LoginInput,
): Promise<Result<AuthUser>> {
  const usernameOk = input.username === demoCredentials.username;
  const passwordOk = input.password === demoCredentials.password;

  if (!usernameOk || !passwordOk) {
    return { ok: false, error: "Invalid username or password." };
  }

  return {
    ok: true,
    data: {
      id: "user_1",
      email: demoCredentials.username,
    },
  };
}
