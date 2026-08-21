import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { workEfficiencyColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
import { getWorkEfficiencyReport } from "@/features/queues/services/queue-service";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Work efficiency",
};

export default function WorkEfficiencyReportPage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader
        title="Work efficiency"
        description="Analyst SLA and case throughput."
      />
      <QueuePageBody
        searchParams={searchParams}
        load={getWorkEfficiencyReport}
        columns={workEfficiencyColumns}
        emptyTitle="No efficiency data"
        emptyDescription="Metrics will appear here from /workEfficiencyReport."
        showExport
      />
    </>
  );
}
