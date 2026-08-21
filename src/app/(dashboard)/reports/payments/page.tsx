import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { paymentColumns } from "@/constants/screens";

export const metadata: Metadata = {
  title: "Payments report",
};

export default function PaymentsReportPage() {
  return (
    <>
      <PageHeader
        title="Payments report"
        description="Search inward and outward payment history."
      />
      <WorkQueueScreen
        columns={paymentColumns}
        emptyTitle="No report results"
        emptyDescription="Run a search after the report API is wired."
        showExport
      />
    </>
  );
}
