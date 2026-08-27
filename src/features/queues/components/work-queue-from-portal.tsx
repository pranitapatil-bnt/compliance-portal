"use client";

import { WorkQueueScreen } from "@/components/shared/work-queue-screen";

import {
  QueueResultLoader,
  type QueueLoaderEndpoint,
} from "./queue-result-loader";
import type { QueueQuery } from "../types";

type WorkQueueFromPortalProps = {
  endpoint: QueueLoaderEndpoint;
  query: QueueQuery;
  columns: readonly string[];
  emptyTitle: string;
  emptyDescription: string;
  showExport?: boolean;
};

export function WorkQueueFromPortal({
  endpoint,
  query,
  columns,
  emptyTitle,
  emptyDescription,
  showExport = false,
}: WorkQueueFromPortalProps) {
  return (
    <QueueResultLoader endpoint={endpoint} query={query}>
      {(result) => (
        <WorkQueueScreen
          columns={columns}
          result={result}
          keyword={query.keyword}
          status={query.status}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          showExport={showExport}
        />
      )}
    </QueueResultLoader>
  );
}
