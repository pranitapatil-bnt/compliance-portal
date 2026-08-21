import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { paymentColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
import { getTransactionQueue } from "@/features/queues/services/queue-service";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Payments queue",
};

export default function PaymentsQueuePage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader
        title="Payments"
        description="Inward and outward payments awaiting compliance review."
      />
      <QueuePageBody
        searchParams={searchParams}
        load={getTransactionQueue}
        columns={paymentColumns}
        emptyTitle="No payments in queue"
        emptyDescription="Funds in / funds out cases will appear here from /transactionQueue."
      />
    </>
  );
}
