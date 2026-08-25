import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { routes } from "@/constants/routes";

import { OnboardingQueueScreen } from "./onboarding-queue-screen";
import { readQueueQuery } from "../search-body";
import { getOrganizationNames } from "../services/queue-service";
import type { QueueQuery, QueueResult, QueueSearchParams } from "../types";

type QueuePageBodyProps = {
  searchParams: Promise<QueueSearchParams>;
  load: (query: QueueQuery) => Promise<QueueResult>;
  columns: readonly string[];
  emptyTitle: string;
  emptyDescription: string;
  showExport?: boolean;
  fromReport?: boolean;
  variant?: "default" | "onboarding";
};

export async function QueuePageBody({
  searchParams,
  load,
  columns,
  emptyTitle,
  emptyDescription,
  showExport = false,
  fromReport = false,
  variant = "default",
}: QueuePageBodyProps) {
  const params = await searchParams;
  const query = readQueueQuery(params, { fromReport });

  if (variant === "onboarding") {
    const organizations = await getOrganizationNames();
    return (
      <OnboardingQueueScreen
        query={query}
        organizations={organizations}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        action={fromReport ? routes.reportsOnboarding : routes.reg}
        endpoint={fromReport ? "reg-report-criteria" : "reg-queue"}
      />
    );
  }

  const result = await load(query);

  return (
    <WorkQueueScreen
      columns={columns}
      result={result}
      keyword={query.keyword}
      status={query.status}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      showExport={showExport}
    />
  );
}
