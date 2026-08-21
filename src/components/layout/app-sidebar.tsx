"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import {
  queueNav,
  reportNav,
  queuePaths,
  reportPaths,
} from "@/config/navigation";
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

const iconClass = "size-5 shrink-0";

function IconTile({
  children,
  active = false,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg",
        active ? "bg-white/20 text-white" : "bg-navy-soft text-navy",
      )}
    >
      {children}
    </span>
  );
}

const navItemClass =
  "relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors";

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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn(
        "ml-auto size-4 shrink-0 transition-transform",
        open && "rotate-180",
      )}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
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
        navItemClass,
        active
          ? "bg-[#1a4a5c] text-white shadow-[0_8px_18px_rgba(26,74,92,0.28)]"
          : "text-navy hover:bg-navy-soft",
      )}
    >
      <IconTile active={active}>{icon}</IconTile>
      {label}
    </Link>
  );
}

function ChildLink({
  href,
  label,
  description,
  active,
  onClick,
}: {
  href: string;
  label: string;
  description?: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={asRoute(href)}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block rounded-xl py-2 pr-3 pl-12 transition-colors",
        active ? "bg-[#e6eef1] ring-1 ring-[#1a4a5c]/20" : "hover:bg-navy-wash",
      )}
    >
      <span
        className={cn(
          "block text-sm font-semibold",
          active ? "text-[#1a4a5c]" : "text-navy",
        )}
      >
        {label}
      </span>
      {description ? (
        <span className="mt-0.5 block text-[11px] leading-snug text-navy-muted">
          {description}
        </span>
      ) : null}
    </Link>
  );
}

function isQueueItemActive(pathname: string, href: string) {
  if (href === routes.transactions) {
    return ["/transactions", "/payment-in", "/payment-out"].some((path) =>
      isActivePath(pathname, path),
    );
  }
  return isActivePath(pathname, href);
}

export function AppSidebar({ session, open, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const dashboardActive = pathname === routes.home;
  const queuesActive = queuePaths.some((path) =>
    path === routes.transactions
      ? ["/transactions", "/payment-in", "/payment-out"].some((item) =>
          isActivePath(pathname, item),
        )
      : isActivePath(pathname, path),
  );
  const reportsActive = reportPaths.some((path) =>
    isActivePath(pathname, path),
  );
  const [queuesOpen, setQueuesOpen] = useState(queuesActive);
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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-hidden bg-white px-4 pt-8 pb-5 shadow-[4px_0_24px_rgba(15,40,70,0.04)] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link
          href={routes.home}
          className="mb-2 flex shrink-0 items-center justify-center px-1 pt-1 pb-8"
          onClick={onClose}
        >
          <span className="flex w-full items-center justify-center rounded-2xl bg-navy-soft px-4 py-4 shadow-[0_8px_20px_rgba(46,26,122,0.08)] ring-1 ring-navy-line">
            <BtLogo className="h-14 w-auto" />
          </span>
        </Link>

        <nav
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"
          aria-label="Primary"
        >
          <NavLink
            href={routes.home}
            label="Dashboard"
            icon={<DashboardIcon />}
            active={dashboardActive}
            onClick={onClose}
          />

          <button
            type="button"
            className={cn(
              navItemClass,
              queuesActive
                ? "bg-[#1a4a5c] text-white shadow-[0_8px_18px_rgba(26,74,92,0.28)]"
                : "text-navy hover:bg-navy-soft",
            )}
            aria-expanded={queuesOpen}
            onClick={() => setQueuesOpen((value) => !value)}
          >
            <IconTile active={queuesActive}>
              <QueueIcon />
            </IconTile>
            Queues
            <ChevronIcon open={queuesOpen} />
          </button>
          {queuesOpen
            ? queueNav.map((item) => (
                <ChildLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  description={item.description}
                  active={isQueueItemActive(pathname, item.href)}
                  onClick={onClose}
                />
              ))
            : null}

          <button
            type="button"
            className={cn(
              navItemClass,
              reportsActive
                ? "bg-[#1a4a5c] text-white shadow-[0_8px_18px_rgba(26,74,92,0.28)]"
                : "text-navy hover:bg-navy-soft",
            )}
            aria-expanded={reportsOpen}
            onClick={() => setReportsOpen((value) => !value)}
          >
            <IconTile active={reportsActive}>
              <ReportIcon />
            </IconTile>
            Reports
            <ChevronIcon open={reportsOpen} />
          </button>
          {reportsOpen ? (
            <>
              <p className="px-3 pt-3 pb-1 pl-12 text-[10px] font-semibold tracking-[0.14em] text-navy uppercase">
                Search & history
              </p>
              {reportNav.search.map((item) => (
                <ChildLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={isActivePath(pathname, item.href)}
                  onClick={onClose}
                />
              ))}
              <p className="px-3 pt-3 pb-1 pl-12 text-[10px] font-semibold tracking-[0.14em] text-navy uppercase">
                Insights
              </p>
              {reportNav.insights.map((item) => (
                <ChildLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={isActivePath(pathname, item.href)}
                  onClick={onClose}
                />
              ))}
            </>
          ) : null}
        </nav>

        <div className="mt-4 flex shrink-0 flex-col gap-1">
          <button
            type="button"
            className={cn(navItemClass, "text-navy hover:bg-navy-soft")}
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((value) => !value)}
          >
            <IconTile>
              <SettingsIcon />
            </IconTile>
            Settings
          </button>
          {settingsOpen ? (
            <div className="rounded-xl bg-navy-soft px-3 py-3 ring-1 ring-navy-line">
              <p className="mb-2 truncate text-xs text-navy-muted">
                {session.name || session.username}
              </p>
              <SignOutButton email={session.email} compact />
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
