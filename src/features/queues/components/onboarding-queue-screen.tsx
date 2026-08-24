import { OnboardingFilterBar } from "./onboarding-filter-bar";
import { OnboardingQueueTable } from "./onboarding-queue-table";
import type { QueueQuery, QueueResult } from "../types";

type OnboardingQueueScreenProps = {
  result: QueueResult;
  query: QueueQuery;
  emptyTitle: string;
  emptyDescription: string;
};

export function OnboardingQueueScreen({
  result,
  query,
  emptyTitle,
  emptyDescription,
}: OnboardingQueueScreenProps) {
  return (
    <div className="space-y-4">
      {result.error ? (
        <p className="rounded-2xl bg-[#fdecec] px-4 py-2.5 text-sm text-navy">
          {result.error}
        </p>
      ) : null}

      <OnboardingFilterBar query={query} organizations={result.organizations} />

      <OnboardingQueueTable
        result={result}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />

      {result.rows.length > 0 ? (
        <p className="text-sm text-navy-muted">
          Showing <strong className="text-navy">{result.rows.length}</strong> of{" "}
          <strong className="text-navy">{result.total}</strong> records
        </p>
      ) : null}
    </div>
  );
}
