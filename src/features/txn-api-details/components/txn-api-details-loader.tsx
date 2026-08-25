"use client";

import { useEffect, useState } from "react";

import { QueueTableSkeleton } from "@/features/queues/components/queue-table-skeleton";
import { complianceBff } from "@/lib/compliance/browser";

import { parseTxnApiDetails, txnApiDetailsBody } from "../parse";
import type { TxnApiDetails } from "../types";
import { TxnApiDetailsView } from "./txn-api-details-view";

type TxnApiDetailsLoaderProps = {
  transactionId: string;
  source: "REPORT" | "QUEUE";
};

export function TxnApiDetailsLoader({
  transactionId,
  source,
}: TxnApiDetailsLoaderProps) {
  const [details, setDetails] = useState<TxnApiDetails | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetails(null);

    void (async () => {
      try {
        const body = txnApiDetailsBody(transactionId, source);
        const query = new URLSearchParams({
          transactionId,
          source,
        });
        const payload = await complianceBff<unknown>(
          `txn-api-details?${query.toString()}`,
          {
            method: "POST",
            body: JSON.stringify(body),
          },
        );
        if (!cancelled) {
          setDetails(parseTxnApiDetails(payload, transactionId, source));
        }
      } catch (error) {
        if (!cancelled) {
          setDetails({
            transactionId,
            source,
            title: transactionId,
            status: "",
            sections: [],
            error:
              error instanceof Error
                ? error.message
                : "Could not load transaction details from the Java portal.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [transactionId, source]);

  if (!details) {
    return <QueueTableSkeleton />;
  }

  return <TxnApiDetailsView details={details} />;
}
