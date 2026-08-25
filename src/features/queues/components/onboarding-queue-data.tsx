"use client";

import { useEffect, useState } from "react";

import { complianceBffPost } from "@/lib/compliance/browser";
import type { RegistrationQueueDto } from "@/lib/compliance/types";

import { OnboardingQueueTable } from "./onboarding-queue-table";
import { mapRegistrationQueue } from "../mappers";
import { buildQueueSearch } from "../search-body";
import type { QueueQuery, QueueResult } from "../types";

export type OnboardingQueueEndpoint = "reg-queue" | "reg-report-criteria";

type OnboardingQueueDataProps = {
  query: QueueQuery;
  endpoint: OnboardingQueueEndpoint;
  emptyTitle: string;
  emptyDescription: string;
  skip?: boolean;
};

export function OnboardingQueueData({
  query,
  endpoint,
  emptyTitle,
  emptyDescription,
  skip = false,
}: OnboardingQueueDataProps) {
  const [result, setResult] = useState<QueueResult | null>(null);

  useEffect(() => {
    if (skip) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const payload = await complianceBffPost<RegistrationQueueDto>(
          endpoint,
          buildQueueSearch(query),
        );
        if (!cancelled) {
          setResult(mapRegistrationQueue(payload));
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
  }, [endpoint, query, skip]);

  if (skip) {
    return (
      <OnboardingQueueTable
        result={{ rows: [], total: 0 }}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    );
  }

  if (!result) {
    return (
      <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-navy-muted">
        Calling Java portal via POST /api/compliance/{endpoint}
      </p>
    );
  }

  return (
    <>
      {result.error ? (
        <p className="rounded-2xl bg-[#fdecec] px-4 py-2.5 text-sm text-navy">
          {result.error}
        </p>
      ) : null}

      <OnboardingQueueTable
        result={result}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />

      {result.rows.length > 0 ? (
        <p className="text-sm text-navy-muted">
          Showing <strong className="text-navy">{result.rows.length}</strong> of{" "}
          <strong className="text-navy">{result.total}</strong> records
        </p>
      ) : null}
    </>
  );
}
