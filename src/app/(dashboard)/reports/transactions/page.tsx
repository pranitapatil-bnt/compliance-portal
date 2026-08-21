import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { transactionColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
import { getTxnApiReport } from "@/features/queues/services/queue-service";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Transaction report",
};

export default function TransactionReportPage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader
        title="Transaction report"
        description="Search unified transaction history."
      />
      <QueuePageBody
        searchParams={searchParams}
        load={getTxnApiReport}
        columns={transactionColumns}
        emptyTitle="No report results"
        emptyDescription="Run a search against /txnApiReport."
        showExport
      />
    </>
  );
}
