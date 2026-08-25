"use client";

import { routes } from "@/constants/routes";

import {
  QueueResultLoader,
  type QueueLoaderEndpoint,
} from "./queue-result-loader";
import { TransactionFilterBar } from "./transaction-filter-bar";
import { TransactionQueueTable } from "./transaction-queue-table";
import type { QueueQuery, QueueResult } from "../types";

type TransactionQueueScreenProps = {
  query: QueueQuery;
  emptyTitle: string;
  emptyDescription: string;
  action?: string;
  endpoint?: QueueLoaderEndpoint;
  result?: QueueResult;
};

function TransactionResult({
  result,
  emptyTitle,
  emptyDescription,
}: {
  result: QueueResult;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const from = result.rows.length === 0 ? 0 : 1;
  const to = result.rows.length;

  return (
    <>
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
    </>
  );
}

export function TransactionQueueScreen({
  query,
  emptyTitle,
  emptyDescription,
  action = routes.txnApi,
  endpoint = "txn-api-queue",
  result,
}: TransactionQueueScreenProps) {
  return (
    <div className="space-y-4">
      <TransactionFilterBar query={query} action={action} />
      {result ? (
        <TransactionResult
          result={result}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      ) : (
        <QueueResultLoader endpoint={endpoint} query={query}>
          {(loaded) => (
            <TransactionResult
              result={loaded}
              emptyTitle={emptyTitle}
              emptyDescription={emptyDescription}
            />
          )}
        </QueueResultLoader>
      )}
    </div>
  );
}
