"use client";

import { useEffect, useState, type ReactNode } from "react";

import { complianceBffPost } from "@/lib/compliance/browser";

import { QueueTableSkeleton } from "./queue-table-skeleton";
import {
  mapBeneficiaryQueue,
  mapDataAnonQueue,
  mapPaymentInQueue,
  mapPaymentOutQueue,
  mapRegistrationQueue,
  mapTransactionQueue,
  mapTxnApiQueue,
  mapWorkEfficiency,
} from "../mappers";
import { buildQueueSearch } from "../search-body";
import type { QueueQuery, QueueResult } from "../types";

const mappers = {
  "bene-report-apply": mapBeneficiaryQueue,
  "data-anon-queue": mapDataAnonQueue,
  "pay-in-queue": mapPaymentInQueue,
  "payment-out-queue": mapPaymentOutQueue,
  "reg-queue": mapRegistrationQueue,
  "reg-report-criteria": mapRegistrationQueue,
  "transaction-queue": mapTransactionQueue,
  "transaction-report": mapTransactionQueue,
  "txn-api-queue": mapTxnApiQueue,
  "txn-api-report": mapTxnApiQueue,
  "work-efficiency-report": mapWorkEfficiency,
} as const;

export type QueueLoaderEndpoint = keyof typeof mappers;

function withTxnReportHref(
  endpoint: QueueLoaderEndpoint,
  result: QueueResult,
): QueueResult {
  if (endpoint !== "txn-api-report") {
    return result;
  }
  return {
    ...result,
    rows: result.rows.map((row) => {
      if (!row.href || row.href.includes("from=")) {
        return row;
      }
      const join = row.href.includes("?") ? "&" : "?";
      return { ...row, href: `${row.href}${join}from=report` };
    }),
  };
}

type QueueResultLoaderProps = {
  endpoint: QueueLoaderEndpoint;
  query: QueueQuery;
  children: (result: QueueResult) => ReactNode;
};

export function QueueResultLoader({
  endpoint,
  query,
  children,
}: QueueResultLoaderProps) {
  const [result, setResult] = useState<QueueResult | null>(null);
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    let cancelled = false;
    const map = mappers[endpoint];
    const parsedQuery = JSON.parse(queryKey) as QueueQuery;

    void (async () => {
      try {
        const payload = await complianceBffPost<unknown>(
          endpoint,
          buildQueueSearch(parsedQuery),
        );
        if (!cancelled) {
          setResult(withTxnReportHref(endpoint, map(payload)));
        }
      } catch (error) {
        if (!cancelled) {
          setResult({
            rows: [],
            total: 0,
            error:
              error instanceof Error
                ? error.message
                : "Could not load this queue from the Java portal.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [endpoint, queryKey]);

  if (!result) {
    return <QueueTableSkeleton />;
  }

  return children(result);
}
