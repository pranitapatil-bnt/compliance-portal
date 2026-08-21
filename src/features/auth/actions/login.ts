"use server";

import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { createSession } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

import { parseLoginInput } from "../schemas/login";
import { authenticate } from "../services/auth-service";

export type LoginState = {
  error: string | null;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = parseLoginInput({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const result = await authenticate(parsed.data);
  if (!result.ok) {
    return { error: result.error };
  }

  await createSession({
    userId: result.data.id,
    email: result.data.email,
  });

  logger.info("User signed in", { userId: result.data.id });
  redirect(routes.home);
}
