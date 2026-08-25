import type { PageInfo, QueueFilter, QueueSearchRequest } from "./types";

export const emptyQueueFilter = (): QueueFilter => ({
  keyword: null,
  status: null,
  custType: null,
  organization: null,
  legalEntity: null,
  dateFrom: null,
  dateTo: null,
  kycStatus: null,
  blacklistStatus: null,
  sanctionStatus: null,
  fraugsterStatus: null,
  customCheckStatus: null,
  watchListStatus: null,
  buyCurrency: null,
  sellCurrency: null,
  source: null,
  transValue: null,
  newOrUpdatedRecord: null,
  owner: null,
});

export const defaultPage = (): PageInfo => ({
  currentPage: 1,
  minRecord: 1,
  maxRecord: 50,
  totalRecords: 0,
  totalPages: 0,
  pageSize: 50,
  currentRecord: null,
});

export function emptyQueueSearchRequest(): QueueSearchRequest {
  return {
    filter: emptyQueueFilter(),
    page: defaultPage(),
    isFilterApply: false,
    isRequestFromReportPage: false,
    isLandingPage: false,
    custType: null,
  };
}

export function withQueueDefaults(
  body?: Partial<QueueSearchRequest> | null,
): QueueSearchRequest {
  const defaults = emptyQueueSearchRequest();
  if (!body) {
    return defaults;
  }

  return {
    ...defaults,
    ...body,
    filter: { ...defaults.filter, ...body.filter },
    page: { ...defaults.page, ...body.page },
  };
}

export function portalBusinessError(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined;
  }
  const record = payload as { errorCode?: unknown; errorMessage?: unknown };
  const message =
    typeof record.errorMessage === "string" ? record.errorMessage.trim() : "";
  if (message.length > 0) {
    return message;
  }
  if (record.errorCode != null && record.errorCode !== "") {
    return String(record.errorCode);
  }
  return undefined;
}
