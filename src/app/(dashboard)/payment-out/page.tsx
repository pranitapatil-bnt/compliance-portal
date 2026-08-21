import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { paymentColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
import { getPaymentOutQueue } from "@/features/queues/services/queue-service";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Outward payments",
};

export default function PaymentOutQueuePage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader
        title="Outward payments"
        description="Funds-out cases awaiting compliance review."
      />
      <QueuePageBody
        searchParams={searchParams}
        load={getPaymentOutQueue}
        columns={paymentColumns}
        emptyTitle="No outward payments in queue"
        emptyDescription="HOLD / failed funds-out will appear here from /paymentOutQueue."
      />
    </>
  );
}
