import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { paymentColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
import { getPaymentsReport } from "@/features/queues/services/queue-service";
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
        load={getPaymentsReport}
        columns={paymentColumns}
        emptyTitle="No report results"
        emptyDescription="Run a search against /transactionReport."
        showExport
      />
    </>
  );
}
