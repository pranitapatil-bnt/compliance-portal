import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { onboardingColumns } from "@/constants/screens";
import { getHolisticSearch } from "@/features/queues/services/queue-service";
import { readQueueQuery } from "@/features/queues/search-body";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Holistic view",
};

export default async function HolisticReportPage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  const params = await searchParams;
  const query = readQueueQuery(params, { fromReport: true });
  const hasSearch = Boolean(query.keyword);
  const result = hasSearch
    ? await getHolisticSearch(query)
    : { rows: [], total: 0 };

  return (
    <>
      <PageHeader
        title="Holistic view"
        description="Search a client and open their 360° profile, payments, and checks."
      />
      <WorkQueueScreen
        columns={onboardingColumns}
        result={result}
        keyword={query.keyword}
        status={query.status}
        emptyTitle={hasSearch ? "No matching clients" : "No client selected"}
        emptyDescription={
          hasSearch
            ? "Try another name, email, or account."
            : "Type a client name, email, or account and search."
        }
      />
    </>
  );
}
