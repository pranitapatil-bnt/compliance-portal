import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { workEfficiencyColumns } from "@/constants/screens";

export const metadata: Metadata = {
  title: "Work efficiency",
};

export default function WorkEfficiencyReportPage() {
  return (
    <>
      <PageHeader
        title="Work efficiency"
        description="Analyst SLA and case throughput."
      />
      <WorkQueueScreen
        columns={workEfficiencyColumns}
        emptyTitle="No efficiency data"
        emptyDescription="Metrics will appear here after the report API is wired."
        showExport
      />
    </>
  );
}
