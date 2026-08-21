import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { transactionColumns } from "@/constants/screens";

export const metadata: Metadata = {
  title: "Transaction report",
};

export default function TransactionReportPage() {
  return (
    <>
      <PageHeader
        title="Transaction report"
        description="Search unified transaction history."
      />
      <WorkQueueScreen
        columns={transactionColumns}
        emptyTitle="No report results"
        emptyDescription="Run a search after the report API is wired."
        showExport
      />
    </>
  );
}
