import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { beneficiaryColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
import { getBeneficiaryReport } from "@/features/queues/services/queue-service";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Beneficiaries",
};

export default function BeneficiariesReportPage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader
        title="Beneficiaries"
        description="Search beneficiaries and related client transactions."
      />
      <QueuePageBody
        searchParams={searchParams}
        load={getBeneficiaryReport}
        columns={beneficiaryColumns}
        emptyTitle="No beneficiaries"
        emptyDescription="Results will appear here from /beneReportApply."
        showExport
      />
    </>
  );
}
