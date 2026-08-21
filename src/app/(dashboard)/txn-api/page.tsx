import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { transactionColumns } from "@/constants/screens";

export const metadata: Metadata = {
  title: "Transaction queue",
};

export default function TransactionQueuePage() {
  return (
    <>
      <PageHeader
        title="Transaction"
        description="Unified /transaction API records awaiting review."
      />
      <WorkQueueScreen
        columns={transactionColumns}
        emptyTitle="No transactions in queue"
        emptyDescription="HOLD / failed payments will appear here after the API is wired."
      />
    </>
  );
}
