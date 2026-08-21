import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { LoginForm } from "@/features/auth";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(routes.home);
  }

  return (
    <>
      <p className="mb-6 text-center text-sm text-navy-muted">
        Sign in to your account
      </p>
      <LoginForm />
    </>
  );
}
