import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { beneficiaryColumns } from "@/constants/screens";

export const metadata: Metadata = {
  title: "Beneficiaries",
};

export default function BeneficiariesReportPage() {
  return (
    <>
      <PageHeader
        title="Beneficiaries"
        description="Search beneficiaries and related client transactions."
      />
      <WorkQueueScreen
        columns={beneficiaryColumns}
        emptyTitle="No beneficiaries"
        emptyDescription="Results will appear here after the beneficiary API is wired."
        showExport
      />
    </>
  );
}
