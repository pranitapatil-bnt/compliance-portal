"use client";

import { DataAnonQueueTable } from "./data-anon-queue-table";
import { QueueResultLoader } from "./queue-result-loader";
import type { QueueQuery, QueueResult } from "../types";

type DataAnonQueueScreenProps = {
  query: QueueQuery;
  emptyTitle: string;
  emptyDescription: string;
  result?: QueueResult;
};

function DataAnonResult({
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
      <DataAnonQueueTable
        result={result}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
      {result.rows.length > 0 ? (
        <p className="text-sm text-navy-muted">
          Showing {from} - {to} of {result.total} records
        </p>
      ) : null}
    </>
  );
}

export function DataAnonQueueScreen({
  query,
  emptyTitle,
  emptyDescription,
  result,
}: DataAnonQueueScreenProps) {
  return (
    <div className="space-y-4">
      {result ? (
        <DataAnonResult
          result={result}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      ) : (
        <QueueResultLoader endpoint="data-anon-queue" query={query}>
          {(loaded) => (
            <DataAnonResult
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
