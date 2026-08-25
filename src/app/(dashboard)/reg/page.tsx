import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { onboardingColumns } from "@/constants/screens";
import { QueuePageBody } from "@/features/queues";
import { getRegistrationQueue } from "@/features/queues/services/queue-service";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Onboarding queue",
};

export const dynamic = "force-dynamic";

export default function OnboardingQueuePage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader title="Onboarding queue" />
      <QueuePageBody
        searchParams={searchParams}
        load={getRegistrationQueue}
        columns={onboardingColumns}
        emptyTitle="No onboarding cases"
        emptyDescription="Failed registrations will appear here from /regQueue."
        variant="onboarding"
      />
    </>
  );
}
