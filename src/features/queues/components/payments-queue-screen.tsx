import { routes } from "@/constants/routes";

import { PaymentsFilterBar } from "./payments-filter-bar";
import { PaymentsQueueTable } from "./payments-queue-table";
import type { QueueQuery, QueueResult } from "../types";

type PaymentsQueueScreenProps = {
  query: QueueQuery;
  organizations?: string[];
  emptyTitle: string;
  emptyDescription: string;
  action?: string;
  result: QueueResult;
};

export function PaymentsQueueScreen({
  query,
  organizations = [],
  emptyTitle,
  emptyDescription,
  action = routes.transactions,
  result,
}: PaymentsQueueScreenProps) {
  const from = result.rows.length === 0 ? 0 : 1;
  const to = result.rows.length;

  return (
    <div className="space-y-4">
      <PaymentsFilterBar
        query={query}
        organizations={organizations}
        action={action}
      />
      {result.error ? (
        <p className="rounded-2xl bg-[#fdecec] px-4 py-2.5 text-sm text-navy">
          {result.error}
        </p>
      ) : null}
      <PaymentsQueueTable
        result={result}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
      {result.rows.length > 0 ? (
        <p className="text-sm text-navy-muted">
          {from} - {to} of {result.total}
        </p>
      ) : null}
    </div>
  );
}
