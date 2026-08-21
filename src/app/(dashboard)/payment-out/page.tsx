import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { paymentColumns } from "@/constants/screens";

export const metadata: Metadata = {
  title: "Outward payments",
};

export default function PaymentOutQueuePage() {
  return (
    <>
      <PageHeader
        title="Outward payments"
        description="Funds-out cases awaiting compliance review."
      />
      <WorkQueueScreen
        columns={paymentColumns}
        emptyTitle="No outward payments in queue"
        emptyDescription="HOLD / failed funds-out will appear here after the API is wired."
      />
    </>
  );
}
