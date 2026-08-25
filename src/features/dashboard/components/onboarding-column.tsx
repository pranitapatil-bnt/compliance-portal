import Link from "next/link";

import { asRoute } from "@/lib/utils/routes";

import { ChartPlaceholder } from "./chart-placeholder";
import { StatRow } from "./stat-row";
import { WorldMap } from "./world-map";
import type { CustomerSlice } from "../data";
import { dashboardLinks } from "../data";

type OnboardingColumnProps = {
  kind: "PERSONAL" | "CORPORATE";
  data: CustomerSlice;
};

export function OnboardingColumn({ kind, data }: OnboardingColumnProps) {
  const unit = data.timeline.unit === "days" ? "days" : "minutes";
  const newestUnit = data.timeline.newest === 1 ? unit.slice(0, -1) : unit;

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-line bg-white shadow-[0_8px_24px_rgba(46,26,122,0.05)]">
      <h3 className="border-b border-navy-line py-3 text-center text-sm font-medium text-navy">
        <Link href={asRoute(dashboardLinks.onboarding)} className="font-semibold text-navy hover:underline">
          {data.total} {kind} records
        </Link>
        <span className="text-navy-muted"> ({data.percent}% of queue)</span>
      </h3>

      <section className="border-b border-navy-line px-4 py-4 text-center">
        <h4 className="mb-3 text-sm font-medium text-navy">
          {kind} onboarding by geography
        </h4>
        <WorldMap id={kind.toLowerCase()} highlight={data.geography.length > 0} />
        <div className="mt-2 max-h-24 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-navy-muted">
                <th className="py-1 font-medium">Country</th>
                <th className="py-1 text-right font-medium">Number in queue</th>
              </tr>
            </thead>
            <tbody>
              {data.geography.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-2 text-center text-navy-muted">
                    No countries in queue
                  </td>
                </tr>
              ) : (
                data.geography.map((row) => (
                  <tr key={row.country} className="border-t border-navy-line">
                    <td className="py-1">{row.country}</td>
                    <td className="py-1 text-right">{row.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-b border-navy-line px-4 py-4 text-center">
        <h4 className="mb-2 text-sm font-medium text-navy">
          {kind} registration by legal entity
        </h4>
        <ChartPlaceholder kind="bar" bars={data.legalEntities} />
      </section>

      <section className="border-b border-navy-line px-4 py-4">
        <h4 className="mb-2 text-center text-sm font-medium text-navy">
          {kind} registration fulfilment (Today)
        </h4>
        <ChartPlaceholder kind="donut" slices={data.fulfilment.graph} />
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
        <h4 className="mb-2 text-center text-sm font-medium text-navy">
          {kind} registration timeline snapshot
        </h4>
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
  );
}
