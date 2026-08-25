import { dashboardLinks } from "../data";
import { loadDashboardData } from "../services/dashboard-service";
import {
  FulfilmentTasks,
  GeographyPanel,
  InfoStack,
  MetricsCard,
  QueueHighlights,
  QueueLeaderboard,
  TimelineSchedule,
} from "./dashboard-widgets";
import { KpiStrip } from "./kpi-strip";

function timelineUnit(
  slice: { newest: number; unit: "days" | "minutes" },
  kind: "oldest" | "average" | "newest",
) {
  const unit = slice.unit === "days" ? "days" : "minutes";
  if (kind === "newest" && slice.newest === 1) {
    return unit.slice(0, -1);
  }
  return unit;
}

export async function DashboardHome() {
  const { data, error } = await loadDashboardData();
  const personalUnit =
    data.personal.timeline.unit === "days" ? "days" : "minutes";
  const corporateUnit =
    data.corporate.timeline.unit === "days" ? "days" : "minutes";

  return (
    <div className="flex flex-col gap-5">
      {error ? (
        <p className="rounded-2xl bg-[#fdecec] px-4 py-2.5 text-sm text-navy">
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <KpiStrip
          items={[
            {
              href: dashboardLinks.onboarding,
              label: "Onboarding",
              value: data.onboardingTotal,
              hint: "in queue",
            },
            {
              href: dashboardLinks.inward,
              label: "Inward",
              value: data.inwardTotal,
              hint: "awaiting review",
            },
            {
              href: dashboardLinks.outward,
              label: "Outward",
              value: data.outwardTotal,
              hint: "awaiting review",
            },
          ]}
        />
        <QueueLeaderboard
          items={[
            {
              name: "PERSONAL",
              detail: `${data.personal.percent}% of queue`,
              value: data.personal.total,
              href: dashboardLinks.onboarding,
            },
            {
              name: "CORPORATE",
              detail: `${data.corporate.percent}% of queue`,
              value: data.corporate.total,
              href: dashboardLinks.onboarding,
            },
            {
              name: "Inward",
              detail: "payments in records",
              value: data.inward.total,
              href: dashboardLinks.inward,
            },
            {
              name: "Outward",
              detail: "payments out records",
              value: data.outward.total,
              href: dashboardLinks.outward,
            },
          ]}
        />
        <InfoStack
          onboardingTotal={data.onboardingTotal}
          href={dashboardLinks.onboarding}
          refreshOn={data.refreshOn}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <QueueHighlights
            items={[
              {
                name: "PERSONAL",
                detail: `${data.personal.total} PERSONAL records`,
                status: `${data.personal.percent}% of queue`,
                meta: `Oldest record ${data.personal.timeline.oldest} ${personalUnit}`,
                href: dashboardLinks.onboarding,
              },
              {
                name: "CORPORATE",
                detail: `${data.corporate.total} CORPORATE records`,
                status: `${data.corporate.percent}% of queue`,
                meta: `Oldest record ${data.corporate.timeline.oldest} ${corporateUnit}`,
                href: dashboardLinks.onboarding,
              },
              {
                name: "Inward",
                detail: `${data.inward.total} payments in records`,
                status: "awaiting review",
                meta: `Oldest record ${data.inward.timeline.oldest} minutes`,
                href: dashboardLinks.inward,
              },
              {
                name: "Outward",
                detail: `${data.outward.total} payments out records`,
                status: "awaiting review",
                meta: `Oldest record ${data.outward.timeline.oldest} minutes`,
                href: dashboardLinks.outward,
              },
            ]}
          />
        </div>
        <FulfilmentTasks
          items={[
            {
              title: "PERSONAL registration fulfilment (Today)",
              category: `Average clearing time ${data.personal.fulfilment.avgClearingTime} minutes · Average per hour ${data.personal.fulfilment.avgPerHour} record · Cleared today ${data.personal.fulfilment.clearedToday} records`,
              value: data.personal.fulfilment.clearedToday,
              unit: "records",
            },
            {
              title: "CORPORATE registration fulfilment (Today)",
              category: `Average clearing time ${data.corporate.fulfilment.avgClearingTime} minutes · Average per hour ${data.corporate.fulfilment.avgPerHour} record · Cleared today ${data.corporate.fulfilment.clearedToday} records`,
              value: data.corporate.fulfilment.clearedToday,
              unit: "records",
            },
            {
              title: "Inward fulfilment (Today)",
              category: `Average clearing time ${data.inward.fulfilment.avgClearingTime} minutes · Average per hour ${data.inward.fulfilment.avgPerHour} record · Cleared today ${data.inward.fulfilment.clearedToday} records`,
              value: data.inward.fulfilment.clearedToday,
              unit: "records",
            },
            {
              title: "Outward fulfilment (Today)",
              category: `Average clearing time ${data.outward.fulfilment.avgClearingTime} minutes · Average per hour ${data.outward.fulfilment.avgPerHour} record · Cleared today ${data.outward.fulfilment.clearedToday} records`,
              value: data.outward.fulfilment.clearedToday,
              unit: "records",
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:col-span-2">
          <GeographyPanel personal={data.personal} corporate={data.corporate} />
          <TimelineSchedule
            rows={[
              {
                label: "PERSONAL registration timeline snapshot",
                value: data.personal.timeline.oldest,
                unit: `Oldest record ${data.personal.timeline.oldest} ${timelineUnit(data.personal.timeline, "oldest")} · Average record age ${data.personal.timeline.average} ${timelineUnit(data.personal.timeline, "average")} · Newest record ${data.personal.timeline.newest} ${timelineUnit(data.personal.timeline, "newest")}`,
                group: "PERSONAL",
              },
              {
                label: "CORPORATE registration timeline snapshot",
                value: data.corporate.timeline.oldest,
                unit: `Oldest record ${data.corporate.timeline.oldest} ${timelineUnit(data.corporate.timeline, "oldest")} · Average record age ${data.corporate.timeline.average} ${timelineUnit(data.corporate.timeline, "average")} · Newest record ${data.corporate.timeline.newest} ${timelineUnit(data.corporate.timeline, "newest")}`,
                group: "CORPORATE",
              },
              {
                label: "Inward timeline snapshot",
                value: data.inward.timeline.oldest,
                unit: `Oldest record ${data.inward.timeline.oldest} minutes · Average record age ${data.inward.timeline.average} minutes · Newest record ${data.inward.timeline.newest} ${data.inward.timeline.newest === 1 ? "minute" : "minutes"}`,
                group: "Inward",
              },
              {
                label: "Outward timeline snapshot",
                value: data.outward.timeline.oldest,
                unit: `Oldest record ${data.outward.timeline.oldest} minutes · Average record age ${data.outward.timeline.average} minutes · Newest record ${data.outward.timeline.newest} ${data.outward.timeline.newest === 1 ? "minute" : "minutes"}`,
                group: "Outward",
              },
            ]}
          />
        </div>
        <MetricsCard
          personal={data.personal}
          corporate={data.corporate}
          inward={data.inward}
          outward={data.outward}
        />
      </div>
    </div>
  );
}
