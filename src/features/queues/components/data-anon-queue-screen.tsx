import { DataAnonQueueTable } from "./data-anon-queue-table";
import type { QueueResult } from "../types";

type DataAnonQueueScreenProps = {
  emptyTitle: string;
  emptyDescription: string;
  result: QueueResult;
};

export function DataAnonQueueScreen({
  emptyTitle,
  emptyDescription,
  result,
}: DataAnonQueueScreenProps) {
  const from = result.rows.length === 0 ? 0 : 1;
  const to = result.rows.length;

  return (
    <div className="space-y-4">
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
    </div>
  );
}
