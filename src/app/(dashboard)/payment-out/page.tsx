import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { paymentColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
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
        endpoint="payment-out-queue"
        columns={paymentColumns}
        emptyTitle="No outward payments in queue"
        emptyDescription="HOLD / failed funds-out will appear here from /paymentOutQueue."
      />
    </>
  );
}
