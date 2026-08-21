"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/constants/routes";
import type { Session } from "@/lib/auth/types";

import { NavDropdown } from "./nav-dropdown";
import { SignOutButton } from "./sign-out-button";

type AppHeaderProps = {
  session: Session;
  today: string;
  onMenu: () => void;
};

function displayName(session: Session) {
  if (session.name.trim()) {
    return session.name;
  }
  if (session.email.includes("@")) {
    return session.email.split("@")[0] ?? session.email;
  }
  return session.username.replaceAll(".", " ");
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

export function AppHeader({ session, today, onMenu }: AppHeaderProps) {
  const pathname = usePathname();
  const name = displayName(session);
  const searchActive = pathname.startsWith(routes.reportsHolistic);

  return (
    <header className="sticky top-0 z-30 bg-[#1a4a5c]">
      <div className="flex min-h-[72px] items-center gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
          aria-label="Open navigation menu"
          onClick={onMenu}
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

        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-white">
            Welcome, {name}
          </p>
          <p className="text-xs text-white/75">{today}</p>
        </div>

        <form
          action={routes.reportsHolistic}
          method="get"
          className="mx-auto hidden min-w-0 flex-1 justify-center md:flex"
        >
          <label className="relative w-full max-w-md">
            <span className="sr-only">Search</span>
            <svg
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
            <input
              type="search"
              name="q"
              placeholder="Search"
              defaultValue=""
              className="h-10 w-full rounded-full border-0 bg-white/15 pr-4 pl-10 text-sm text-white outline-none placeholder:text-white/65 focus:bg-white/20"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href={routes.reportsHolistic}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 md:hidden"
            aria-label="Search"
            aria-current={searchActive ? "page" : undefined}
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
          </Link>

          <NavDropdown
            label="Profile"
            align="right"
            tone="navy"
            hideChevron
            triggerClassName="rounded-full p-0.5"
            trigger={
              <span className="flex size-10 items-center justify-center rounded-full bg-[#c9a227] text-sm font-semibold text-white">
                {initials(name)}
              </span>
            }
          >
            <div className="px-3 py-2">
              <p className="text-xs text-navy-muted">Signed in as</p>
              <p className="mb-3 truncate text-sm font-medium text-navy">
                {name}
              </p>
              <SignOutButton email={session.email} compact />
            </div>
          </NavDropdown>
        </div>
      </div>
    </header>
  );
}
