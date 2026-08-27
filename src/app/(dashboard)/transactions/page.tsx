import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { QueuePageBody } from "@/features/queues";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Payments queue",
};

export const dynamic = "force-dynamic";

export default function PaymentsQueuePage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader title="Payments queue" />
      <QueuePageBody
        searchParams={searchParams}
        emptyTitle="No payments in queue"
        emptyDescription="Inward and outward cases will appear here from /transactionQueue."
        variant="payments"
      />
    </>
  );
}
