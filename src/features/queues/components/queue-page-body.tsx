import { WorkQueueScreen } from "@/components/shared/work-queue-screen";

import { readQueueQuery } from "../search-body";
import type { QueueQuery, QueueResult, QueueSearchParams } from "../types";

type QueuePageBodyProps = {
  searchParams: Promise<QueueSearchParams>;
  load: (query: QueueQuery) => Promise<QueueResult>;
  columns: readonly string[];
  emptyTitle: string;
  emptyDescription: string;
  showExport?: boolean;
  fromReport?: boolean;
};

export async function QueuePageBody({
  searchParams,
  load,
  columns,
  emptyTitle,
  emptyDescription,
  showExport = false,
  fromReport = false,
}: QueuePageBodyProps) {
  const params = await searchParams;
  const query = readQueueQuery(params, { fromReport });
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
