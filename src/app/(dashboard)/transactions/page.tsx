import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { paymentColumns } from "@/constants/screens";

export const metadata: Metadata = {
  title: "Payments queue",
};

export default function PaymentsQueuePage() {
  return (
    <>
      <PageHeader
        title="Payments"
        description="Inward and outward payments awaiting compliance review."
      />
      <WorkQueueScreen
        columns={paymentColumns}
        emptyTitle="No payments in queue"
        emptyDescription="Funds in / funds out cases will appear here after the API is wired."
      />
    </>
  );
}
