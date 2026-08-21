"use server";

import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";

export async function logoutAction(): Promise<void> {
  redirect(routes.logout);
}
