import "server-only";

import { ApiError } from "@/lib/api/errors";
import { complianceApi } from "@/lib/compliance/client";
import { logger } from "@/lib/logger";

import {
  mapBeneficiaryQueue,
  mapDataAnonQueue,
  mapPaymentInQueue,
  mapPaymentOutQueue,
  mapRegistrationQueue,
  mapTransactionQueue,
  mapTxnApiQueue,
  mapWorkEfficiency,
  readOrgLabels,
} from "../mappers";
import { buildQueueSearch } from "../search-body";
import type { QueueQuery, QueueResult } from "../types";

async function postQueue(
  load: () => Promise<unknown>,
  map: (payload: unknown) => QueueResult,
  label: string,
): Promise<QueueResult> {
  try {
    return map(await load());
  } catch (error) {
    logger.warn(
      `Queue fetch failed for ${label}: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return {
      rows: [],
      total: 0,
      error:
        error instanceof ApiError
          ? error.message
          : "Could not load this queue from the Java portal.",
    };
  }
}

export function getRegistrationQueue(query: QueueQuery = {}) {
  const body = buildQueueSearch(query);
  return postQueue(
    () => complianceApi.regQueue(body),
    mapRegistrationQueue,
    "/regQueue",
  );
}

export function getPaymentInQueue(query: QueueQuery = {}) {
  const body = buildQueueSearch(query);
  return postQueue(
    () => complianceApi.payInQueue(body),
    mapPaymentInQueue,
    "/payInQueue",
  );
}

export function getPaymentOutQueue(query: QueueQuery = {}) {
  const body = buildQueueSearch(query);
  return postQueue(
    () => complianceApi.paymentOutQueue(body),
    mapPaymentOutQueue,
    "/paymentOutQueue",
  );
}

export function getTransactionQueue(query: QueueQuery = {}) {
  const body = buildQueueSearch(query);
  return postQueue(
    () => complianceApi.transactionQueue(body),
    mapTransactionQueue,
    "/transactionQueue",
  );
}

export function getTxnApiQueue(query: QueueQuery = {}) {
  const body = buildQueueSearch(query);
  return postQueue(
    () => complianceApi.txnApiQueue(body),
    mapTxnApiQueue,
    "/txnApiQueue",
  );
}

export function getDataAnonQueue(query: QueueQuery = {}) {
  const body = buildQueueSearch(query);
  return postQueue(
    () => complianceApi.dataAnonQueue(body),
    mapDataAnonQueue,
    "/dataAnonQueue",
  );
}

export function getOnboardingReport(query: QueueQuery = {}) {
  const body = buildQueueSearch({ ...query, fromReport: true });
  return postQueue(
    () => complianceApi.regReportCriteria(body),
    mapRegistrationQueue,
    "/regReportCriteria",
  );
}

export function getTxnApiReport(query: QueueQuery = {}) {
  const body = buildQueueSearch({ ...query, fromReport: true });
  return postQueue(
    () => complianceApi.txnApiReport(body),
    mapTxnApiQueue,
    "/txnApiReport",
  );
}

export function getPaymentsReport(query: QueueQuery = {}) {
  const body = buildQueueSearch({ ...query, fromReport: true });
  return postQueue(
    () => complianceApi.transactionReport(body),
    mapTransactionQueue,
    "/transactionReport",
  );
}

export function getWorkEfficiencyReport(query: QueueQuery = {}) {
  const body = buildQueueSearch({ ...query, fromReport: true });
  return postQueue(
    () => complianceApi.workEfficiencyReport(body),
    mapWorkEfficiency,
    "/workEfficiencyReport",
  );
}

export function getBeneficiaryReport(query: QueueQuery = {}) {
  const body = buildQueueSearch({ ...query, fromReport: true });
  return postQueue(
    () => complianceApi.beneReportApply(body),
    mapBeneficiaryQueue,
    "/beneReportApply",
  );
}

export function getHolisticSearch(query: QueueQuery = {}) {
  const body = buildQueueSearch({ ...query, fromReport: true });
  return postQueue(
    () => complianceApi.regReportCriteria(body),
    mapRegistrationQueue,
    "/regReportCriteria",
  );
}

let orgCache: { names: string[]; at: number } | null = null;
const ORG_TTL_MS = 5 * 60 * 1000;

export async function getOrganizationNames(): Promise<string[]> {
  if (orgCache && Date.now() - orgCache.at < ORG_TTL_MS) {
    return orgCache.names;
  }
  try {
    const names = readOrgLabels(await complianceApi.organizations());
    orgCache = { names, at: Date.now() };
    return names;
  } catch (error) {
    logger.warn(
      `GET /organizations failed: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return orgCache?.names ?? [];
  }
}
