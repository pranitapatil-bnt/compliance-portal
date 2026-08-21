"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type NavDropdownProps = {
  label: string;
  active?: boolean;
  align?: "left" | "right";
  wide?: boolean;
  hideChevron?: boolean;
  triggerClassName?: string;
  trigger?: ReactNode;
  tone?: "light" | "navy";
  children: ReactNode;
};

export function NavDropdown({
  label,
  active = false,
  align = "left",
  wide = false,
  hideChevron = false,
  triggerClassName,
  trigger,
  tone = "light",
  children,
}: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const onNavy = tone === "navy";

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          onNavy
            ? "text-white/80 hover:bg-white/10 hover:text-white"
            : "text-navy-muted hover:bg-navy-soft hover:text-navy",
          (open || active) && (onNavy ? "text-white" : "text-navy"),
          active &&
            (onNavy
              ? "shadow-[inset_0_-2px_0_#ffffff]"
              : "shadow-[inset_0_-2px_0_#2e1a7a]"),
          triggerClassName,
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger ?? label}
        {hideChevron ? null : (
          <svg
            className={cn(
              "size-4 transition-transform",
              onNavy ? "text-white/70" : "text-navy-muted",
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
        )}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className={cn(
            "absolute top-[calc(100%+0.6rem)] z-50 rounded-xl border border-navy-line bg-white p-2 shadow-xl",
            wide ? "min-w-[22rem]" : "min-w-64",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <div>{children}</div>
        </div>
      ) : null}
    </div>
  );
}
