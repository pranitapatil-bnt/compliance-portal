import { routes } from "@/constants/routes";

import { TransactionFilterBar } from "./transaction-filter-bar";
import { TransactionQueueTable } from "./transaction-queue-table";
import type { QueueQuery, QueueResult } from "../types";

type TransactionQueueScreenProps = {
  query: QueueQuery;
  emptyTitle: string;
  emptyDescription: string;
  action?: string;
  result: QueueResult;
};

export function TransactionQueueScreen({
  query,
  emptyTitle,
  emptyDescription,
  action = routes.txnApi,
  result,
}: TransactionQueueScreenProps) {
  const from = result.rows.length === 0 ? 0 : 1;
  const to = result.rows.length;

  return (
    <div className="space-y-4">
      <TransactionFilterBar query={query} action={action} />
      {result.error ? (
        <p className="rounded-2xl bg-[#fdecec] px-4 py-2.5 text-sm text-navy">
          {result.error}
        </p>
      ) : null}
      <TransactionQueueTable
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
