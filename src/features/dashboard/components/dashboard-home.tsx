import Link from "next/link";

import { asRoute } from "@/lib/utils/routes";

import { KpiStrip } from "./kpi-strip";
import { LastUpdated } from "./last-updated";
import { OnboardingColumn } from "./onboarding-column";
import { PaymentColumn } from "./payment-column";
import { dashboardLinks, dashboardPlaceholder } from "../data";

const data = dashboardPlaceholder;

export function DashboardHome() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Dashboard</h1>
        <LastUpdated />
      </div>

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

      <h2 className="text-lg font-normal">
        <Link href={asRoute(dashboardLinks.onboarding)} className="font-medium text-navy hover:underline">
          {data.onboardingTotal} onboarding records
        </Link>
      </h2>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="space-y-5">
          <OnboardingColumn kind="PERSONAL" data={data.personal} />
          <PaymentColumn kind="inward" data={data.inward} />
        </div>
        <div className="space-y-5">
          <OnboardingColumn kind="CORPORATE" data={data.corporate} />
          <PaymentColumn kind="outward" data={data.outward} />
        </div>
      </div>
    </div>
  );
}
