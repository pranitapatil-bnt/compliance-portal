import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { asRoute } from "@/lib/utils/routes";

import type { AppRoute } from "@/constants/routes";

export type KpiCard = {
  href: AppRoute;
  label: string;
  value: string;
  hint: string;
  tone: "accent" | "warning" | "success";
};

const toneClass: Record<KpiCard["tone"], string> = {
  accent: "border-l-blue-500",
  warning: "border-l-amber-500",
  success: "border-l-emerald-500",
};

type KpiGridProps = {
  items: readonly KpiCard[];
};

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.href}
          href={asRoute(item.href)}
          className={cn(
            "flex flex-col gap-1 rounded-lg border border-slate-200 border-l-[3px] bg-white px-5 py-4 no-underline shadow-sm transition hover:-translate-y-px hover:border-blue-300 hover:shadow-md",
            toneClass[item.tone],
          )}
        >
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {item.label}
          </span>
          <span className="text-2xl font-semibold tracking-tight text-slate-900">
            {item.value}
          </span>
          <span className="text-xs text-slate-400">{item.hint}</span>
        </Link>
      ))}
    </div>
  );
}
