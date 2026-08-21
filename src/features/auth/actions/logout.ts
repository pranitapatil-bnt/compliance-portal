"use server";

import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { clearSession } from "@/lib/auth/session";

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect(routes.login);
}
