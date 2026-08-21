"use client";

import { useState, type ReactNode } from "react";

import type { Session } from "@/lib/auth/types";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

type AppShellProps = {
  session: Session;
  today: string;
  children: ReactNode;
};

export function AppShell({ session, today, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#eef2f6]">
      <AppSidebar
        session={session}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          session={session}
          today={today}
          onMenu={() => setMobileOpen(true)}
        />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
