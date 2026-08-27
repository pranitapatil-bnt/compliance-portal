"use client";

import { routes } from "@/constants/routes";

import { OnboardingFilterBar } from "./onboarding-filter-bar";
import {
  OnboardingQueueData,
  type OnboardingQueueEndpoint,
} from "./onboarding-queue-data";
import { OnboardingQueueTable } from "./onboarding-queue-table";
import type { QueueQuery, QueueResult } from "../types";
import { useOrganizationNames } from "../use-organization-names";

type OnboardingQueueScreenProps = {
  query: QueueQuery;
  organizations?: string[];
  emptyTitle: string;
  emptyDescription: string;
  action?: string;
  endpoint?: OnboardingQueueEndpoint;
  skip?: boolean;
  result?: QueueResult;
};

export function OnboardingQueueScreen({
  query,
  organizations,
  emptyTitle,
  emptyDescription,
  action = routes.reg,
  endpoint = "reg-queue",
  skip = false,
  result,
}: OnboardingQueueScreenProps) {
  const loadedOrgs = useOrganizationNames();
  const orgNames = organizations ?? loadedOrgs;
  return (
    <div className="space-y-4">
      <OnboardingFilterBar
        query={query}
        organizations={orgNames}
        action={action}
      />
      {result ? (
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
              Showing <strong className="text-navy">{result.rows.length}</strong>{" "}
              of <strong className="text-navy">{result.total}</strong> records
            </p>
          ) : null}
        </>
      ) : (
        <OnboardingQueueData
          key={JSON.stringify({ endpoint, query, skip })}
          query={query}
          endpoint={endpoint}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          skip={skip}
        />
      )}
    </div>
  );
}
