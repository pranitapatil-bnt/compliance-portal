import Link from "next/link";

import { ChartPlaceholder } from "./chart-placeholder";
import { StatRow } from "./stat-row";
import type { PaymentSlice } from "../data";
import { dashboardLinks } from "../data";
import { asRoute } from "@/lib/utils/routes";

type PaymentColumnProps = {
  kind: "inward" | "outward";
  data: PaymentSlice;
};

const copy = {
  inward: {
    title: "payments in records",
    legal: "Inward by legal entity",
    fulfil: "Inward fulfilment (Today)",
    timeline: "Inward timeline snapshot",
    href: dashboardLinks.inward,
  },
  outward: {
    title: "payments out records",
    legal: "Outward by legal entity",
    fulfil: "Outward fulfilment (Today)",
    timeline: "Outward timeline snapshot",
    href: dashboardLinks.outward,
  },
} as const;

export function PaymentColumn({ kind, data }: PaymentColumnProps) {
  const labels = copy[kind];
  const unit = "minutes";
  const newestUnit = data.timeline.newest === 1 ? "minute" : unit;

  return (
    <div>
      <h2 className="mb-3 text-lg font-normal">
        <Link href={asRoute(labels.href)} className="font-medium text-navy hover:underline">
          {data.total} {labels.title}
        </Link>
      </h2>
      <div className="overflow-hidden rounded-2xl border border-navy-line bg-white shadow-[0_8px_24px_rgba(46,26,122,0.05)]">
        <section className="border-b border-navy-line px-4 py-4 text-center">
          <h3 className="mb-2 text-sm font-medium text-navy">{labels.legal}</h3>
          <ChartPlaceholder kind="bar" />
        </section>
        <section className="border-b border-navy-line px-4 py-4">
          <h3 className="mb-2 text-center text-sm font-medium text-navy">
            {labels.fulfil}
          </h3>
          <ChartPlaceholder kind="donut" />
          <StatRow
            items={[
              {
                label: "Average clearing time",
                value: data.fulfilment.avgClearingTime,
                unit: "minutes",
              },
              {
                label: "Average per hour",
                value: data.fulfilment.avgPerHour,
                unit: "record",
              },
              {
                label: "Cleared today",
                value: data.fulfilment.clearedToday,
                unit: "records",
              },
            ]}
          />
        </section>
        <section className="px-4 py-4">
          <h3 className="mb-2 text-center text-sm font-medium text-navy">
            {labels.timeline}
          </h3>
          <StatRow
            items={[
              {
                label: "Oldest record",
                value: data.timeline.oldest,
                unit,
                href: true,
              },
              {
                label: "Average record age",
                value: data.timeline.average,
                unit,
              },
              {
                label: "Newest record",
                value: data.timeline.newest,
                unit: newestUnit,
                href: true,
              },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
