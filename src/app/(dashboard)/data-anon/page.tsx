import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { dataAnonColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
import { getDataAnonQueue } from "@/features/queues/services/queue-service";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Data anonymisation",
};

export default function DataAnonPage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader
        title="Data anonymisation"
        description="GDPR requests to initiate, approve, or cancel PII scrubbing."
      />
      <QueuePageBody
        searchParams={searchParams}
        load={getDataAnonQueue}
        columns={dataAnonColumns}
        emptyTitle="No anonymisation requests"
        emptyDescription="Requests will appear here from /dataAnonQueue."
      />
    </>
  );
}
