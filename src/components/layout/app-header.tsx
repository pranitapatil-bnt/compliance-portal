"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  queueNav,
  queuePaths,
  quickActions,
  reportNav,
  reportPaths,
} from "@/config/navigation";
import { demoCredentials } from "@/constants/auth";
import { routes } from "@/constants/routes";
import type { Session } from "@/lib/auth/types";
import { cn } from "@/lib/utils/cn";
import { asRoute } from "@/lib/utils/routes";

import { BtLogo } from "./bt-logo";
import { NavDropdown } from "./nav-dropdown";
import { SignOutButton } from "./sign-out-button";

type AppHeaderProps = {
  session: Session;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function displayName(email: string) {
  if (email === demoCredentials.username) {
    return demoCredentials.displayName;
  }
  if (email.includes("@")) {
    return email.split("@")[0] ?? email;
  }
  return email.split(".").join(" ");
}

const menuLinkClass =
  "flex flex-col rounded-lg px-3 py-2 hover:bg-navy-wash";

export function AppHeader({ session }: AppHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const queuesActive = queuePaths.some((path) => isActivePath(pathname, path));
  const reportsActive = reportPaths.some((path) => isActivePath(pathname, path));
  const dashboardActive = pathname === routes.home;
  const name = displayName(session.email);

  return (
    <header className="sticky top-0 z-40 bg-brand-gradient">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Link
          href={routes.home}
          className="shrink-0 rounded-md bg-white px-2 py-1"
          aria-label="Home"
        >
          <BtLogo className="h-8" />
        </Link>

        <button
          type="button"
          className="ml-auto rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((value) => !value)}
        >
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          aria-label="Primary"
        >
          <Link
            href={routes.home}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white",
              dashboardActive && "text-white shadow-[inset_0_-2px_0_#ffffff]",
            )}
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
            </svg>
            Dashboard
          </Link>
          <NavDropdown label="Queues" active={queuesActive} tone="navy">
            <p className="px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-navy-muted uppercase">
              Work queues
            </p>
            {queueNav.map((item) => (
              <Link
                key={item.href}
                href={asRoute(item.href)}
                role="menuitem"
                className={menuLinkClass}
              >
                <span className="text-sm font-medium text-navy">{item.label}</span>
                <span className="text-xs text-navy-muted">{item.description}</span>
              </Link>
            ))}
          </NavDropdown>
          <NavDropdown label="Reports" active={reportsActive} wide tone="navy">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-navy-muted uppercase">
                  Search & history
                </p>
                {reportNav.search.map((item) => (
                  <Link
                    key={item.href}
                    href={asRoute(item.href)}
                    role="menuitem"
                    className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-navy-wash"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div>
                <p className="px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-navy-muted uppercase">
                  Insights
                </p>
                {reportNav.insights.map((item) => (
                  <Link
                    key={item.href}
                    href={asRoute(item.href)}
                    role="menuitem"
                    className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-navy-wash"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </NavDropdown>
        </nav>

        <div className="hidden items-center gap-1 lg:flex">
          <NavDropdown
            label="Quick actions"
            align="right"
            hideChevron
            tone="navy"
            triggerClassName="px-2"
            trigger={
              <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
          >
            <p className="px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-navy-muted uppercase">
              Quick actions
            </p>
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={asRoute(item.href)}
                role="menuitem"
                className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-navy-wash"
              >
                {item.label}
              </Link>
            ))}
          </NavDropdown>
          <NavDropdown
            label="Profile"
            align="right"
            tone="navy"
            trigger={
              <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2 py-1">
                <span className="flex size-7 items-center justify-center rounded-full bg-white text-navy">
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" />
                  </svg>
                </span>
                <span className="max-w-40 truncate text-sm text-white">{name}</span>
              </span>
            }
          >
            <div className="px-3 py-2">
              <p className="text-xs text-navy-muted">Signed in as</p>
              <p className="mb-3 truncate text-sm font-medium text-navy">{name}</p>
              <SignOutButton email={session.email} compact />
            </div>
          </NavDropdown>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/15 bg-[#2e1a7a]/40 px-4 py-3 lg:hidden">
          <Link
            href={routes.home}
            className="block rounded-lg px-3 py-2 text-sm text-white"
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Link>
          {queueNav.map((item) => (
            <Link
              key={item.href}
              href={asRoute(item.href)}
              className="block rounded-lg px-3 py-2 text-sm text-white/90"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {[...reportNav.search, ...reportNav.insights].map((item) => (
            <Link
              key={item.href}
              href={asRoute(item.href)}
              className="block rounded-lg px-3 py-2 text-sm text-white/90"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 border-t border-white/10 pt-3">
            <SignOutButton email={session.email} />
          </div>
        </div>
      ) : null}
    </header>
  );
}
