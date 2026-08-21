import Link from "next/link";

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

export function KpiStrip({ items }: KpiStripProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={asRoute(item.href)}
          className="relative flex flex-col gap-1 rounded-2xl border border-navy-line bg-white px-5 py-5 no-underline shadow-[0_8px_24px_rgba(46,26,122,0.06)] transition before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl before:bg-brand-gradient hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(46,26,122,0.1)]"
        >
          <span className="text-[11px] font-semibold tracking-[0.12em] text-navy-muted uppercase">
            {item.label}
          </span>
          <span className="text-[1.75rem] leading-none font-semibold text-navy">
            {item.value}
          </span>
          <span className="text-xs text-navy-muted">{item.hint}</span>
        </Link>
      ))}
    </div>
  );
}
