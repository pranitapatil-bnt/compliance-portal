"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { appConfig } from "@/config/app";
import { queueNav, reportNav } from "@/config/navigation";
import { routes } from "@/constants/routes";
import type { Session } from "@/lib/auth/types";
import { cn } from "@/lib/utils/cn";
import { asRoute } from "@/lib/utils/routes";

import { BtLogo } from "./bt-logo";
import { SignOutButton } from "./sign-out-button";

type AppSidebarProps = {
  session: Session;
  open: boolean;
  onClose: () => void;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const iconClass = "size-[18px] shrink-0";

function DashboardIcon() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M4 19c.8-3 2.8-4.5 5-4.5s4.2 1.5 5 4.5" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M16 19c.4-2 1.6-3.2 3.2-3.5" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M7 4h7l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M14 4v5h5M8 13h8M8 17h5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.7 1 1.2 1.7 1.2H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z" />
    </svg>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={asRoute(href)}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-muted transition-colors hover:bg-navy-wash hover:text-navy",
        active && "bg-[#e7f3fc] text-[#2f7fd4]",
      )}
    >
      {active ? (
        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[#2f7fd4]" />
      ) : null}
      {icon}
      {label}
    </Link>
  );
}

export function AppSidebar({ session, open, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const dashboardActive = pathname === routes.home;
  const reports = [...reportNav.search, ...reportNav.insights];
  const reportsActive = reports.some((item) =>
    isActivePath(pathname, item.href),
  );
  const [reportsOpen, setReportsOpen] = useState(reportsActive);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-40 bg-navy/30 lg:hidden",
          open ? "block" : "hidden",
        )}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col overflow-y-auto bg-white px-4 pt-8 pb-5 shadow-[4px_0_24px_rgba(15,40,70,0.04)] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link
          href={routes.home}
          className="mb-8 flex flex-col items-center gap-2 px-2 pt-2"
          onClick={onClose}
        >
          <BtLogo className="h-14 w-auto" />
          <span className="text-sm font-semibold text-navy">
            {appConfig.name}
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
          <NavLink
            href={routes.home}
            label="Dashboard"
            icon={<DashboardIcon />}
            active={dashboardActive}
            onClick={onClose}
          />
          {queueNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<QueueIcon />}
              active={
                item.href === routes.transactions
                  ? ["/transactions", "/payment-in", "/payment-out"].some(
                      (path) => isActivePath(pathname, path),
                    )
                  : isActivePath(pathname, item.href)
              }
              onClick={onClose}
            />
          ))}
        </nav>

        <div className="mt-4 flex flex-col gap-1">
          <button
            type="button"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-muted hover:bg-navy-wash hover:text-navy",
              reportsActive && "bg-[#e7f3fc] text-[#2f7fd4]",
            )}
            aria-expanded={reportsOpen}
            onClick={() => setReportsOpen((value) => !value)}
          >
            <ReportIcon />
            Reports
          </button>
          {reportsOpen
            ? reports.map((item) => (
                <Link
                  key={item.href}
                  href={asRoute(item.href)}
                  onClick={onClose}
                  className={cn(
                    "rounded-lg py-1.5 pr-2 pl-10 text-sm text-navy-muted hover:text-navy",
                    isActivePath(pathname, item.href) &&
                      "font-medium text-[#2f7fd4]",
                  )}
                >
                  {item.label}
                </Link>
              ))
            : null}

          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-muted hover:bg-navy-wash hover:text-navy"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((value) => !value)}
          >
            <SettingsIcon />
            Settings
          </button>
          {settingsOpen ? (
            <div className="rounded-xl bg-navy-wash px-3 py-3">
              <p className="mb-2 truncate text-xs text-navy-muted">
                {session.email}
              </p>
              <SignOutButton email={session.email} compact />
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
