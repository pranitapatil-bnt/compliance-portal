import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { QueuePageBody } from "@/features/queues";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Payments report",
};

export default function PaymentsReportPage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader
        title="Payments report"
        description="Search inward and outward payment history."
      />
      <QueuePageBody
        searchParams={searchParams}
        emptyTitle="No report results"
        emptyDescription="Run a search against /transactionReport."
        showExport
        fromReport
        variant="payments"
      />
    </>
  );
}
