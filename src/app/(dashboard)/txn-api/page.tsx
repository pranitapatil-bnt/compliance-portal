import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { QueuePageBody } from "@/features/queues";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Transaction queue",
};

export const dynamic = "force-dynamic";

export default function TransactionQueuePage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader title="Transaction queue" />
      <QueuePageBody
        searchParams={searchParams}
        emptyTitle="No transactions in queue"
        emptyDescription="HOLD / failed payments will appear here from /txnApiQueue."
        variant="transaction"
      />
    </>
  );
}
