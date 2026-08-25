import Link from "next/link";

import { Card } from "@/components/ui/card";
import { asRoute } from "@/lib/utils/routes";

import { ChartPlaceholder } from "./chart-placeholder";
import { LastUpdated } from "./last-updated";
import { WorldMap } from "./world-map";
import { dashboardLinks, type CustomerSlice, type PaymentSlice } from "../data";

type RankItem = {
  name: string;
  detail: string;
  value: number | string;
  href: string;
};

type HighlightItem = {
  name: string;
  detail: string;
  status: string;
  meta: string;
  href: string;
};

type TaskItem = {
  title: string;
  category: string;
  value: number | string;
  unit: string;
};

type ScheduleRow = {
  label: string;
  value: number | string;
  unit: string;
  group: string;
};

function MoreButton() {
  return (
    <button
      type="button"
      className="rounded-md p-1 text-navy-muted hover:bg-navy-wash"
      aria-label="More"
    >
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
      </svg>
    </button>
  );
}

function MailIcon() {
  return (
    <svg
      className="size-5 shrink-0 text-[#3d8bd9]"
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

function PlusIcon() {
  return (
    <svg
      className="size-5 shrink-0 text-navy-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function Ring({ value }: { value: number | string }) {
  return (
    <span className="relative flex size-12 shrink-0 items-center justify-center">
      <svg
        className="absolute inset-0 size-12 -rotate-90"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke="#e8eef3"
          strokeWidth="4"
        />
        <circle
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke="#3d8bd9"
          strokeWidth="4"
          strokeDasharray="28 113"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[11px] font-semibold text-navy">{value}</span>
    </span>
  );
}

function Avatar({ label }: { label: string }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e7f3fc] text-xs font-semibold text-[#2f7fd4]">
      {label.slice(0, 1)}
    </span>
  );
}

export function QueueLeaderboard({ items }: { items: readonly RankItem[] }) {
  return (
    <Card className="flex h-full flex-col">
      <h2 className="text-lg font-semibold text-navy">Leaderboard</h2>
      <ul className="mt-4 flex flex-1 flex-col justify-center">
        {items.map((item, index) => (
          <li
            key={item.name}
            className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-b-0 last:pb-0"
          >
            <Avatar label={String(index + 1)} />
            <Link
              href={asRoute(item.href)}
              className="min-w-0 flex-1 hover:underline"
            >
              <span className="block text-sm font-semibold tracking-wide text-navy uppercase">
                {item.name}
              </span>
              <span className="block text-xs text-navy-muted">
                {item.detail}
              </span>
            </Link>
            <span className="text-sm font-semibold text-navy">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function InfoStack({
  onboardingTotal,
  href,
  refreshOn,
}: {
  onboardingTotal: number;
  href: string;
  refreshOn?: string;
}) {
  return (
    <div className="flex h-full flex-col gap-5">
      <Card className="flex flex-1 flex-col justify-center">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#e7f3fc]">
            <svg
              className="size-5 text-[#3d8bd9]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16.5v.5" />
            </svg>
          </span>
          <h2 className="text-base font-semibold text-navy">Did you know?</h2>
        </div>
        <LastUpdated time={refreshOn} />
      </Card>
      <Link
        href={asRoute(href)}
        className="flex min-h-[7rem] flex-1 items-center rounded-2xl bg-[#1a4a5c] px-5 py-6 text-lg font-semibold text-white shadow-[0_10px_28px_rgba(15,40,70,0.08)] hover:bg-[#163d4c]"
      >
        {onboardingTotal} onboarding records
      </Link>
    </div>
  );
}

export function QueueHighlights({
  items,
}: {
  items: readonly HighlightItem[];
}) {
  return (
    <Card padded={false} className="h-full">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-lg font-semibold text-navy">Client Highlights</h2>
        <MoreButton />
      </div>
      <ul>
        {items.map((item) => (
          <li
            key={item.name}
            className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-5 py-3.5"
          >
            <Avatar label={item.name} />
            <div className="min-w-[9rem] flex-1">
              <p className="text-sm font-semibold tracking-wide text-navy uppercase">
                {item.name}
              </p>
              <p className="text-xs text-navy-muted">{item.detail}</p>
            </div>
            <p className="min-w-36 text-sm text-navy">{item.status}</p>
            <p className="text-xs text-navy-muted">{item.meta}</p>
            <MailIcon />
            <Link
              href={asRoute(item.href)}
              className="text-sm font-medium text-[#3d8bd9] hover:underline"
            >
              View Details
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function FulfilmentTasks({ items }: { items: readonly TaskItem[] }) {
  return (
    <Card className="h-full">
      <h2 className="mb-2 text-lg font-semibold text-navy">Tasks</h2>
      <ul>
        {items.map((item) => (
          <li
            key={item.title}
            className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-b-0 last:pb-0"
          >
            <Ring value={item.value} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-navy">{item.title}</p>
              <p className="text-xs text-navy-muted">{item.category}</p>
            </div>
            <span className="rounded-md bg-[#e7f3fc] px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-[#2f7fd4]">
              {item.unit}
            </span>
            <PlusIcon />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function GeographyTable({ rows }: { rows: CustomerSlice["geography"] }) {
  return (
    <div className="mt-2 max-h-24 overflow-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-navy-muted">
            <th className="py-1 font-medium">Country</th>
            <th className="py-1 text-right font-medium">Number in queue</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2} className="py-2 text-center text-navy-muted">
                No countries in queue
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.country} className="border-t border-slate-100">
                <td className="py-1">{row.country}</td>
                <td className="py-1 text-right">{row.count}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function GeographyPanel({
  personal,
  corporate,
}: {
  personal: CustomerSlice;
  corporate: CustomerSlice;
}) {
  return (
    <Card className="h-full">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">Calendar</h2>
        <div className="flex gap-1 text-navy-muted" aria-hidden="true">
          <span>‹</span>
          <span>›</span>
        </div>
      </div>
      <section className="mb-4">
        <h3 className="mb-2 text-center text-sm font-medium text-navy">
          PERSONAL onboarding by geography
        </h3>
        <WorldMap id="personal" highlight={personal.geography.length > 0} />
        <GeographyTable rows={personal.geography} />
        <h4 className="mt-3 mb-1 text-center text-sm font-medium text-navy">
          PERSONAL registration by legal entity
        </h4>
        <ChartPlaceholder kind="bar" compact bars={personal.legalEntities} />
      </section>
      <section>
        <h3 className="mb-2 text-center text-sm font-medium text-navy">
          CORPORATE onboarding by geography
        </h3>
        <WorldMap id="corporate" highlight={corporate.geography.length > 0} />
        <GeographyTable rows={corporate.geography} />
        <h4 className="mt-3 mb-1 text-center text-sm font-medium text-navy">
          CORPORATE registration by legal entity
        </h4>
        <ChartPlaceholder kind="bar" compact bars={corporate.legalEntities} />
      </section>
    </Card>
  );
}

export function TimelineSchedule({ rows }: { rows: readonly ScheduleRow[] }) {
  return (
    <Card className="h-full">
      <h2 className="mb-2 text-lg font-semibold text-navy">Schedule</h2>
      <ul>
        {rows.map((row) => (
          <li
            key={`${row.group}-${row.label}`}
            className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-b-0 last:pb-0"
          >
            <span className="flex h-8 min-w-14 items-center justify-center rounded-full bg-[#3d8bd9] px-2 text-[11px] font-semibold text-white">
              {row.value}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-navy">{row.label}</p>
              <p className="text-xs text-navy-muted">{row.unit}</p>
            </div>
            <PlusIcon />
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function MetricsCard({
  personal,
  corporate,
  inward,
  outward,
}: {
  personal: CustomerSlice;
  corporate: CustomerSlice;
  inward: PaymentSlice;
  outward: PaymentSlice;
}) {
  return (
    <Card className="h-full">
      <h2 className="mb-3 text-lg font-semibold text-navy">Metrics</h2>
      <div className="grid grid-cols-2 gap-2">
        <section className="text-center">
          <h3 className="mb-1 text-[11px] font-medium text-navy">
            PERSONAL registration fulfilment (Today)
          </h3>
          <ChartPlaceholder
            kind="donut"
            compact
            slices={personal.fulfilment.graph}
          />
        </section>
        <section className="text-center">
          <h3 className="mb-1 text-[11px] font-medium text-navy">
            CORPORATE registration fulfilment (Today)
          </h3>
          <ChartPlaceholder
            kind="donut"
            compact
            slices={corporate.fulfilment.graph}
          />
        </section>
        <section className="text-center">
          <h3 className="mb-1 text-[11px] font-medium text-navy">
            Inward fulfilment (Today)
          </h3>
          <ChartPlaceholder
            kind="donut"
            compact
            slices={inward.fulfilment.graph}
          />
        </section>
        <section className="text-center">
          <h3 className="mb-1 text-[11px] font-medium text-navy">
            Outward fulfilment (Today)
          </h3>
          <ChartPlaceholder
            kind="donut"
            compact
            slices={outward.fulfilment.graph}
          />
        </section>
      </div>
      <h3 className="mt-3 mb-1 text-center text-sm font-medium text-navy">
        Inward by legal entity
      </h3>
      <ChartPlaceholder kind="bar" compact bars={inward.legalEntities} />
      <p className="mb-3 text-center text-sm">
        <Link
          href={asRoute(dashboardLinks.inward)}
          className="font-medium text-navy hover:underline"
        >
          {inward.total} payments in records
        </Link>
      </p>
      <h3 className="mb-1 text-center text-sm font-medium text-navy">
        Outward by legal entity
      </h3>
      <ChartPlaceholder kind="bar" compact bars={outward.legalEntities} />
      <p className="text-center text-sm">
        <Link
          href={asRoute(dashboardLinks.outward)}
          className="font-medium text-navy hover:underline"
        >
          {outward.total} payments out records
        </Link>
      </p>
    </Card>
  );
}
