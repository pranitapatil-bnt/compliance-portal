import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { onboardingColumns } from "@/constants/screens";

export const metadata: Metadata = {
  title: "Onboarding report",
};

export default function OnboardingReportPage() {
  return (
    <>
      <PageHeader
        title="Onboarding report"
        description="Search onboarding history, including cases already worked."
      />
      <WorkQueueScreen
        columns={onboardingColumns}
        emptyTitle="No report results"
        emptyDescription="Run a search after the report API is wired."
        showExport
      />
    </>
  );
}
