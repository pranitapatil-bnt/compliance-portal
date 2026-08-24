import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { routes } from "@/constants/routes";
import { PortalSessionSync } from "@/features/auth/components/portal-session-sync";
import { getSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect(routes.login);
  }

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AppShell session={session} today={today}>
      <PortalSessionSync />
      {children}
    </AppShell>
  );
}
