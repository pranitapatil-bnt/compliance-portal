import { WorkQueueScreen } from "@/components/shared/work-queue-screen";
import { routes } from "@/constants/routes";

import { DataAnonQueueScreen } from "./data-anon-queue-screen";
import { OnboardingQueueScreen } from "./onboarding-queue-screen";
import { PaymentsQueueScreen } from "./payments-queue-screen";
import { TransactionQueueScreen } from "./transaction-queue-screen";
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
  variant?: "default" | "onboarding" | "payments" | "transaction" | "data-anon";
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
    const [organizations, result] = await Promise.all([
      getOrganizationNames(),
      load(query),
    ]);
    return (
      <OnboardingQueueScreen
        query={query}
        organizations={organizations}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        action={fromReport ? routes.reportsOnboarding : routes.reg}
        endpoint={fromReport ? "reg-report-criteria" : "reg-queue"}
        result={result}
      />
    );
  }

  if (variant === "payments") {
    const [organizations, result] = await Promise.all([
      getOrganizationNames(),
      load(query),
    ]);
    return (
      <PaymentsQueueScreen
        query={query}
        organizations={organizations}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        action={fromReport ? routes.reportsPayments : routes.transactions}
        result={result}
      />
    );
  }

  if (variant === "transaction") {
    const result = await load(query);
    return (
      <TransactionQueueScreen
        query={query}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        action={fromReport ? routes.reportsTransactions : routes.txnApi}
        result={result}
      />
    );
  }

  if (variant === "data-anon") {
    const result = await load(query);
    return (
      <DataAnonQueueScreen
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        result={result}
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
