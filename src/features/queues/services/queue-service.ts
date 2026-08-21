import "server-only";

import { portalApiPost } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
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
} from "../mappers";
import { portalPaths } from "../paths";
import { buildQueueSearch } from "../search-body";
import type { QueueQuery, QueueResult } from "../types";

async function postQueue(
  path: string,
  query: QueueQuery,
  map: (payload: unknown) => QueueResult,
): Promise<QueueResult> {
  try {
    const payload = await portalApiPost(path, buildQueueSearch(query));
    return map(payload);
  } catch (error) {
    logger.warn(
      `Queue fetch failed for ${path}: ${error instanceof Error ? error.message : "unknown error"}`,
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
  return postQueue(portalPaths.regQueue, query, mapRegistrationQueue);
}

export function getPaymentInQueue(query: QueueQuery = {}) {
  return postQueue(portalPaths.payInQueue, query, mapPaymentInQueue);
}

export function getPaymentOutQueue(query: QueueQuery = {}) {
  return postQueue(portalPaths.paymentOutQueue, query, mapPaymentOutQueue);
}

export function getTransactionQueue(query: QueueQuery = {}) {
  return postQueue(portalPaths.transactionQueue, query, mapTransactionQueue);
}

export function getTxnApiQueue(query: QueueQuery = {}) {
  return postQueue(portalPaths.txnApiQueue, query, mapTxnApiQueue);
}

export function getDataAnonQueue(query: QueueQuery = {}) {
  return postQueue(portalPaths.dataAnonQueue, query, mapDataAnonQueue);
}

export function getOnboardingReport(query: QueueQuery = {}) {
  return postQueue(
    portalPaths.regReport,
    { ...query, fromReport: true },
    mapRegistrationQueue,
  );
}

export function getTxnApiReport(query: QueueQuery = {}) {
  return postQueue(
    portalPaths.txnApiReport,
    { ...query, fromReport: true },
    mapTxnApiQueue,
  );
}

export function getPaymentsReport(query: QueueQuery = {}) {
  return postQueue(
    portalPaths.transactionReport,
    { ...query, fromReport: true },
    mapTransactionQueue,
  );
}

export function getWorkEfficiencyReport(query: QueueQuery = {}) {
  return postQueue(
    portalPaths.workEfficiency,
    { ...query, fromReport: true },
    mapWorkEfficiency,
  );
}

export function getBeneficiaryReport(query: QueueQuery = {}) {
  return postQueue(
    portalPaths.beneReport,
    { ...query, fromReport: true },
    mapBeneficiaryQueue,
  );
}

export function getHolisticSearch(query: QueueQuery = {}) {
  return postQueue(
    portalPaths.regReport,
    { ...query, fromReport: true },
    mapRegistrationQueue,
  );
}
