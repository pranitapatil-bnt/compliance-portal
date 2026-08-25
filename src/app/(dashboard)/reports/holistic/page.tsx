import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { routes } from "@/constants/routes";
import { OnboardingQueueScreen } from "@/features/queues/components/onboarding-queue-screen";
import { readQueueQuery } from "@/features/queues/search-body";
import {
  getHolisticSearch,
  getOrganizationNames,
} from "@/features/queues/services/queue-service";
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
  const [result, organizations] = await Promise.all([
    hasSearch
      ? getHolisticSearch(query)
      : Promise.resolve({ rows: [], total: 0 }),
    getOrganizationNames(),
  ]);

  return (
    <>
      <PageHeader
        title="Holistic view"
        description="Search a client and open their 360° profile, payments, and checks."
      />
      <OnboardingQueueScreen
        result={result}
        query={query}
        organizations={organizations}
        action={routes.reportsHolistic}
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
