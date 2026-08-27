"use client";

import { routes } from "@/constants/routes";

import { PaymentsFilterBar } from "./payments-filter-bar";
import { PaymentsQueueTable } from "./payments-queue-table";
import {
  QueueResultLoader,
  type QueueLoaderEndpoint,
} from "./queue-result-loader";
import type { QueueQuery, QueueResult } from "../types";
import { useOrganizationNames } from "../use-organization-names";

type PaymentsQueueScreenProps = {
  query: QueueQuery;
  organizations?: string[];
  emptyTitle: string;
  emptyDescription: string;
  action?: string;
  endpoint?: QueueLoaderEndpoint;
  result?: QueueResult;
};

function PaymentsResult({
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
    </>
  );
}

export function PaymentsQueueScreen({
  query,
  organizations,
  emptyTitle,
  emptyDescription,
  action = routes.transactions,
  endpoint = "transaction-queue",
  result,
}: PaymentsQueueScreenProps) {
  const loadedOrgs = useOrganizationNames();
  const orgNames = organizations ?? loadedOrgs;
  return (
    <div className="space-y-4">
      <PaymentsFilterBar
        query={query}
        organizations={orgNames}
        action={action}
      />
      {result ? (
        <PaymentsResult
          result={result}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      ) : (
        <QueueResultLoader endpoint={endpoint} query={query}>
          {(loaded) => (
            <PaymentsResult
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
