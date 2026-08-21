import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { paymentColumns } from "@/constants/screens";

export const metadata: Metadata = {
  title: "Inward payments",
};

export default function PaymentInQueuePage() {
  return (
    <>
      <PageHeader
        title="Inward payments"
        description="Funds-in cases awaiting compliance review."
      />
      <WorkQueueScreen
        columns={paymentColumns}
        emptyTitle="No inward payments in queue"
        emptyDescription="HOLD / failed funds-in will appear here after the API is wired."
      />
    </>
  );
}
