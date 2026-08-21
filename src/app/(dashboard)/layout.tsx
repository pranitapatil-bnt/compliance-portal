import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { routes } from "@/constants/routes";
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

  return (
    <div className="flex min-h-screen flex-col bg-navy-wash">
      <Header session={session} />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
