import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { transactionColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
import { getTxnApiQueue } from "@/features/queues/services/queue-service";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Transaction queue",
};

export default function TransactionQueuePage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader
        title="Transaction"
        description="Unified /transaction API records awaiting review."
      />
      <QueuePageBody
        searchParams={searchParams}
        load={getTxnApiQueue}
        columns={transactionColumns}
        emptyTitle="No transactions in queue"
        emptyDescription="HOLD / failed payments will appear here from /txnApiQueue."
      />
    </>
  );
}
