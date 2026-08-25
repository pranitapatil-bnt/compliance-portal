import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { onboardingColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
import { getOnboardingReport } from "@/features/queues/services/queue-service";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Onboarding report",
};

export default function OnboardingReportPage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader
        title="Onboarding report"
        description="Search onboarding history, including cases already worked."
      />
      <QueuePageBody
        searchParams={searchParams}
        load={getOnboardingReport}
        columns={onboardingColumns}
        emptyTitle="No report results"
        emptyDescription="Run a search against /regReportCriteria."
        showExport
        fromReport
        variant="onboarding"
      />
    </>
  );
}
