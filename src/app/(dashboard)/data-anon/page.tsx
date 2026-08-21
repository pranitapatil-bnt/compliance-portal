import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { dataAnonColumns } from "@/constants/screens";

export const metadata: Metadata = {
  title: "Data anonymisation",
};

export default function DataAnonPage() {
  return (
    <>
      <PageHeader
        title="Data anonymisation"
        description="GDPR requests to initiate, approve, or cancel PII scrubbing."
      />
      <WorkQueueScreen
        columns={dataAnonColumns}
        emptyTitle="No anonymisation requests"
        emptyDescription="Requests will appear here after the data-anon API is wired."
      />
    </>
  );
}
