import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { onboardingColumns } from "@/constants/screens";

export const metadata: Metadata = {
  title: "Onboarding queue",
};

export default function OnboardingQueuePage() {
  return (
    <>
      <PageHeader
        title="Onboarding"
        description="Clients who failed compliance checks at registration."
      />
      <WorkQueueScreen
        columns={onboardingColumns}
        emptyTitle="No onboarding cases"
        emptyDescription="Failed registrations will appear here after the queue API is wired."
      />
    </>
  );
}
