import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { paymentColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
import { getPaymentInQueue } from "@/features/queues/services/queue-service";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Inward payments",
};

export default function PaymentInQueuePage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader
        title="Inward payments"
        description="Funds-in cases awaiting compliance review."
      />
      <QueuePageBody
        searchParams={searchParams}
        load={getPaymentInQueue}
        columns={paymentColumns}
        emptyTitle="No inward payments in queue"
        emptyDescription="HOLD / failed funds-in will appear here from /payInQueue."
      />
    </>
  );
}
