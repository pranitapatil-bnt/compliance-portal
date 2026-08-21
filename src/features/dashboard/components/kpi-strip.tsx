import Link from "next/link";

import { Card } from "@/components/ui/card";
import { asRoute } from "@/lib/utils/routes";

import type { AppRoute } from "@/constants/routes";

export type KpiItem = {
  href: AppRoute;
  label: string;
  value: string | number;
  hint: string;
};

type KpiStripProps = {
  items: readonly KpiItem[];
};

function MailIcon() {
  return (
    <svg
      className="size-5 text-[#3d8bd9]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function KpiStrip({ items }: KpiStripProps) {
  const primary = items[0];

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-navy">What&apos;s next</h2>
        {primary ? (
          <Link
            href={asRoute(primary.href)}
            className="inline-flex items-center rounded-lg bg-[#3d8bd9] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#3478bc]"
          >
            Review
          </Link>
        ) : null}
      </div>
      <ul className="flex flex-1 flex-col justify-center">
        {items.map((item) => (
          <li
            key={item.href}
            className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-b-0 last:pb-0"
          >
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-[#3d8bd9]" />
            <Link
              href={asRoute(item.href)}
              className="min-w-0 flex-1 hover:underline"
            >
              <span className="block text-sm font-medium text-navy">
                {item.label}
              </span>
              <span className="block text-xs text-navy-muted">
                {item.value} {item.hint}
              </span>
            </Link>
            <MailIcon />
          </li>
        ))}
      </ul>
    </Card>
  );
}
